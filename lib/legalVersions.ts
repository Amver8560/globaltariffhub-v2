// ─────────────────────────────────────────────────────────────
// GTH — Versiones de los documentos legales / de consentimiento
// Fuente de verdad única. Al editar un documento, subir su string
// (fecha ISO del cambio). El alta guarda la versión vigente junto
// con cada aceptación en consent_events / user_consents.
// ─────────────────────────────────────────────────────────────

export const LEGAL_VERSIONS = {
  terms: "2026-06-01",
  privacy: "2026-06-01",
  legal: "2026-06-01",
  marketing: "2026-09-01",
} as const;

export type LegalDocument = keyof typeof LEGAL_VERSIONS;

// Texto exacto asociado a la versión vigente del consentimiento de comunicaciones.
// Si cambia el texto, subir LEGAL_VERSIONS.marketing.
export const MARKETING_CONSENT_TEXT =
  "Quiero recibir novedades de Global Tariff Hub, contenidos de la Biblioteca Digital GTH y avisos sobre su lanzamiento.";
