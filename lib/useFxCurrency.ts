"use client";
// ─────────────────────────────────────────────────────────────
// GTH — Moneda de la operación + tipo de cambio (D10).
// Compartida por M3 y M4. La moneda elegida es la de TODA la operación: el
// usuario carga precio, flete, seguro y otros costos en esa moneda, el motor
// (agnóstico de moneda) calcula en esa misma unidad y el resultado se muestra
// sin convertir. La cotización sólo se usa para el equivalente en USD.
// (Antes se trataban los montos como USD y se convertían al mostrar: con EUR
// el resultado salía convertido de más.)
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

export const FX_CURRENCIES = ["USD", "EUR", "ARS", "BRL", "CLP"] as const;
export type FxCurrency = (typeof FX_CURRENCIES)[number];

/** Formatea un monto ya expresado en la moneda de la operación (es-AR, 2 decimales). */
export function fxFormat(amount: number): string {
  return amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Equivalente en USD de un monto en la moneda de la operación; null si no hay cotización. */
export function fxToUsd(amount: number, currency: string, fxRate: number | null): number | null {
  if (!currency || currency === "USD") return amount;
  return fxRate ? amount / fxRate : null;
}

export interface FxCurrencyState {
  currency: string;
  setCurrency: (c: string) => void;
  /** 1 para USD; null si no se pudo obtener la cotización. */
  fxRate: number | null;
  fxMeta: { date: string; source: string } | null;
  /** Moneda de la operación tal como se muestra junto a los montos. */
  displayCurrency: string;
  /** Formatea un monto en la moneda de la operación (sin convertir). */
  fmt: (amount: number) => string;
  /** Equivalente en USD formateado ("" si la moneda es USD o no hay cotización). */
  usdEquiv: (amount: number) => string;
}

export function useFxCurrency(initialCurrency = ""): FxCurrencyState {
  const [currency, setCurrency] = useState(initialCurrency);
  const [fxRate, setFxRate] = useState<number | null>(1);
  const [fxMeta, setFxMeta] = useState<{ date: string; source: string } | null>(null);

  useEffect(() => {
    // "" = sin moneda elegida · "USD" = base, sin conversión.
    if (!currency || currency === "USD") {
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

  const displayCurrency = currency;
  const fmt = (amount: number) => fxFormat(amount);
  const usdEquiv = (amount: number) => {
    if (!currency || currency === "USD") return "";
    const usd = fxToUsd(amount, currency, fxRate);
    return usd === null ? "" : `USD ${fxFormat(usd)}`;
  };

  return { currency, setCurrency, fxRate, fxMeta, displayCurrency, fmt, usdEquiv };
}
