# Propuesta técnica — Consentimientos y base de emails

**Estado:** aprobada conceptualmente (Opción A · `POST /api/register` server-side) con dos ajustes finales incorporados abajo.
**Fecha:** 2026-09-01
**NO EJECUTADA** — pendiente de aprobación final para implementar.

No toca Home, SEO, Biblioteca, módulos, metadata ni diseño.

---

## Decisiones aplicadas

| # | Decisión |
|---|---|
| 1 | `consent_events` **sin `ip` ni `user_agent`**. No se amplía la recopilación de datos personales. |
| 2 | Se mantienen `consent_events`, `user_consents`, `subscribers`. |
| 3 | **Sin `consent_write_failures`, sin cron/cola, sin `raw_user_meta_data` como fuente de verdad.** El caso "usuario creado pero `recordConsent` falla" se resuelve con: reintento inmediato idempotente server-side → si vuelve a fallar, **deshacer la creación del usuario** (`admin.deleteUser`) y devolver error controlado + log. Ver sección 2. |
| 4 | Marketing versionado: `marketing = "2026-09-01"` atado al texto exacto. Columna `marketing_version` en `user_consents`. |
| 5 | **`consent_events.user_id` → `ON DELETE CASCADE`** (igual que `user_consents`). Al eliminar la cuenta se borran estado actual e historial. Sin filas huérfanas, sin UTM desvinculados, sin "evidencia anónima". La **retención post-baja** (conservar prueba de consentimiento más allá de la eliminación) queda **explícitamente como decisión futura**, en tarea separada. |
| 6 | `subscribers`: `email` único case-insensitive, estados `pending/confirmed/unsubscribed/bounced`, timestamps, `source`+UTM, `unsubscribe_token`. Persistir **antes** de Resend. |
| 7 | Escritura de consentimiento exclusivamente server-side con service-role. RLS restrictivo (usuarios sólo `SELECT` de lo propio; cero políticas de escritura). |
| 8 | Hueco RLS de `profiles` (**SEC-1**, prioridad alta, antes de la apertura pública) y bug de policy de `consultations` (**SEC-2**, verificar después) — tareas independientes, no se tocan acá. |
| 9 | Home, SEO, Biblioteca, módulos y diseño sin cambios. |

---

## 1. Migración SQL final (sin ejecutar)

```sql
-- ═══════════════════════════════════════════════════════════════
-- GTH — Migración FINAL: consentimientos + interesados
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Fecha propuesta: 2026-09-01 · NO EJECUTADA — pendiente de aprobación
-- Revisión: sin IP/UA · sin tabla de fallos · consent_events ON DELETE CASCADE
--           · append-only por trigger de UPDATE + REVOKE · marketing versionado
--           · idempotencia por índice parcial + NOT EXISTS
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS citext;

-- Helper: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;


-- ───────────────────────────────────────────────────────────────
-- TABLA 1: consent_events — bitácora append-only (historial de consentimiento)
--   · Sin IP ni user_agent.
--   · ON DELETE CASCADE: el historial se elimina junto con la cuenta.
--   · Append-only: trigger bloquea UPDATE; DELETE sólo ocurre por el
--     CASCADE de la baja de cuenta (no hay ruta de DELETE en la app).
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

-- Idempotencia atómica: un único evento por (usuario, documento, versión, acción).
-- Índice NO parcial → PostgREST puede usarlo como árbitro de ON CONFLICT DO NOTHING.
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_events_once
  ON public.consent_events (user_id, document, document_version, action);

-- Append-only: bloquea edición de filas históricas. NO bloquea DELETE,
-- para que el ON DELETE CASCADE de la baja de cuenta funcione.
CREATE OR REPLACE FUNCTION public.consent_events_no_update()
RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'consent_events es append-only: UPDATE no permitido'; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_events_no_update
  BEFORE UPDATE ON public.consent_events
  FOR EACH ROW EXECUTE FUNCTION public.consent_events_no_update();

ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY consent_events_select_own ON public.consent_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Sin políticas de escritura → sólo service_role.

-- Defensa en profundidad: ni anon ni authenticated pueden mutar el historial.
REVOKE UPDATE, DELETE ON public.consent_events FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────
-- TABLA 2: user_consents — estado actual, 1 fila por usuario
--   Tabla propia (NO columnas en profiles). ON DELETE CASCADE.
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

CREATE TRIGGER user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_consents_select_own ON public.user_consents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Sin políticas de escritura → sólo service_role.


-- ───────────────────────────────────────────────────────────────
-- TABLA 3: subscribers — interesados sin cuenta ("Próximo lanzamiento")
--   Sin FK a auth.users. Ciclo de vida independiente de las cuentas.
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscribers (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email             CITEXT NOT NULL UNIQUE,          -- único, case-insensitive nativo
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

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- Sin políticas → sólo service_role (evita harvesting de la lista).


-- ───────────────────────────────────────────────────────────────
-- Vista admin (sólo service_role) para inspección
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
```

### Constraints e índices

- **PK:** `consent_events.id`, `user_consents.user_id`, `subscribers.id`.
- **FK (todas `ON DELETE CASCADE`):** `consent_events → auth.users`, `user_consents → auth.users`. `subscribers` sin FK.
- **UNIQUE:** `consent_events (user_id, document, document_version)` parcial (`accepted` + 3 legales) → idempotencia del alta; `subscribers.email` (citext); `subscribers.unsubscribe_token`.
- **CHECK:** `document`, `action`, `status`.
- **Triggers:** `set_updated_at` (user_consents, subscribers); `consent_events_no_update` (bloquea UPDATE; permite el DELETE del CASCADE).
- **REVOKE:** `UPDATE, DELETE ON consent_events` para `anon`/`authenticated`.

### RLS

| Tabla | anon | authenticated | service_role |
|---|---|---|---|
| `consent_events` | — | `SELECT` filas propias | todo |
| `user_consents` | — | `SELECT` fila propia | todo |
| `subscribers` | — | — | todo |
| `admin_consent_overview` | REVOKE | REVOKE | SELECT |

---

## 2. Comportamiento exacto si `recordConsent` falla tras crear el usuario (ajuste 1)

**Principio:** la evidencia de consentimiento se genera **siempre server-side**. `raw_user_meta_data` no es fuente de verdad ni cola de recuperación. No hay cron ni cola.

### `recordConsent(userId, payload)` — idempotente por diseño

Con el service-role admin client, en este orden:

1. `UPSERT` en `user_consents` (PK `user_id`): los 3 `*_accepted_at`/`*_version`, `marketing_consent = !!payload.marketing`, `marketing_consent_at = payload.marketing ? now() : null`, `marketing_version = payload.marketing ? '2026-09-01' : null`, `signup_source`, `utm_*`, `updated_at = now()`. Idempotente por PK.
2. `UPSERT` de las filas de `consent_events` (`terms`/`privacy`/`legal` + `marketing` si `payload.marketing === true`), `action = 'accepted'`, `document_version` desde `LEGAL_VERSIONS`, `occurred_at = now()`, con **`ignoreDuplicates: true`** → PostgREST emite `INSERT … ON CONFLICT (user_id, document, document_version, action) DO NOTHING` contra `idx_consent_events_once`. **Atómico**: no hay `SELECT` previo, no hay ventana de carrera. Dos `/api/register` concurrentes para el mismo usuario no pueden crear filas duplicadas.

Ejecutar `recordConsent` 1 o N veces deja el mismo estado, sin duplicados.

**Limitación (ajuste 2 — autorizada explícitamente):** el índice `idx_consent_events_once` es sobre `(user_id, document, document_version, action)` sin cláusula parcial. Una vez existe un evento para esa cuaterna, no se registra otro idéntico. Sólo afecta el caso **revocar → volver a consentir la MISMA versión de marketing**: `user_consents` (fuente de verdad del estado actual) sí refleja la reconsentimiento con su fecha; `consent_events` no agrega un segundo `accepted`. Un cambio de texto de marketing sube la versión y por lo tanto sí se registra el nuevo `accepted`.

### Flujo de `/api/register` ante el fallo

```
signUp OK → userId en mano

intento 1:  await recordConsent(userId, payload)
  └─ throw → console.warn("recordConsent failed, retrying", { userId })
             await new Promise(r => setTimeout(r, 250))          // micro-espera
             intento 2:  await recordConsent(userId, payload)     // misma llamada idempotente
               └─ throw → console.error("recordConsent failed after retry",
                            { userId, email, err: String(err) })  // structured log → Vercel
                          ── compensación ──
                          await supabaseAdmin.auth.admin.deleteUser(userId)
                            ├─ OK   → 503 { ok:false, code:"CONSENT_PERSIST_FAILED",
                            │             error:"No pudimos completar el registro.
                            │                    Probá de nuevo en unos minutos." }
                            │         (la cuenta ya no existe; el reintento del usuario
                            │          es un alta limpia; invariante: cuenta ⇔ consentimiento)
                            └─ throw → console.error("orphan user without consent — manual cleanup",
                                          { userId, email })
                                       500 { ok:false, code:"REGISTRATION_INCOMPLETE",
                                             error:"Tu cuenta se creó pero hubo un problema.
                                                    Escribinos a analia@globaltariffhub.com." }
                                       (doble fallo, muy raro; explícito y logueado con userId,
                                        nunca silencioso)

intento 1 o 2 OK → 200 { ok:true, session: !!data.session }
```

- **No** se escribe ninguna marca en `raw_user_meta_data`. El `signUp` sólo lleva `options.data = { full_name, signup_source, utm_source, utm_medium, utm_campaign }` (como hoy) — **sin** objeto `consent`.
- **Invariante garantizada:** una cuenta utilizable existe si y sólo si su consentimiento quedó registrado server-side. El único hueco posible (usuario creado + `recordConsent` falla dos veces + `deleteUser` falla) queda logueado con `userId`/`email` y devuelve un error explícito para resolución manual — sin cola, sin infraestructura nueva.
- `/api/register` usa el **SSR server client** (`@/lib/supabase/server`) para el `signUp`, de modo que la cookie de sesión se setea en la respuesta y el cliente puede hacer `router.push("/dashboard")`.

### Cliente `/register` — manejo de respuestas

| Respuesta | UI |
|---|---|
| `200 { ok:true, session:true }` | `router.push("/dashboard"); router.refresh()` (estado actual, confirmación OFF) |
| `200 { ok:true, session:false }` | Pantalla "¡Cuenta creada! confirmá tu email" + botón Reenviar (igual que hoy) |
| `503 CONSENT_PERSIST_FAILED` | Error "No pudimos completar el registro. Probá de nuevo." Form queda completo, botón re-habilitado. El reintento es un alta nueva y limpia (el usuario fue borrado). |
| `500 REGISTRATION_INCOMPLETE` | Mensaje de contacto a `analia@globaltariffhub.com`. |
| `4xx` de `signUp` | Mismo mapeo de mensajes que hoy. |

---

## 3. Flujo final de registro (Opción A — `POST /api/register`)

1. `/register`, opcionalmente con `?utm_source=linkedin&utm_medium=social&utm_campaign=lanzamiento`.
2. Nombre, email, contraseña. **3 checkboxes obligatorios** (botón deshabilitado hasta los 3). **4º checkbox opcional, desmarcado por defecto**, texto exacto:
   > "Quiero recibir novedades de Global Tariff Hub, contenidos de la Biblioteca Digital GTH y avisos sobre su lanzamiento."
3. Submit → `POST /api/register`:
   ```json
   { "email":"…", "password":"…", "name":"…",
     "consents": { "terms": true, "privacy": true, "legal": true },
     "marketing": false,
     "signup_source":"linkedin", "utm_source":"linkedin",
     "utm_medium":"social", "utm_campaign":"lanzamiento" }
   ```
4. La ruta valida: contraseña ≥ 8; `terms && privacy && legal` los tres `true`. Si falta uno → `400`, **no se crea nada**.
5. `supabaseServer.auth.signUp({ email, password, options:{ data:{ full_name, signup_source, utm_source, utm_medium, utm_campaign }, emailRedirectTo }})` — **sin** objeto `consent` en `data`.
   - Error → mapeo de mensajes de hoy → `4xx` JSON. Nada más se persiste.
6. `userId = data.user.id` (presente con o sin `data.session`).
7. `recordConsent(userId, payload)` con reintento + compensación según la **sección 2**.
8. Si `recordConsent` quedó OK → `200 { ok:true, session: !!data.session }`.
9. Cliente: según la tabla de la sección 2.
10. 4º checkbox sin marcar → sin fila `marketing`, `marketing_consent = false`. Nunca bloquea crear cuenta ni usar GTH.

**Revocación de marketing (post-alta):** toggle en dashboard → `POST /api/consent/marketing { enabled:false }` → service-role: `INSERT consent_events (marketing,'revoked','2026-09-01',now)` + `UPDATE user_consents SET marketing_consent=false, marketing_consent_at=now`. Reactivar = otra fila `accepted`. (Fase 2, no imprescindible para el alta.)

---

## 4. Eliminación de cuenta y retención (ajuste 2)

**Alternativa técnica adoptada — la más simple y coherente:**

`admin.auth.admin.deleteUser(userId)` dispara `ON DELETE CASCADE` en:

- `public.profiles` — ya tenía CASCADE.
- `public.user_consents` — estado actual eliminado.
- `public.consent_events` — historial de consentimiento eliminado.

Resultado: **no quedan filas huérfanas, ni UTM desvinculados, ni "evidencia anónima".** El consentimiento existe exactamente mientras existe la cuenta. `subscribers` no se toca (sin FK; su ciclo de vida es independiente — `unsubscribe` es un cambio de `status`, nunca un `DELETE`).

**Retención post-baja = decisión futura, explícita, no resuelta ahora.** Si más adelante se determina que hace falta conservar prueba de consentimiento más allá de la eliminación de la cuenta (defensa ante un reclamo, requerimiento de autoridad), se implementará como un **paso de archivado/export ANTES de `deleteUser`**, en una tarea independiente y con su propia base jurídica. Esta implementación no incorpora ninguna política de conservación.

---

## 5. Archivos de código (Opción A)

| Archivo | Acción |
|---|---|
| `lib/legalVersions.ts` | **NUEVO** — `LEGAL_VERSIONS = { terms:"2026-06-01", privacy:"2026-06-01", legal:"2026-06-01", marketing:"2026-09-01" }` + `MARKETING_CONSENT_TEXT` (string exacto). |
| `lib/consent.ts` | **NUEVO** — `recordConsent(userId, payload)` idempotente (upsert + `ON CONFLICT DO NOTHING` + `NOT EXISTS` para marketing). Sin `ensureSignupConsent`. |
| `app/api/register/route.ts` | **NUEVO** — valida; `signUp` con el SSR server client; `recordConsent` con reintento + compensación (`deleteUser`) + logs; respuestas `200 / 503 / 500 / 4xx`. |
| `app/register/page.tsx` | **MODIFICAR** — 4º checkbox opcional; estado `marketing`; `fetch("/api/register")` en vez de `supabase.auth.signUp` directo; manejo de `503`/`500`; UI/badges/pantalla de éxito sin cambios. |
| `app/api/subscribe/route.ts` | **MODIFICAR** — `UPSERT` en `subscribers` (`ON CONFLICT (email) DO UPDATE`) vía service-role **antes** de llamar a Resend; el `200` no depende de Resend; agrega `source`/`utm_*` al body. |
| `app/api/unsubscribe/route.ts` | **NUEVO** — `GET ?token=<uuid>` → `status='unsubscribed'`, `unsubscribed_at=now()`. |
| Form del "Coming Soon" | **MODIFICAR mínimo** — pasar `source` + `utm_*` en el POST. |
| `docs/supabase-migrations.sql` | **MODIFICAR** — append del bloque SQL (documentación; corrida manual en el SQL Editor). |

**No se modifica `lib/credits.ts`.** **No se tocan:** Home, `HomeContent.tsx`, SEO (`layout.tsx`, `robots.ts`, `sitemap.ts`, metadata), Biblioteca, módulos 1–4, `middleware.ts`, `auth/callback`.

---

## 6. Tareas de seguridad independientes (NO se ejecutan en esta implementación)

### SEC-1 — RLS de `public.profiles` permite escalada de privilegios · PRIORIDAD ALTA · antes de la apertura pública

`"Users can update own profile"` es `FOR UPDATE USING (auth.uid() = id)` sin `WITH CHECK` ni restricción de columnas → un usuario autenticado puede `PATCH` sus columnas `is_pro`, `credits_used`, `plan`, `plan_expires_at`, `stripe_*` vía el endpoint REST → créditos infinitos / Pro gratis.

Fix a validar por separado: `REVOKE UPDATE ON public.profiles FROM authenticated; GRANT UPDATE (full_name) ON public.profiles TO authenticated;` + migrar el `UPDATE credits_used` de `lib/credits.ts` a `createAdminClient()`. Requiere pruebas del flujo de créditos. Tarea independiente, posterior a esta implementación y previa a la apertura pública.

### SEC-2 — Policy inválida en `supabase-setup.sql` (`consultations`) · verificar después

`CREATE POLICY "Users can insert own consultations" ON public.consultations INSERT WITH CHECK (…)` — falta `FOR`. Sentencia inválida; probablemente falló al correr el setup, dejando `consultations` con RLS habilitado y sin política de INSERT. Fix: `CREATE POLICY … FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`. La tabla aún no se usa en el código.
