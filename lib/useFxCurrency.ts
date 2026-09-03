"use client";
// ─────────────────────────────────────────────────────────────
// GTH — Unidad única de moneda + tipo de cambio (D10).
// Extraída de modulo03 para que M3 y M4 usen el MISMO mecanismo de
// conversión. El motor de costos es agnóstico de moneda: opera en USD y
// la conversión ocurre sólo en presentación.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

export const FX_CURRENCIES = ["USD", "EUR", "ARS", "BRL", "CLP"] as const;
export type FxCurrency = (typeof FX_CURRENCIES)[number];

/** Moneda efectiva de visualización: cae a USD si no hay cotización. Función pura (testeable). */
export function fxDisplayCurrency(currency: string, fxRate: number | null): string {
  return currency !== "USD" && !fxRate ? "USD" : currency;
}

/** Convierte un monto en USD a la moneda elegida y lo formatea. Función pura (testeable). */
export function fxFormat(usd: number, currency: string, fxRate: number | null): string {
  const v = currency !== "USD" && fxRate ? usd * fxRate : usd;
  return v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface FxCurrencyState {
  currency: string;
  setCurrency: (c: string) => void;
  /** 1 para USD; null si no se pudo obtener la cotización. */
  fxRate: number | null;
  fxMeta: { date: string; source: string } | null;
  /** Moneda efectiva de visualización: cae a USD si no hay cotización. */
  displayCurrency: string;
  /** Convierte un monto en USD a la moneda elegida y lo formatea (es-AR, 2 decimales). */
  fmt: (usd: number) => string;
}

export function useFxCurrency(initialCurrency = "USD"): FxCurrencyState {
  const [currency, setCurrency] = useState(initialCurrency);
  const [fxRate, setFxRate] = useState<number | null>(1);
  const [fxMeta, setFxMeta] = useState<{ date: string; source: string } | null>(null);

  useEffect(() => {
    if (currency === "USD") {
      setFxRate(1);
      setFxMeta(null);
      return;
    }
    let cancelled = false;
    setFxRate(null);
    fetch(`/api/fx?to=${encodeURIComponent(currency)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (typeof d.rate === "number") {
          setFxRate(d.rate);
          setFxMeta({ date: d.date, source: d.source });
        } else {
          setFxRate(null);
          setFxMeta(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFxRate(null);
          setFxMeta(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const displayCurrency = fxDisplayCurrency(currency, fxRate);
  const fmt = (usd: number) => fxFormat(usd, currency, fxRate);

  return { currency, setCurrency, fxRate, fxMeta, displayCurrency, fmt };
}
