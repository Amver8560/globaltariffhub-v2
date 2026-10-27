import { describe, it, expect } from "vitest";
import { fxFormat, fxToUsd, FX_CURRENCIES } from "@/lib/useFxCurrency";

describe("Bloque 3 · moneda de la operación (D10)", () => {
  it("los montos se formatean tal cual, en la moneda de la operación", () => {
    expect(fxFormat(1000)).toBe("1.000,00");
    expect(fxFormat(1234.5)).toBe("1.234,50");
  });

  it("USD: el equivalente en USD es el mismo monto", () => {
    expect(fxToUsd(1000, "USD", 1)).toBe(1000);
  });

  it("otra moneda con cotización: equivalente = monto / cotización", () => {
    // 1 USD = 0,92 EUR → 10.000 EUR ≈ 10.869,57 USD
    expect(fxToUsd(10000, "EUR", 0.92)).toBeCloseTo(10869.565, 2);
    expect(fxToUsd(10000, "ARS", 1000)).toBe(10);
  });

  it("otra moneda SIN cotización: no hay equivalente (no se inventa)", () => {
    expect(fxToUsd(10, "EUR", null)).toBeNull();
  });

  it("moneda no elegida (''): no se asume nada, el monto queda igual", () => {
    expect(fxToUsd(1234.5, "", null)).toBe(1234.5);
  });

  it("la lista de monedas es la esperada", () => {
    expect([...FX_CURRENCIES]).toEqual(["USD", "EUR", "ARS", "BRL", "CLP"]);
  });
});
