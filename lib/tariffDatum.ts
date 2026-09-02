// ─────────────────────────────────────────────────────────────
// GTH — Bloque 2 · TariffDatum
//
// Estructura canónica de una tasa arancelaria resuelta. Toda tasa
// mostrada o usada en un cálculo debe pasar por acá.
//
// El resolver termina EXCLUSIVAMENTE en uno de tres estados:
//   · "determined"     — información suficientemente aplicable para
//                        sostener la tasa mostrada, dentro del alcance de GTH.
//   · "referential"    — información útil (p. ej. HS6 multilateral) pero
//                        insuficiente para presentarla como tasa definitiva
//                        de la línea nacional/regional aplicable.
//   · "not_determined" — GTH no dispone de información suficiente.
//
// Ningún estado se eleva artificialmente para permitir que continúe un
// cálculo. GTH prefiere un not_determined correcto antes que un número
// preciso pero falso.
// ─────────────────────────────────────────────────────────────

export type TariffStatus = "determined" | "referential" | "not_determined";

export type TariffBasis =
  | "national_source"           // fila de una tabla/registro nacional o regional
  | "referential_multilateral"  // agregado multilateral a HS6 (WTO / WITS-TRAINS)
  | "user_declared"             // lo ingresó el usuario
  | "none";

export interface TariffSourceRef {
  id: string;                   // "WTO.HS_A_0010", "WITS.TRN", "EU.TARIC.table", "EU.TARIC.portal"
  name: string;                 // etiqueta legible
  kind: "api" | "table" | "scrape" | "user" | "none";
  retrieved_at?: string;        // ISO — cuándo GTH obtuvo el dato
  url?: string;
}

export interface TariffAsOf {
  value?: string;               // "2024", "2024-07-01", "2019..2022"
  kind: "year" | "date" | "range" | "unknown";
}

export interface TariffNomenclature {
  system: "HS" | "NCM" | "TARIC" | "national" | "none";
  level: "HS6" | "national-8" | "national-10" | "n/a";
  code?: string;
  /** true sólo si tenemos la línea nacional/regional; no implica que la TASA sea de ese nivel. */
  national_position_determined: boolean;
}

export interface TariffConfidence {
  level: "high" | "medium" | "low";
  /** Por qué. Se deriva de factores verificables; la IA nunca la eleva. */
  rationale: string;
}

export interface TariffDatum {
  value: number | null;         // % ad valorem; null salvo que se pueda sostener una tasa
  unit: "%";
  status: TariffStatus;
  basis: TariffBasis;
  source: TariffSourceRef;
  as_of: TariffAsOf;
  nomenclature: TariffNomenclature;
  jurisdiction: { country: string; role: "import" };
  confidence: TariffConfidence; // interno; la UI muestra `status`
  requires_validation: boolean;
  note?: string;
}

// ── deriveConfidence — factores verificables, nunca la IA ─────
export interface ConfidenceFactors {
  /** La fuente cubre el país importador de esta operación. */
  jurisdictionMatch: boolean;
  /** El dato está a la línea nacional/regional, no a HS6. */
  nationalLevel: boolean;
  /** El dato es actual / tiene vigencia utilizable. */
  current: boolean;
  /** Fuente de calidad (tabla sincronizada / API oficial), no scraping ni agregado. */
  qualitySource: boolean;
  /** Se usó alguna aproximación: padding, promedio, rango de posiciones hijas. */
  hasApproximations: boolean;
}

export function deriveConfidence(f: ConfidenceFactors): TariffConfidence {
  const reasons: string[] = [];
  if (!f.jurisdictionMatch) reasons.push("la fuente no corresponde a la jurisdicción de importación");
  if (!f.nationalLevel) reasons.push("el dato es a 6 dígitos (HS6), no a la línea nacional/regional");
  if (!f.current) reasons.push("sin fecha o vigencia utilizable");
  if (!f.qualitySource) reasons.push("fuente de baja fiabilidad (lectura de portal / agregado)");
  if (f.hasApproximations) reasons.push("se usó una aproximación (promedio o rango)");

  // La correspondencia de jurisdicción es condición necesaria.
  if (!f.jurisdictionMatch) {
    return { level: "low", rationale: `Limitaciones: ${reasons.join("; ")}.` };
  }

  let score = 2; // base por jurisdicción coincidente
  score += f.nationalLevel ? 2 : 0;
  score += f.current ? 2 : -1;
  score += f.qualitySource ? 1 : -1;
  score += f.hasApproximations ? -1 : 0;

  let level: TariffConfidence["level"] = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
  // Un agregado multilateral a HS6 nunca es "alta".
  if (!f.nationalLevel && level === "high") level = "medium";

  const rationale = reasons.length
    ? `Limitaciones: ${reasons.join("; ")}.`
    : "Fuente nacional/regional vigente, sin aproximaciones.";
  return { level, rationale };
}

// ── Constructores ────────────────────────────────────────────
export function notDetermined(country: string, note: string): TariffDatum {
  return {
    value: null,
    unit: "%",
    status: "not_determined",
    basis: "none",
    source: { id: "none", name: "—", kind: "none" },
    as_of: { kind: "unknown" },
    nomenclature: { system: "none", level: "n/a", national_position_determined: false },
    jurisdiction: { country, role: "import" },
    confidence: { level: "low", rationale: "No hay dato sobre el cual evaluar confianza." },
    requires_validation: true,
    note,
  };
}

// ── Derivación de campos legacy — EXCLUSIVAMENTE desde el TariffDatum ──
/** Valor legacy string ("14%") o null. Nunca un fallback. */
export function toLegacyRateString(d: TariffDatum | null | undefined): string | null {
  if (!d || d.status === "not_determined" || d.value === null) return null;
  return `${d.value}%`;
}
/** Valor legacy numérico o null. Nunca un fallback. */
export function toLegacyRateNumber(d: TariffDatum | null | undefined): number | null {
  if (!d || d.status === "not_determined" || d.value === null) return null;
  return d.value;
}

export function joinNote(...parts: (string | undefined)[]): string | undefined {
  const s = parts.filter(Boolean).join(" ");
  return s || undefined;
}
