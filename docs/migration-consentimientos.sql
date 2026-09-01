-- ═══════════════════════════════════════════════════════════════
-- GTH — Migración: consentimientos + interesados
-- Ejecutar en: Supabase Dashboard → SQL Editor (una sola vez)
-- Idempotente: usa IF NOT EXISTS / CREATE OR REPLACE en todo lo posible.
-- Revisión final: sin IP/UA · sin tabla de fallos · ON DELETE CASCADE
--   · append-only por trigger de UPDATE + REVOKE
--   · idempotencia atómica por índice único (no parcial)
--   · marketing versionado
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS citext;

-- Helper: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;


-- ───────────────────────────────────────────────────────────────
-- TABLA 1: consent_events — historial de consentimiento (append-only)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_events (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document         TEXT NOT NULL CHECK (document IN ('terms','privacy','legal','marketing')),
  action           TEXT NOT NULL CHECK (action IN ('accepted','revoked')),
  document_version TEXT NOT NULL,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  signup_source    TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_events_user
  ON public.consent_events (user_id, document, occurred_at DESC);

-- Idempotencia atómica del alta y de las transiciones de estado:
-- un único evento por (usuario, documento, versión, acción).
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_events_once
  ON public.consent_events (user_id, document, document_version, action);

-- Append-only: bloquea UPDATE de filas históricas. NO bloquea DELETE,
-- para que el ON DELETE CASCADE de la baja de cuenta funcione.
CREATE OR REPLACE FUNCTION public.consent_events_no_update()
RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'consent_events es append-only: UPDATE no permitido'; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consent_events_no_update ON public.consent_events;
CREATE TRIGGER consent_events_no_update
  BEFORE UPDATE ON public.consent_events
  FOR EACH ROW EXECUTE FUNCTION public.consent_events_no_update();

ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consent_events_select_own ON public.consent_events;
CREATE POLICY consent_events_select_own ON public.consent_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Sin políticas de escritura → sólo service_role.

REVOKE UPDATE, DELETE ON public.consent_events FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────
-- TABLA 2: user_consents — estado actual (fuente de verdad), 1 fila/usuario
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_consents (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_accepted_at    TIMESTAMPTZ,
  terms_version        TEXT,
  privacy_accepted_at  TIMESTAMPTZ,
  privacy_version      TEXT,
  legal_accepted_at    TIMESTAMPTZ,
  legal_version        TEXT,
  marketing_consent    BOOLEAN NOT NULL DEFAULT false,
  marketing_consent_at TIMESTAMPTZ,
  marketing_version    TEXT,
  signup_source        TEXT,
  utm_source           TEXT,
  utm_medium           TEXT,
  utm_campaign         TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS user_consents_updated_at ON public.user_consents;
CREATE TRIGGER user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_consents_select_own ON public.user_consents;
CREATE POLICY user_consents_select_own ON public.user_consents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Sin políticas de escritura → sólo service_role.


-- ───────────────────────────────────────────────────────────────
-- TABLA 3: subscribers — interesados sin cuenta ("Próximo lanzamiento")
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscribers (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email             CITEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','unsubscribed','bounced')),
  source            TEXT,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  consent_at        TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  unsubscribed_at   TIMESTAMPTZ,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsub_token
  ON public.subscribers (unsubscribe_token);

DROP TRIGGER IF EXISTS subscribers_updated_at ON public.subscribers;
CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- Sin políticas → sólo service_role (evita harvesting de la lista).


-- ───────────────────────────────────────────────────────────────
-- Vista admin (sólo service_role)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.admin_consent_overview
WITH (security_invoker = true) AS
SELECT u.id AS user_id, u.email, u.created_at AS signup_at,
       c.terms_accepted_at, c.terms_version,
       c.privacy_accepted_at, c.privacy_version,
       c.legal_accepted_at, c.legal_version,
       c.marketing_consent, c.marketing_consent_at, c.marketing_version,
       c.signup_source, c.utm_source, c.utm_medium, c.utm_campaign
FROM auth.users u
LEFT JOIN public.user_consents c ON c.user_id = u.id;

REVOKE ALL ON public.admin_consent_overview FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────
-- GRANTS / REVOKES de privilegios de tabla
--
-- El SQL Editor de Supabase NO auto-otorga DML a service_role/authenticated
-- al crear por SQL crudo. Además, pg_default_acl del proyecto otorga
-- REFERENCES/TRIGGER/TRUNCATE a anon/authenticated/service_role en toda
-- tabla nueva de public. Este bloque deja el privilegio mínimo exacto:
--   · service_role  → SELECT, INSERT, UPDATE, DELETE (sin TRUNCATE/REFERENCES/TRIGGER)
--   · authenticated → sólo SELECT en consent_events y user_consents
--   · anon          → nada
-- No toca policies ni RLS. Idempotente.
-- ───────────────────────────────────────────────────────────────

-- Reset total de los tres roles sobre las tres tablas.
REVOKE ALL ON public.consent_events FROM anon, authenticated, service_role;
REVOKE ALL ON public.user_consents  FROM anon, authenticated, service_role;
REVOKE ALL ON public.subscribers    FROM anon, authenticated, service_role;

-- service_role: sólo la DML que usa el código server-side.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_consents  TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers    TO service_role;

-- authenticated: sólo lectura de lo propio (habilita las policies *_select_own).
GRANT SELECT ON public.consent_events TO authenticated;
GRANT SELECT ON public.user_consents  TO authenticated;

-- Vista admin: sólo service_role.
GRANT SELECT ON public.admin_consent_overview TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- Verificación rápida tras ejecutar:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public'
--     AND table_name IN ('consent_events','user_consents','subscribers');
-- ═══════════════════════════════════════════════════════════════
