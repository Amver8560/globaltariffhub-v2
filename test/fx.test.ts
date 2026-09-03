import { describe, it, expect } from "vitest";
import { fxDisplayCurrency, fxFormat, FX_CURRENCIES } from "@/lib/useFxCurrency";

describe("Bloque 3 · unidad FX compartida (D10)", () => {
  it("USD: rate 1, sin conversión", () => {
    expect(fxDisplayCurrency("USD", 1)).toBe("USD");
    expect(fxFormat(1000, "USD", 1)).toBe("1.000,00");
  });

  it("otra moneda con cotización: convierte", () => {
    expect(fxDisplayCurrency("ARS", 1000)).toBe("ARS");
    expect(fxFormat(10, "ARS", 1000)).toBe("10.000,00");
  });

  it("otra moneda SIN cotización: degrada a USD, no convierte", () => {
    expect(fxDisplayCurrency("EUR", null)).toBe("USD");
    expect(fxFormat(10, "EUR", null)).toBe("10,00");
  });

  it("moneda no elegida (''): no se asume USD; formatea el número tal cual", () => {
    expect(fxDisplayCurrency("", 1)).toBe("");
    expect(fxDisplayCurrency("", null)).toBe("");
    expect(fxFormat(1234.5, "", 999)).toBe("1.234,50"); // sin conversión aunque haya fxRate
  });

  it("la lista de monedas es la esperada", () => {
    expect([...FX_CURRENCIES]).toEqual(["USD", "EUR", "ARS", "BRL", "CLP"]);
  });
});
