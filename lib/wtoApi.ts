// ─────────────────────────────────────────────────────────────
// GTH — WTO Tariff API Integration
// Fuente: apiportal.wto.org
// Datos: tasas MFN aplicadas por código HS 6 dígitos
// ─────────────────────────────────────────────────────────────

// Mapa de países GTH → códigos ISO WTO
const COUNTRY_TO_WTO: Record<string, string> = {
  "Argentina":      "ARG",
  "Brasil":         "BRA",
  "Uruguay":        "URY",
  "Paraguay":       "PRY",
  "Chile":          "CHL",
  "Colombia":       "COL",
  "México":         "MEX",
  "Perú":           "PER",
  "España":         "ESP",
  "Ecuador":        "ECU",
  "Bolivia":        "BOL",
  "Venezuela":      "VEN",
  "Costa Rica":     "CRI",
  "Guatemala":      "GTM",
  "Panamá":         "PAN",
  "Estados Unidos": "USA",
  "China":          "CHN",
  "Alemania":       "DEU",
  "Francia":        "FRA",
  "Italia":         "ITA",
  "Reino Unido":    "GBR",
  "Japón":          "JPN",
  "Corea del Sur":  "KOR",
  "India":          "IND",
  "Canadá":         "CAN",
  "Australia":      "AUS",
};

export interface WTOTariffResult {
  hs_code: string;
  country: string;
  mfn_rate: number | null;       // Tasa MFN aplicada (%)
  year: number | null;
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
      `i=HS_M_0010&` +           // MFN applied tariff rate
      `r=${wtoCode}&` +           // Reporter (importing country)
      `p=000&` +                  // Partner: World (000)
      `ps=${year}&` +             // Year
      `pc=${hs6}&` +              // HS6 product code
      `fmt=json&` +
      `head=H&` +
      `lang=1`;

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

    if (json?.Dataset && json.Dataset.length > 0) {
      const row = json.Dataset[0];
      if (row?.Value !== undefined && row.Value !== null) {
        mfn_rate = parseFloat(row.Value);
        dataYear = parseInt(row.Year || year);
      }
    }

    const result: WTOTariffResult = {
      hs_code: hs6,
      country: destination,
      mfn_rate,
      year: dataYear,
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
