// ─────────────────────────────────────────────────────────────
// GTH — WITS / UNCTAD TRAINS: tasa MFN (general) y PREF (preferencial)
// oficiales por país importador + país de origen + código HS6.
// API gratuita, sin key. Respuesta SDMX-ML (XML) que parseamos con regex.
//
// Límites conocidos:
//  - Los datos de TRAINS tienen rezago (se prueban los últimos años disponibles).
//  - Es a 6 dígitos HS (promedio simple), no a la línea de 8-10.
//  - Aranceles específicos/compuestos vuelven como NA → no se usan (cae a IA).
// ─────────────────────────────────────────────────────────────

import { hasTradeAgreement } from "@/lib/tradeAgreements";

const BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN";

// Códigos ISO 3166-1 numéricos para los países del selector.
const ISO_NUM: Record<string, string> = {
  argentina: "032", brasil: "076", uruguay: "858", paraguay: "600",
  chile: "152", bolivia: "068", "perú": "604", peru: "604",
  colombia: "170", ecuador: "218", venezuela: "862",
  "méxico": "484", mexico: "484",
  "estados unidos": "840", "canadá": "124", canada: "124",
  "españa": "918", espana: "918", alemania: "918", francia: "918", italia: "918", // UE = arancel externo común
  "reino unido": "826",
  china: "156", "japón": "392", japon: "392",
  "corea del sur": "410", india: "356", australia: "036",
};

const norm = (c: string) => (c || "").trim().toLowerCase();

function isoCode(country: string): string | null {
  return ISO_NUM[norm(country)] ?? null;
}

/** Normaliza a 6 dígitos (sin puntos). */
export function toHS6(code: string): string {
  const digits = (code || "").replace(/\D/g, "");
  return digits.slice(0, 6);
}

interface WitsObs {
  type: "MFN" | "PREF" | string;
  value: number;
  usableLines: number; // NBR_MFN_LINES + NBR_PREF_LINES (líneas con arancel ad valorem real)
  year: number;
}

function parseObs(xml: string): WitsObs[] {
  const tags = xml.match(/<Obs\b[^>]*\/>/g) || [];
  const out: WitsObs[] = [];
  for (const tag of tags) {
    const attr = (k: string) => tag.match(new RegExp(`${k}="([^"]*)"`))?.[1];
    const value = parseFloat(attr("OBS_VALUE") ?? "");
    if (!Number.isFinite(value)) continue;
    out.push({
      type: attr("TARIFFTYPE") || "",
      value,
      usableLines: (parseInt(attr("NBR_MFN_LINES") ?? "0") || 0) + (parseInt(attr("NBR_PREF_LINES") ?? "0") || 0),
      year: parseInt(attr("TIME_PERIOD") ?? "0") || 0,
    });
  }
  return out;
}

async function fetchTariff(reporter: string, partner: string, hs6: string, year: number): Promise<WitsObs[]> {
  const url = `${BASE}/reporter/${reporter}/partner/${partner}/product/${hs6}/year/${year}/datatype/reported`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "GlobalTariffHub" }, signal: ctrl.signal });
    if (!res.ok) return [];
    return parseObs(await res.text());
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export interface WitsResult {
  mfn_rate: number | null;
  pref_rate: number | null;
  year: number | null;
  source: "WITS" | "none";
}

const cache = new Map<string, WitsResult>();

/**
 * @param destination país importador (reporter)
 * @param origin país exportador (partner) — para la tasa preferencial
 * @param code código arancelario (se recorta a HS6)
 */
export async function getWitsRates(destination: string, origin: string, code: string): Promise<WitsResult> {
  const empty: WitsResult = { mfn_rate: null, pref_rate: null, year: null, source: "none" };
  const reporter = isoCode(destination);
  const hs6 = toHS6(code);
  if (!reporter || hs6.length < 6) return empty;

  const partnerOrigin = isoCode(origin);
  const key = `${reporter}|${partnerOrigin || "000"}|${hs6}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // Solo buscamos tasa preferencial si hay chance de que exista un acuerdo.
  const checkPref = !!partnerOrigin && partnerOrigin !== reporter && hasTradeAgreement(origin, destination);

  // Años a probar (más reciente primero). La MFN suele llegar hasta ~año-3;
  // la preferencial tiene más rezago. Se consultan en paralelo, no en cascada.
  const y = new Date().getFullYear();
  const mfnYears = [y - 3, y - 4, y - 5];
  const prefYears = [y - 3, y - 4, y - 5, y - 6];

  const [mfnBatches, prefBatches] = await Promise.all([
    Promise.all(mfnYears.map((yr) => fetchTariff(reporter, "000", hs6, yr).then((obs) => ({ yr, obs })))),
    checkPref
      ? Promise.all(prefYears.map((yr) => fetchTariff(reporter, partnerOrigin!, hs6, yr).then((obs) => ({ yr, obs }))))
      : Promise.resolve([] as { yr: number; obs: WitsObs[] }[]),
  ]);

  let mfn: number | null = null;
  let pref: number | null = null;
  let mfnYear: number | null = null;
  let prefYear: number | null = null;

  for (const { yr, obs } of mfnBatches) {
    const o = obs.find((x) => x.type === "MFN" && x.usableLines > 0);
    if (o) { mfn = round(o.value); mfnYear = yr; break; }
  }
  for (const { yr, obs } of prefBatches) {
    const o = obs.find((x) => x.type === "PREF" && x.usableLines > 0);
    if (o) { pref = round(o.value); prefYear = yr; break; }
  }

  const result: WitsResult =
    mfn != null || pref != null
      ? { mfn_rate: mfn, pref_rate: pref, year: mfnYear ?? prefYear, source: "WITS" }
      : empty;
  cache.set(key, result);
  return result;
}

const round = (n: number) => Math.round(n * 100) / 100;
