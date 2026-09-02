// ─────────────────────────────────────────────────────────────
// GTH — Bloque 2 · resolveTariff()
//
// jurisdicción + clasificación/nomenclatura + fuente aplicable → tasa.
// Nunca: país → tasa genérica. Nunca: fabricar líneas nacionales.
// Nunca: defaults numéricos. Nunca: promedio HS6 como tasa definitiva.
//
// Termina EXCLUSIVAMENTE en determined / referential / not_determined.
// La selección entre fuentes es determinística por PRIORIDAD del plan
// de jurisdicción, no por el orden en que respondan las APIs.
//
// La salida numérica de la IA (tariff_rate / effective_rate / base_rate)
// NO entra acá: el llamador la descarta antes.
// ─────────────────────────────────────────────────────────────
import { resolveJurisdiction, type JurisdictionPlan, type TariffSourceSlot } from "@/lib/jurisdiction";
import { getWTOMFNRate, normalizeHS6 } from "@/lib/wtoApi";
import { getWitsRates } from "@/lib/witsApi";
import { getTARICByHs6, type TaricTableHit } from "@/lib/taricApi";
import { getNCMCode, isNCMVigente, normalizeNCM8, type NCMResult } from "@/lib/ncmApi";
import { getTradeAgreement } from "@/lib/tradeAgreements";
import { deriveConfidence, notDetermined, joinNote, type TariffDatum } from "@/lib/tariffDatum";

export interface ResolveTariffInput {
  importCountry: string;
  originCountry?: string;
  code: string;            // código HS / NCM / TARIC tal como llega
  system?: string;
}

export interface ResolvedTariff {
  general: TariffDatum;
  preferential?: TariffDatum;
  jurisdiction: {
    regime: JurisdictionPlan["regime"];
    bloc_id?: string;
    membership_source?: string;
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const isRecentYear = (y: number | null | undefined) =>
  typeof y === "number" && CURRENT_YEAR - y <= 3;

/** Parsea "3.7 %", "Free", "12,8 %" → número. null si es específico/compuesto o ilegible. */
function parseAdValorem(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (/^free$/i.test(s) || s === "0" || s === "0%") return 0;
  // Específico / compuesto → no se puede sostener un ad valorem.
  if (/[+\/]|eur|usd|kg|\bpce\b|per\b/i.test(s)) return null;
  const m = s.replace(",", ".").match(/(-?\d+(\.\d+)?)\s*%/);
  if (m) return Math.round(parseFloat(m[1]) * 100) / 100;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

// ── Constructores de candidatos ──────────────────────────────
function multilateralDatum(opts: {
  which: "WTO" | "WITS";
  rate: number;
  year: number | null;
  hs6: string;
  importCountry: string;
}): TariffDatum {
  const current = isRecentYear(opts.year);
  const conf = deriveConfidence({
    jurisdictionMatch: true, // el reporter de WTO/WITS es el país importador
    nationalLevel: false,
    current,
    qualitySource: true, // dataset autoritativo, pero es un promedio
    hasApproximations: true, // promedio simple a 6 dígitos
  });
  return {
    value: opts.rate,
    unit: "%",
    status: "referential",
    basis: "referential_multilateral",
    source:
      opts.which === "WTO"
        ? { id: "WTO.HS_A_0010", name: "WTO — promedio simple MFN por HS6", kind: "api" }
        : { id: "WITS.TRN", name: "WITS / UNCTAD TRAINS — promedio por HS6", kind: "api" },
    as_of: { value: opts.year ? String(opts.year) : undefined, kind: opts.year ? "year" : "unknown" },
    nomenclature: { system: "HS", level: "HS6", code: opts.hs6, national_position_determined: false },
    jurisdiction: { country: opts.importCountry, role: "import" },
    confidence: conf,
    requires_validation: true,
    note:
      "Promedio simple MFN a 6 dígitos (HS6). No es la línea nacional/regional aplicable; " +
      "puede diferir de la tasa efectiva. Requiere validación en el sistema oficial del país importador.",
  };
}

function taricTableDatum(hit: TaricTableHit, hs6: string, importCountry: string): TariffDatum {
  const value = parseAdValorem(hit.duty_rate);
  // D1 — con el schema actual de `taric_codes` no hay `source` ni vigencia por fila:
  // ninguna fila alcanza "determined". Queda "referential".
  const hasVigencia = false; // TODO(datos): la tabla no expone valid_from/valid_to hoy.
  const conf = deriveConfidence({
    jurisdictionMatch: true,
    nationalLevel: hit.exact, // exacta = línea de 10 dígitos; prefijo = a nivel HS6
    current: hasVigencia,
    qualitySource: true, // tabla sincronizada
    hasApproximations: !hit.exact, // prefijo HS6 con tasa común = aproximación
  });
  const noteBits = [
    hit.exact
      ? `Línea TARIC ${hit.commodity_code} de la tabla sincronizada.`
      : `Tabla TARIC: ${hit.matches} posiciones bajo el HS6 ${hs6}${
          value !== null ? " con la misma tasa" : ""
        }.`,
    "Sin fecha de vigencia registrada — requiere validación en el sistema oficial de la UE.",
    value === null && hit.duty_rate
      ? `Tasa no ad valorem o dispar entre posiciones (${hit.duty_rate ?? "—"}); requiere clasificación a 10 dígitos.`
      : value === null
        ? "No se pudo sostener una tasa ad valorem para este HS6; requiere clasificación a 10 dígitos."
        : undefined,
  ];
  return {
    value,
    unit: "%",
    status: "referential",
    basis: "national_source",
    source: { id: "EU.TARIC.table", name: "Tabla TARIC sincronizada (GTH)", kind: "table" },
    as_of: { kind: "unknown" },
    nomenclature: {
      system: "TARIC",
      level: hit.exact ? "national-10" : "HS6",
      code: hit.commodity_code,
      national_position_determined: hit.exact,
    },
    jurisdiction: { country: importCountry, role: "import" },
    confidence: conf,
    requires_validation: true,
    note: joinNote(...noteBits),
  };
}

function preferentialDatum(opts: {
  rate: number;
  year: number | null;
  hs6: string;
  importCountry: string;
  agreementName: string;
}): TariffDatum {
  const conf = deriveConfidence({
    jurisdictionMatch: true,
    nationalLevel: false,
    current: isRecentYear(opts.year),
    qualitySource: true,
    hasApproximations: true,
  });
  return {
    value: opts.rate,
    unit: "%",
    status: "referential",
    basis: "referential_multilateral",
    source: { id: "WITS.TRN.pref", name: "WITS / UNCTAD TRAINS — tasa preferencial por par de países", kind: "api" },
    as_of: { value: opts.year ? String(opts.year) : undefined, kind: opts.year ? "year" : "unknown" },
    nomenclature: { system: "HS", level: "HS6", code: opts.hs6, national_position_determined: false },
    jurisdiction: { country: opts.importCountry, role: "import" },
    confidence: conf,
    requires_validation: true,
    note:
      `Tasa preferencial referencial a 6 dígitos bajo ${opts.agreementName}. ` +
      "Su aplicación depende de que la mercadería califique según el régimen de origen del acuerdo. " +
      "No evaluado por GTH; requiere validación.",
  };
}

// ── Orquestador ──────────────────────────────────────────────
export async function resolveTariff(input: ResolveTariffInput): Promise<ResolvedTariff> {
  const { importCountry, originCountry, code } = input;
  const plan = resolveJurisdiction(importCountry);
  const jur = { regime: plan.regime, bloc_id: plan.bloc_id, membership_source: plan.membership_source };
  const hs6 = normalizeHS6(code);

  if (hs6.length < 6) {
    return {
      general: notDetermined(
        importCountry,
        "El código provisto no permite identificar una subpartida HS de 6 dígitos.",
      ),
      jurisdiction: jur,
    };
  }

  const wantTaricTable = plan.tariff_sources.some((s) => s.id === "TARIC_TABLE");
  const wantNcm = plan.tariff_sources.some((s) => s.id === "NCM_NOMENCLATURE");

  const [wto, wits, taric, ncm]: [
    Awaited<ReturnType<typeof getWTOMFNRate>> | null,
    Awaited<ReturnType<typeof getWitsRates>> | null,
    TaricTableHit | null,
    NCMResult | null,
  ] = await Promise.all([
    getWTOMFNRate(hs6, importCountry).catch(() => null),
    getWitsRates(importCountry, originCountry || "", hs6).catch(() => null),
    wantTaricTable ? getTARICByHs6(hs6, code).catch(() => null) : Promise.resolve(null),
    wantNcm ? getNCMCode(normalizeNCM8(code)).catch(() => null) : Promise.resolve(null),
  ]);

  const priorityOf = (id: TariffSourceSlot["id"]) =>
    plan.tariff_sources.find((s) => s.id === id)?.priority ?? 0;

  const candidates: { priority: number; datum: TariffDatum }[] = [];

  if (wantTaricTable && taric) {
    candidates.push({ priority: priorityOf("TARIC_TABLE"), datum: taricTableDatum(taric, hs6, importCountry) });
  }
  if (wto && wto.source === "WTO" && wto.mfn_rate !== null) {
    candidates.push({
      priority: priorityOf("WTO_HS6"),
      datum: multilateralDatum({ which: "WTO", rate: wto.mfn_rate, year: wto.year, hs6, importCountry }),
    });
  }
  if (wits && wits.source === "WITS" && wits.mfn_rate !== null) {
    candidates.push({
      priority: priorityOf("WITS_HS6"),
      datum: multilateralDatum({ which: "WITS", rate: wits.mfn_rate, year: wits.year, hs6, importCountry }),
    });
  }

  // Selección determinística: mayor prioridad con status "determined";
  // si ninguno, mayor prioridad "referential"; si ninguno, not_determined.
  candidates.sort((a, b) => b.priority - a.priority);
  let general: TariffDatum =
    candidates.find((c) => c.datum.status === "determined")?.datum ??
    candidates.find((c) => c.datum.status === "referential")?.datum ??
    notDetermined(importCountry, notDeterminedReason(plan));

  // NCM aporta nomenclatura + vigencia (NO la tasa — la tasa sigue siendo HS6, D3).
  if (plan.regime === "NCM" && ncm && ncm.source === "NCM" && general.status !== "not_determined") {
    const vigente = isNCMVigente(ncm);
    general = {
      ...general,
      nomenclature: {
        ...general.nomenclature,
        system: "NCM",
        code: ncm.codigo,
        national_position_determined: true, // tenemos la LÍNEA NCM…
        // …pero level y status no cambian: la TASA sigue siendo HS6.
      },
      note: joinNote(
        general.note,
        `Nomenclatura NCM ${ncm.codigo}${vigente ? "" : ` (vigencia vencida: ${ncm.data_fim})`}.`,
        "El Arancel Externo Común del MERCOSUR a nivel NCM puede diferir de este promedio HS6.",
      ),
    };
  }

  // Preferencial — sólo si hay acuerdo determinable y una tasa PREF de fuente.
  let preferential: TariffDatum | undefined;
  const agreement = getTradeAgreement(originCountry || "", importCountry);
  if (agreement && wits && wits.source === "WITS" && wits.pref_rate !== null) {
    preferential = preferentialDatum({
      rate: wits.pref_rate,
      year: wits.year,
      hs6,
      importCountry,
      agreementName: agreement.name,
    });
  }

  return { general, preferential, jurisdiction: jur };
}

function notDeterminedReason(plan: JurisdictionPlan): string {
  if (plan.regime === "unknown") {
    return (
      `GTH no tiene una fuente de arancel para ${plan.import_country} dentro de su alcance actual, ` +
      "y las bases multilaterales (WTO/WITS) no devolvieron un dato para esta posición. " +
      "Requiere validación en el sistema oficial de comercio exterior del país importador o con un despachante."
    );
  }
  return (
    "No se obtuvo una tasa de ninguna fuente aplicable para esta posición y jurisdicción. " +
    "Requiere validación en el sistema oficial correspondiente o con un profesional."
  );
}

// ── Ayudas para las rutas ────────────────────────────────────
export interface TariffLegacyView {
  base_rate: string | null;        // "14%" o null — nunca fallback
  base_rate_status: TariffDatum["status"];
  base_rate_source: string;
  base_rate_asof: string;
  preferential_rate: string | null;
  has_preferential: boolean;
}

/** Deriva los campos legacy EXCLUSIVAMENTE del TariffDatum (D8). */
export function toLegacyView(r: ResolvedTariff): TariffLegacyView {
  const g = r.general;
  const base = g.status === "not_determined" || g.value === null ? null : `${g.value}%`;
  const pref = r.preferential && r.preferential.value !== null ? `${r.preferential.value}%` : null;
  return {
    base_rate: base,
    base_rate_status: g.status,
    base_rate_source: g.source.name,
    base_rate_asof: g.as_of.value ?? "",
    preferential_rate: pref,
    has_preferential: pref !== null && r.preferential?.value !== undefined && (base === null || (r.preferential!.value as number) < (g.value as number)),
  };
}
