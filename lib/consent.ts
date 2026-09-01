// ─────────────────────────────────────────────────────────────
// GTH — Registro de consentimiento (server-side, service-role)
//
// La evidencia de consentimiento se genera SIEMPRE server-side.
// recordConsent es idempotente: correrla 1 o N veces deja el mismo
// estado, sin filas duplicadas. /api/register la reintenta una vez
// y, si vuelve a fallar, deshace la creación del usuario.
//
// Fuente de verdad del ESTADO ACTUAL: public.user_consents.
// Historial: public.consent_events (append-only).
// ─────────────────────────────────────────────────────────────
import { createAdminClient } from "@/lib/supabase/admin";
import { LEGAL_VERSIONS } from "@/lib/legalVersions";

export interface ConsentPayload {
  marketing: boolean;
  signup_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const LEGAL_DOCS = ["terms", "privacy", "legal"] as const;

/**
 * Registra el consentimiento del alta. Lanza si alguna escritura falla,
 * para que /api/register aplique el reintento + compensación.
 *
 * Idempotencia:
 *  - user_consents: upsert por PK user_id.
 *  - consent_events: upsert con ignoreDuplicates contra el índice único
 *    idx_consent_events_once (user_id, document, document_version, action).
 *    El "no dupliqués" lo resuelve Postgres de forma atómica
 *    (ON CONFLICT DO NOTHING), no un SELECT previo → seguro ante carreras.
 *
 * LIMITACIÓN documentada: una vez existe un evento para la cuaterna
 * (usuario, documento, versión, acción), no se registra otro idéntico.
 * Sólo afecta el caso revocar → volver a consentir la MISMA versión de
 * marketing: user_consents (fuente de verdad del estado actual) sí refleja
 * la reconsentimiento con su fecha; consent_events no agrega un nuevo
 * `accepted`. Un cambio de texto de marketing = versión nueva = sí se
 * registra el `accepted`.
 */
export async function recordConsent(userId: string, payload: ConsentPayload): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const attribution = {
    signup_source: payload.signup_source,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
  };

  // 1. Estado actual — fuente de verdad. Idempotente por PK.
  const { error: ucErr } = await admin.from("user_consents").upsert(
    {
      user_id: userId,
      terms_accepted_at: now,
      terms_version: LEGAL_VERSIONS.terms,
      privacy_accepted_at: now,
      privacy_version: LEGAL_VERSIONS.privacy,
      legal_accepted_at: now,
      legal_version: LEGAL_VERSIONS.legal,
      marketing_consent: payload.marketing,
      marketing_consent_at: payload.marketing ? now : null,
      marketing_version: payload.marketing ? LEGAL_VERSIONS.marketing : null,
      ...attribution,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (ucErr) throw new Error(`user_consents upsert: ${ucErr.message}`);

  // 2. Historial. Las 3 aceptaciones legales + marketing (si corresponde).
  //    ignoreDuplicates → ON CONFLICT DO NOTHING sobre el índice parcial único.
  type ConsentEventRow = {
    user_id: string;
    document: string;
    action: "accepted";
    document_version: string;
    occurred_at: string;
    signup_source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  };

  const rows: ConsentEventRow[] = LEGAL_DOCS.map((doc) => ({
    user_id: userId,
    document: doc,
    action: "accepted",
    document_version: LEGAL_VERSIONS[doc],
    occurred_at: now,
    ...attribution,
  }));

  if (payload.marketing) {
    rows.push({
      user_id: userId,
      document: "marketing",
      action: "accepted",
      document_version: LEGAL_VERSIONS.marketing,
      occurred_at: now,
      ...attribution,
    });
  }

  const { error: ceErr } = await admin
    .from("consent_events")
    .upsert(rows, { onConflict: "user_id,document,document_version,action", ignoreDuplicates: true });
  if (ceErr) throw new Error(`consent_events upsert: ${ceErr.message}`);
}
