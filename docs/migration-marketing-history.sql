-- ═══════════════════════════════════════════════════════════════
-- GTH — Marketing: historial completo en consent_events
--
-- Agrega occurred_at al índice único idx_consent_events_once.
--   · Los eventos del ALTA (recordConsent) se timestampean con
--     user_consents.created_at → estable entre la llamada inicial y el
--     reintento de /api/register → siguen chocando (ON CONFLICT DO NOTHING)
--     → idempotencia intacta. terms/privacy/legal sin cambio de conducta.
--   · Las transiciones de marketing (dashboard / enlace de baja / waitlist)
--     usan occurred_at = now() → cada ON→OFF→ON queda como fila propia.
--
-- Envuelto en transacción: si el CREATE falla, el DROP se revierte y la
-- tabla nunca queda sin el índice.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor. NO EJECUTADA.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

DROP INDEX IF EXISTS public.idx_consent_events_once;

CREATE UNIQUE INDEX idx_consent_events_once
  ON public.consent_events
  (user_id, document, document_version, action, occurred_at);

COMMIT;

-- Verificación:
--   select indexdef from pg_indexes
--   where schemaname='public' and indexname='idx_consent_events_once';
--   -- debe incluir (user_id, document, document_version, action, occurred_at)
