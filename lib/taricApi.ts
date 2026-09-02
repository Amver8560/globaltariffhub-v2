// ─────────────────────────────────────────────────────────────
// GTH — TARIC API Integration
// Fuente primaria: Supabase (tabla taric_codes, sincronizado desde CIRCABC)
// Fuente secundaria: Access2Markets (EU) — fallback si Supabase no tiene el dato
// Datos: códigos TARIC 10 dígitos, tasas, notas, medidas, exclusiones
// ─────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";

export interface TARICRate {
  commodity_code: string;     // Código TARIC 10 dígitos
  description: string;        // Descripción del producto
  third_country_duty: string; // Tasa para terceros países (Erga Omnes)
  unit: string;               // Unidad de medida
  measures?: TARICMeasure[];  // Medidas adicionales (cuotas, antidumping, etc.)
  footnotes?: string[];       // Notas y exclusiones aplicables
  source: "TARIC" | "fallback";
  country?: string;           // País de origen consultado
}

export interface TARICMeasure {
  type: string;               // "Third country duty", "VAT", "Anti-dumping", etc.
  value: string;              // Tasa o descripción
  conditions?: string;        // Condiciones de aplicación
}

// Cache en memoria (TTL 12h — TARIC se actualiza diariamente)
const cache = new Map<string, { data: TARICRate | null; ts: number }>();
const CACHE_TTL = 12 * 60 * 60 * 1000;

// Mapeo de países GTH → códigos ISO2 para TARIC
const COUNTRY_TO_ISO2: Record<string, string> = {
  "Argentina":      "AR",
  "Brasil":         "BR",
  "Uruguay":        "UY",
  "Paraguay":       "PY",
  "Chile":          "CL",
  "Colombia":       "CO",
  "México":         "MX",
  "Perú":           "PE",
  "España":         "ES",
  "Ecuador":        "EC",
  "Bolivia":        "BO",
  "Venezuela":      "VE",
  "Costa Rica":     "CR",
  "Guatemala":      "GT",
  "Panamá":         "PA",
  "Estados Unidos": "US",
  "China":          "CN",
  "Alemania":       "DE",
  "Francia":        "FR",
  "Italia":         "IT",
  "Reino Unido":    "GB",
  "Japón":          "JP",
  "Corea del Sur":  "KR",
  "India":          "IN",
  "Canadá":         "CA",
  "Australia":      "AU",
};

/**
 * Consulta tasas TARIC.
 * Prioridad: 1) Supabase (datos CIRCABC sincronizados) → 2) Access2Markets live → 3) null
 */
export async function getTARICRate(
  taricCode: string,   // Código de 8-10 dígitos: "1302111000"
  originCountry: string  // País de origen del producto en español: "Argentina"
): Promise<TARICRate | null> {
  const code = normalizeTARIC(taricCode);
  if (code.length < 8) return null;

  const countryISO = COUNTRY_TO_ISO2[originCountry] || "AR";
  const cacheKey = `${code}-${countryISO}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  // 1. Buscar en Supabase (datos CIRCABC sincronizados diariamente)
  try {
    const supabase = await createClient();
    const { data: sbRow } = await supabase
      .from("taric_codes")
      .select("commodity_code, description, duty_rate, unit, footnotes, measure_types")
      .eq("commodity_code", code)
      .maybeSingle();

    if (sbRow && sbRow.duty_rate) {
      const result: TARICRate = {
        commodity_code: sbRow.commodity_code,
        description: sbRow.description || "",
        third_country_duty: sbRow.duty_rate,
        unit: sbRow.unit || "",
        footnotes: sbRow.footnotes || [],
        measures: (sbRow.measure_types || []).map((t: string) => ({ type: t, value: "" })),
        source: "TARIC",
        country: originCountry,
      };
      cache.set(cacheKey, { data: result, ts: Date.now() });
      return result;
    }
  } catch {
    // Supabase no disponible — continuar con fallback
  }

  // 2. Fallback: Access2Markets live
  try {
    const url = `https://trade.ec.europa.eu/access-to-markets/api/commodity/${code}` +
      `?lang=es&originCountry=${countryISO}&destinationCountry=EU`;

    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "GlobalTariffHub/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const result = parseTARICResponse(data, code, originCountry);
      if (result) {
        cache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
      }
    }

    // 3. Último fallback: scraping TARIC directo
    const fallbackResult = await queryTARICDirect(code, countryISO, originCountry);
    cache.set(cacheKey, { data: fallbackResult, ts: Date.now() });
    return fallbackResult;

  } catch {
    return null;
  }
}

/**
 * Consulta directa al sistema TARIC de la Comisión Europea
 */
async function queryTARICDirect(
  code: string,
  countryISO: string,
  originCountry: string
): Promise<TARICRate | null> {
  try {
    const url = `https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp` +
      `?Lang=ES&Taric=${code}&LangDescr=ES&Screen=0&expand=TARIC`;

    const res = await fetch(url, {
      headers: { "Accept": "text/html,application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    // El endpoint devuelve HTML — extraemos datos relevantes
    const html = await res.text();
    const rate = extractRateFromTARICHtml(html, code, originCountry);
    return rate;

  } catch {
    return null;
  }
}

/**
 * Parsea la respuesta de Access2Markets
 */
function parseTARICResponse(data: any, code: string, originCountry: string): TARICRate | null {
  try {
    if (!data) return null;

    // Estructura Access2Markets
    const description = data.description || data.descriptionEN || data.goodsDescription || "";
    const duty = data.thirdCountryDuty || data.duty || data.erga_omnes || null;

    if (!duty && !description) return null;

    const measures: TARICMeasure[] = [];
    if (data.measures && Array.isArray(data.measures)) {
      data.measures.forEach((m: any) => {
        measures.push({
          type: m.measureType || m.type || "",
          value: m.dutyExpression || m.value || "",
          conditions: m.conditions || m.geographicalArea || "",
        });
      });
    }

    const footnotes: string[] = [];
    if (data.footnotes && Array.isArray(data.footnotes)) {
      data.footnotes.forEach((fn: any) => {
        footnotes.push(fn.description || fn.text || fn.code || "");
      });
    }

    return {
      commodity_code: code,
      description,
      third_country_duty: duty || "N/D",
      unit: data.supplementaryUnit || data.unit || "",
      measures: measures.length > 0 ? measures : undefined,
      footnotes: footnotes.length > 0 ? footnotes : undefined,
      source: "TARIC",
      country: originCountry,
    };
  } catch {
    return null;
  }
}

/**
 * Extrae tasa arancelaria básica del HTML de respuesta TARIC
 */
function extractRateFromTARICHtml(html: string, code: string, originCountry: string): TARICRate | null {
  try {
    // Buscar patrones de tasa en el HTML
    const rateMatch = html.match(/Erga Omnes[^%]*?([\d.,]+\s*%)/i) ||
                      html.match(/Third country duty[^%]*?([\d.,]+\s*%)/i) ||
                      html.match(/Arancel[^%]*?([\d.,]+\s*%)/i);

    const descMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/class="goods-description"[^>]*>([^<]+)</i);

    if (!rateMatch) return null;

    return {
      commodity_code: code,
      description: descMatch ? descMatch[1].trim() : `Código TARIC ${code}`,
      third_country_duty: rateMatch[1].trim(),
      unit: "",
      source: "TARIC",
      country: originCountry,
    };
  } catch {
    return null;
  }
}

/**
 * @deprecated Bloque 2 — se conserva sólo para el orquestador legacy `getTARICRate`.
 * NO usar para armar un código de consulta: rellena a 10 dígitos con ceros, lo que
 * fabrica una posición que puede no corresponder a la mercadería.
 */
export function normalizeTARIC(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.slice(0, 10).padEnd(10, "0");
}

/**
 * Extrae sección/capítulo TARIC para mostrar en UI
 */
export function getTARICChapter(code: string): string {
  return code.replace(/\D/g, "").slice(0, 2);
}

// ─────────────────────────────────────────────────────────────
// Bloque 2 — consulta de la tabla sincronizada por HS6 / código real,
// SIN fabricar la posición de 10 dígitos con padding.
// ─────────────────────────────────────────────────────────────
export interface TaricTableHit {
  via: "table";
  commodity_code: string;   // el código real de la fila
  duty_rate: string | null; // p. ej. "3.7 %", "Free", "12.8 % + ..." — tal cual la tabla
  description: string;
  unit: string;
  /** true si el código dado por el usuario coincide exactamente con una fila. */
  exact: boolean;
  /** cantidad de filas bajo el HS6 (para decidir si hay una línea inequívoca). */
  matches: number;
}

const hs6Cache = new Map<string, { data: TaricTableHit | null; ts: number }>();

/**
 * Busca en la tabla `taric_codes` a partir del HS6 y, si el usuario dio un código
 * más largo y real, por coincidencia exacta. Nunca rellena con ceros.
 * Devuelve null si la tabla no tiene nada bajo ese HS6.
 */
export async function getTARICByHs6(hs6: string, fullCode?: string): Promise<TaricTableHit | null> {
  const hs6d = (hs6 || "").replace(/\D/g, "").slice(0, 6);
  if (hs6d.length < 6) return null;
  const userDigits = (fullCode || "").replace(/\D/g, "");
  const cacheKey = `hs6:${hs6d}:${userDigits}`;
  const cached = hs6Cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const supabase = await createClient();

    // 1. Coincidencia exacta si el usuario dio un código de 8+ dígitos reales.
    if (userDigits.length >= 8 && userDigits.startsWith(hs6d)) {
      const { data: exactRow } = await supabase
        .from("taric_codes")
        .select("commodity_code, description, duty_rate, unit")
        .eq("commodity_code", userDigits)
        .maybeSingle();
      if (exactRow) {
        const hit: TaricTableHit = {
          via: "table",
          commodity_code: exactRow.commodity_code,
          duty_rate: exactRow.duty_rate ?? null,
          description: exactRow.description || "",
          unit: exactRow.unit || "",
          exact: true,
          matches: 1,
        };
        hs6Cache.set(cacheKey, { data: hit, ts: Date.now() });
        return hit;
      }
    }

    // 2. Prefijo por HS6.
    const { data: rows } = await supabase
      .from("taric_codes")
      .select("commodity_code, description, duty_rate, unit")
      .like("commodity_code", `${hs6d}%`)
      .limit(60);

    if (!rows || rows.length === 0) {
      hs6Cache.set(cacheKey, { data: null, ts: Date.now() });
      return null;
    }

    // Filas con una tasa ad valorem legible.
    const rated = rows.filter((r) => typeof r.duty_rate === "string" && /\d/.test(r.duty_rate));
    // ¿Todas las filas con tasa coinciden en el mismo valor? → línea inequívoca a nivel HS6.
    const distinctRates = new Set(rated.map((r) => (r.duty_rate as string).trim()));
    const pick = rated[0] ?? rows[0];

    const hit: TaricTableHit = {
      via: "table",
      commodity_code: pick.commodity_code,
      duty_rate: distinctRates.size === 1 ? (pick.duty_rate as string) : null,
      description: pick.description || "",
      unit: pick.unit || "",
      exact: false,
      matches: rows.length,
    };
    hs6Cache.set(cacheKey, { data: hit, ts: Date.now() });
    return hit;
  } catch {
    return null;
  }
}
