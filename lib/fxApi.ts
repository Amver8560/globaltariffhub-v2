// ─────────────────────────────────────────────────────────────
// GTH — Tipo de cambio en vivo (para mostrar montos en moneda local).
// Fuentes gratuitas sin API key:
//   1) open.er-api.com  (ExchangeRate-API, endpoint abierto)
//   2) @fawazahmed0/currency-api vía jsDelivr (fallback)
// Para el CIF, el tipo de cambio de referencia es el oficial del país
// de destino (base de valoración aduanera).
// ─────────────────────────────────────────────────────────────

export interface FxResult {
  base: string;
  rates: Record<string, number>;
  date: string;
  source: "er-api" | "currency-api" | "fallback";
}

let cache: { at: number; data: FxResult } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 h

export async function getFxRates(base = "USD"): Promise<FxResult> {
  const B = base.toUpperCase();
  if (cache && cache.data.base === B && Date.now() - cache.at < TTL_MS) return cache.data;

  // 1) open.er-api.com
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${B}`, {
      headers: { "User-Agent": "GlobalTariffHub" },
    });
    if (res.ok) {
      const d = await res.json();
      if (d?.result === "success" && d.rates) {
        const data: FxResult = { base: B, rates: d.rates, date: d.time_last_update_utc || "", source: "er-api" };
        cache = { at: Date.now(), data };
        return data;
      }
    }
  } catch { /* sigue al fallback */ }

  // 2) currency-api (jsDelivr)
  try {
    const b = B.toLowerCase();
    const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${b}.json`);
    if (res.ok) {
      const d = await res.json();
      const raw = (d?.[b] || {}) as Record<string, number>;
      const rates: Record<string, number> = {};
      for (const k of Object.keys(raw)) rates[k.toUpperCase()] = raw[k];
      const data: FxResult = { base: B, rates, date: d?.date || "", source: "currency-api" };
      cache = { at: Date.now(), data };
      return data;
    }
  } catch { /* nada */ }

  return { base: B, rates: {}, date: "", source: "fallback" };
}

export interface FxConversion {
  rate: number | null;
  date: string;
  source: FxResult["source"];
  to: string;
}

/** Tipo de cambio de `base` (def USD) a `to`. rate=null si no se pudo obtener. */
export async function getRate(to: string, base = "USD"): Promise<FxConversion> {
  const T = (to || "").toUpperCase();
  if (!T || T === base.toUpperCase()) {
    return { rate: 1, date: "", source: "fallback", to: T || base.toUpperCase() };
  }
  const fx = await getFxRates(base);
  return { rate: fx.rates[T] ?? null, date: fx.date, source: fx.source, to: T };
}
