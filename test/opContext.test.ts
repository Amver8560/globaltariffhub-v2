import { describe, it, expect } from "vitest";
import { buildOpQuery, readOpContext } from "@/lib/opContext";

function roundTrip(ctx: Record<string, string>) {
  const qs = buildOpQuery(ctx);
  const sp = new URLSearchParams(qs.replace(/^\?/, ""));
  return readOpContext(sp);
}

describe("opContext — continuidad de la operación (Bloque 3)", () => {
  it("conserva '0' (cero informado) y omite '' (dato faltante)", () => {
    const qs = buildOpQuery({ intl_freight: "0", pre_shipment: "", insurance_value: "150" });
    expect(qs).toContain("intl_freight=0");
    expect(qs).not.toContain("pre_shipment");
    expect(qs).toContain("insurance_value=150");
  });

  it("transporta el TariffDatum completo como JSON y se reconstruye igual", () => {
    const datum = {
      value: 22.5,
      status: "referential",
      unit: "%",
      source: { id: "WTO.HS_A_0010", name: "WTO — promedio simple MFN por HS6", kind: "api" },
      as_of: { kind: "year", value: "2024" },
      nomenclature: { system: "HS", level: "HS6", national_position_determined: false },
    };
    const ctx = roundTrip({ tariff_datum: JSON.stringify(datum) });
    expect(ctx.tariff_datum).toBeTruthy();
    expect(JSON.parse(ctx.tariff_datum as string)).toEqual(datum);
  });

  it("incluye incoterm y NO incluye transport_mode", () => {
    const ctx = roundTrip({ incoterm: "CIF", currency: "USD" });
    expect(ctx.incoterm).toBe("CIF");
    expect(ctx.currency).toBe("USD");
    expect("transport_mode" in ctx).toBe(false);
  });

  it("pref_tariff_datum viaja aparte del general", () => {
    const g = JSON.stringify({ value: 35, status: "referential" });
    const p = JSON.stringify({ value: 0, status: "referential" });
    const ctx = roundTrip({ tariff_datum: g, pref_tariff_datum: p });
    expect(JSON.parse(ctx.tariff_datum as string).value).toBe(35);
    expect(JSON.parse(ctx.pref_tariff_datum as string).value).toBe(0);
  });
});
