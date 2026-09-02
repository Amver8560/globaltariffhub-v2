// ─────────────────────────────────────────────────────────────
// GTH — Registro de consentimiento (server-side, service-role)
//
// La evidencia de consentimiento se genera SIEMPRE server-side.
// Fuente de verdad del ESTADO ACTUAL: public.user_consents.
// Historial: public.consent_events (append-only).
//
// - recordConsent(): consentimiento del alta. Idempotente ante el
//   reintento de /api/register (usa un occurred_at estable = fecha de
//   creación de user_consents, y ON CONFLICT DO NOTHING sobre
//   idx_consent_events_once).
// - setMarketingConsent(): ÚNICO escritor del consentimiento de
//   comunicaciones (dashboard, enlace de baja de emails, alta de
//   waitlist). Registra CADA transición real en consent_events; si el
//   estado ya coincide, es no-op total (no toca user_consents ni
//   consent_events). Nunca toca terms/privacy/legal. Nunca crea filas
//   en subscribers.
// ─────────────────────────────────────────────────────────────
import { createAdminClient } from "@/lib/supabase/admin";
import { LEGAL_VERSIONS } from "@/lib/legalVersions";
import type { SupabaseClient } from "@supabase/supabase-js";

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
 * Idempotencia: los eventos del alta se timestampean con
 * `user_consents.created_at` (estable entre la llamada inicial y el
 * reintento) y se insertan con ignoreDuplicates contra
 * idx_consent_events_once (user_id, document, document_version, action,
 * occurred_at) → ON CONFLICT DO NOTHING atómico.
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
  //    Devolvemos created_at para usarlo como occurred_at estable.
  const { data: uc, error: ucErr } = await admin
    .from("user_consents")
    .upsert(
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
    )
    .select("created_at")
    .single();
  if (ucErr) throw new Error(`user_consents upsert: ${ucErr.message}`);

  const occurredAt = uc?.created_at ?? now;

  // 2. Historial del alta. 3 legales + marketing (si opta).
  //    ignoreDuplicates → ON CONFLICT DO NOTHING sobre idx_consent_events_once.
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
    occurred_at: occurredAt,
    ...attribution,
  }));

  if (payload.marketing) {
    rows.push({
      user_id: userId,
      document: "marketing",
      action: "accepted",
      document_version: LEGAL_VERSIONS.marketing,
      occurred_at: occurredAt,
      ...attribution,
    });
  }

  const { error: ceErr } = await admin
    .from("consent_events")
    .upsert(rows, {
      onConflict: "user_id,document,document_version,action,occurred_at",
      ignoreDuplicates: true,
    });
  if (ceErr) throw new Error(`consent_events upsert: ${ceErr.message}`);
}

// ─────────────────────────────────────────────────────────────
// setMarketingConsent — único escritor del consentimiento de marketing
// ─────────────────────────────────────────────────────────────
export type MarketingSource = "dashboard" | "email_link" | "waitlist";

export interface SetMarketingConsentOpts {
  enabled: boolean;
  source: MarketingSource;
  userId?: string | null;
  email?: string | null;
}

export interface SetMarketingConsentResult {
  ok: boolean;
  code?: "not_found";
  /** true si hubo un cambio de estado real en algún almacén (se registró evento). */
  changed: boolean;
  /** estado final del consentimiento de la cuenta; null si el email no tiene cuenta. */
  marketing_consent: boolean | null;
  applied: { user_consents: boolean; consent_events: boolean; subscribers: boolean };
}

async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) return null;
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export async function setMarketingConsent(
  opts: SetMarketingConsentOpts
): Promise<SetMarketingConsentResult> {
  const admin = createAdminClient();
  const { enabled, source } = opts;
  const now = new Date().toISOString();
  const result: SetMarketingConsentResult = {
    ok: false,
    changed: false,
    marketing_consent: null,
    applied: { user_consents: false, consent_events: false, subscribers: false },
  };

  // ── Resolver identidad ──────────────────────────────────────
  let userId = opts.userId ?? null;
  let email = opts.email?.trim() || null;

  if (userId && !email) {
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data?.user?.email ?? null;
  }
  if (!userId && email) {
    userId = await findUserIdByEmail(admin, email);
  }

  // Fila de subscribers (si existe) — nunca se crea acá.
  let subRow: { id: number; status: string } | null = null;
  if (email) {
    const { data } = await admin
      .from("subscribers")
      .select("id,status")
      .ilike("email", email)
      .maybeSingle();
    subRow = data ?? null;
  }

  if (!userId && !subRow) {
    result.code = "not_found";
    return result;
  }

  // ── 1. Consentimiento de la CUENTA (user_consents + consent_events) ──
  if (userId) {
    const { data: uc } = await admin
      .from("user_consents")
      .select("marketing_consent")
      .eq("user_id", userId)
      .maybeSingle();
    const current = uc?.marketing_consent ?? false;

    if (current !== enabled) {
      // Historial PRIMERO: si algo falla, no dejamos user_consents desincronizado
      // del log (un evento huérfano se reconcilia en el próximo intento; un
      // estado sin evento perdería la transición del historial).
      const { error: ceErr } = await admin.from("consent_events").insert({
        user_id: userId,
        document: "marketing",
        action: enabled ? "accepted" : "revoked",
        document_version: LEGAL_VERSIONS.marketing,
        occurred_at: now,
        signup_source: source,
      });
      if (ceErr) throw new Error(`consent_events insert: ${ceErr.message}`);
      result.applied.consent_events = true;

      const { error: ucErr } = await admin.from("user_consents").upsert(
        {
          user_id: userId,
          marketing_consent: enabled,
          marketing_consent_at: now,
          marketing_version: LEGAL_VERSIONS.marketing,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
      if (ucErr) throw new Error(`user_consents upsert: ${ucErr.message}`);
      result.applied.user_consents = true;
      result.changed = true;
    }
    result.marketing_consent = enabled;
  }

  // ── 2. subscribers — SOLO si ya existe fila. Nunca crea. ─────
  if (subRow) {
    const targetStatus = enabled ? "pending" : "unsubscribed";
    if (subRow.status !== targetStatus) {
      const patch: Record<string, unknown> = { status: targetStatus, updated_at: now };
      if (enabled) {
        patch.consent_at = now;
        patch.unsubscribed_at = null;
      } else {
        patch.unsubscribed_at = now;
      }
      const { error: sErr } = await admin.from("subscribers").update(patch).eq("id", subRow.id);
      if (sErr) throw new Error(`subscribers update: ${sErr.message}`);
      result.applied.subscribers = true;
      result.changed = true;
    }
  }

  result.ok = true;
  return result;
}
