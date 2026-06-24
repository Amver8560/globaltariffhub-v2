// ─────────────────────────────────────────────────────────────
// GTH — WTO Tariff API Integration
// Fuente: apiportal.wto.org
// Datos: tasas MFN aplicadas por código HS 6 dígitos
// ─────────────────────────────────────────────────────────────

// Mapa de países GTH → códigos numéricos WTO (3 dígitos, ISO 3166-1 numeric)
const COUNTRY_TO_WTO: Record<string, string> = {
  "Argentina":      "032",
  "Brasil":         "076",
  "Uruguay":        "858",
  "Paraguay":       "600",
  "Chile":          "152",
  "Colombia":       "170",
  "México":         "484",
  "Perú":           "604",
  "España":         "724",
  "Ecuador":        "218",
  "Bolivia":        "068",
  "Venezuela":      "862",
  "Costa Rica":     "188",
  "Guatemala":      "320",
  "Panamá":         "591",
  "Estados Unidos": "842",
  "China":          "156",
  "Alemania":       "276",
  "Francia":        "250",
  "Italia":         "380",
  "Reino Unido":    "826",
  "Japón":          "392",
  "Corea del Sur":  "410",
  "India":          "356",
  "Canadá":         "124",
  "Australia":      "036",
};

export interface WTOTariffResult {
  hs_code: string;
  country: string;
  mfn_rate: number | null;       // Tasa MFN aplicada (%)
  year: number | null;
  product_description?: string;  // Descripción oficial del producto según WTO
  source: "WTO" | "fallback";
  raw?: any;
}

// Cache simple en memoria (TTL 24h)
const cache = new Map<string, { data: WTOTariffResult; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Obtiene la tasa MFN real desde la WTO API.
 * Requiere WTO_API_KEY en variables de entorno.
 * Devuelve null si no hay dato disponible.
 */
export async function getWTOMFNRate(
  hs6: string,      // Código HS de 6 dígitos sin puntos: "630140"
  destination: string  // País destino en español: "Argentina"
): Promise<WTOTariffResult> {
  const apiKey = process.env.WTO_API_KEY;
  const wtoCode = COUNTRY_TO_WTO[destination];
  const cacheKey = `${hs6}-${destination}`;

  // Sin API key → fallback inmediato
  if (!apiKey || !wtoCode) {
    return { hs_code: hs6, country: destination, mfn_rate: null, year: null, source: "fallback" };
  }

  // Revisar cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const year = new Date().getFullYear() - 1; // Último año disponible
    const url = `https://api.wto.org/timeseries/v1/data?` +
      `i=HS_A_0010&` +           // MFN simple average ad valorem duty by HS6
      `r=${wtoCode}&` +           // Reporter (importing country, numeric code)
      `ps=${year}&` +             // Year
      `pc=${hs6}&` +              // HS6 product code
      `fmt=json&` +
      `page=1&perPage=1`;

    const res = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });

    if (!res.ok) {
      return { hs_code: hs6, country: destination, mfn_rate: null, year: null, source: "fallback" };
    }

    const json = await res.json();

    // Extraer tasa del response WTO
    let mfn_rate: number | null = null;
    let dataYear: number | null = null;

    let product_description: string | undefined;

    if (json?.Dataset && json.Dataset.length > 0) {
      const row = json.Dataset[0];
      if (row?.Value !== undefined && row.Value !== null) {
        mfn_rate = parseFloat(row.Value);
        dataYear = parseInt(row.Year || year);
      }
      if (row?.ProductOrSector) {
        product_description = row.ProductOrSector;
      }
    }

    const result: WTOTariffResult = {
      hs_code: hs6,
      country: destination,
      mfn_rate,
      year: dataYear,
      product_description,
      source: mfn_rate !== null ? "WTO" : "fallback",
      raw: json,
    };

    // Guardar en cache solo si tenemos dato
    if (mfn_rate !== null) {
      cache.set(cacheKey, { data: result, ts: Date.now() });
    }

    return result;

  } catch {
    return { hs_code: hs6, country: destination, mfn_rate: null, year: null, source: "fallback" };
  }
}

/**
 * Limpia el código HS para usar en la API:
 * "63.01.40" → "630140"
 * "6301.40.00" → "630140" (solo primeros 6 dígitos)
 */
export function normalizeHS6(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.slice(0, 6);
}
