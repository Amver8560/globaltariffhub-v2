import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks de las fuentes ─────────────────────────────────────
const wtoMock = vi.fn();
const witsMock = vi.fn();
const taricMock = vi.fn();
const ncmMock = vi.fn();
const agreementMock = vi.fn();

vi.mock("@/lib/wtoApi", () => ({
  getWTOMFNRate: (...a: unknown[]) => wtoMock(...a),
  normalizeHS6: (c: string) => (c || "").replace(/\D/g, "").slice(0, 6),
}));
vi.mock("@/lib/witsApi", () => ({
  getWitsRates: (...a: unknown[]) => witsMock(...a),
}));
vi.mock("@/lib/taricApi", () => ({
  getTARICByHs6: (...a: unknown[]) => taricMock(...a),
}));
vi.mock("@/lib/ncmApi", () => ({
  getNCMCode: (...a: unknown[]) => ncmMock(...a),
  isNCMVigente: () => true,
  normalizeNCM8: (c: string) => (c || "").replace(/\D/g, "").slice(0, 8),
}));
vi.mock("@/lib/tradeAgreements", () => ({
  getTradeAgreement: (...a: unknown[]) => agreementMock(...a),
}));

import { resolveTariff } from "@/lib/tariffResolver";

const NONE_WTO = { source: "fallback", mfn_rate: null, year: null };
const NONE_WITS = { source: "none", mfn_rate: null, pref_rate: null, year: null };

beforeEach(() => {
  wtoMock.mockReset().mockResolvedValue(NONE_WTO);
  witsMock.mockReset().mockResolvedValue(NONE_WITS);
  taricMock.mockReset().mockResolvedValue(null);
  ncmMock.mockReset().mockResolvedValue(null);
  agreementMock.mockReset().mockReturnValue(null);
});

describe("resolveTariff — nunca fallback, nunca fabrica, siempre uno de tres estados", () => {
  it("WTO devuelve promedio HS6 → referential, HS6, national_position_determined:false", async () => {
    wtoMock.mockResolvedValue({ source: "WTO", mfn_rate: 6.5, year: new Date().getFullYear() - 1 });
    const r = await resolveTariff({ importCountry: "China", code: "901910" });
    expect(r.general.status).toBe("referential");
    expect(r.general.value).toBe(6.5);
    expect(r.general.nomenclature.level).toBe("HS6");
    expect(r.general.nomenclature.national_position_determined).toBe(false);
    expect(r.general.as_of.value).toBe(String(new Date().getFullYear() - 1));
    expect(r.general.requires_validation).toBe(true);
  });

  it("ninguna fuente responde → not_determined, value null, note presente", async () => {
    const r = await resolveTariff({ importCountry: "China", code: "901910" });
    expect(r.general.status).toBe("not_determined");
    expect(r.general.value).toBeNull();
    expect(r.general.note).toBeTruthy();
  });

  it("código sin HS6 válido → not_determined, no consulta fuentes", async () => {
    const r = await resolveTariff({ importCountry: "China", code: "12" });
    expect(r.general.status).toBe("not_determined");
    expect(wtoMock).not.toHaveBeenCalled();
    expect(taricMock).not.toHaveBeenCalled();
  });

  it("destino UE sin match en TARIC → NO se rellena con ceros; cae a WTO/WITS referencial o not_determined", async () => {
    taricMock.mockResolvedValue(null); // no hay fila bajo el HS6
    wtoMock.mockResolvedValue({ source: "WTO", mfn_rate: 3.7, year: new Date().getFullYear() - 1 });
    const r = await resolveTariff({ importCountry: "Alemania", code: "851712" });
    expect(taricMock).toHaveBeenCalled();
    expect(r.general.status).toBe("referential");
    expect(r.general.basis).toBe("referential_multilateral");
    expect(r.general.nomenclature.code).not.toMatch(/0000$/); // no padding
  });

  it("destino UE con línea TARIC exacta → prevalece sobre WTO (prioridad), pero sin vigencia → referential (D1)", async () => {
    taricMock.mockResolvedValue({
      via: "table", commodity_code: "8517120000", duty_rate: "0 %", description: "x", unit: "", exact: true, matches: 1,
    });
    wtoMock.mockResolvedValue({ source: "WTO", mfn_rate: 3.7, year: new Date().getFullYear() - 1 });
    const r = await resolveTariff({ importCountry: "Italia", code: "8517120000" });
    expect(r.general.source.id).toBe("EU.TARIC.table"); // TARIC (prioridad 90) ganó sobre WTO (20)
    expect(r.general.value).toBe(0);
    expect(r.general.status).toBe("referential"); // sin fecha de vigencia → no "determined"
    expect(r.general.nomenclature.level).toBe("national-10");
  });

  it("TARIC con tasa no ad valorem (específica/compuesta) → value null, referential", async () => {
    taricMock.mockResolvedValue({
      via: "table", commodity_code: "2204210000", duty_rate: "12.8 EUR / hl", description: "vino", unit: "hl", exact: true, matches: 1,
    });
    const r = await resolveTariff({ importCountry: "Francia", code: "2204210000" });
    expect(r.general.value).toBeNull();
    expect(r.general.status).toBe("referential");
    expect(r.general.note).toMatch(/ad valorem|clasificación|10 dígitos/i);
  });

  it("destino MERCOSUR: NCM aporta nomenclatura/vigencia, NO la tasa; tasa sigue HS6 referencial (D3)", async () => {
    witsMock.mockResolvedValue({ source: "WITS", mfn_rate: 14, pref_rate: null, year: new Date().getFullYear() - 3 });
    ncmMock.mockResolvedValue({ source: "NCM", codigo: "90191000", descricao: "aparatos", data_fim: "31/12/9999" });
    const r = await resolveTariff({ importCountry: "Brasil", code: "901910" });
    expect(r.general.status).toBe("referential");
    expect(r.general.value).toBe(14);
    expect(r.general.nomenclature.system).toBe("NCM");
    expect(r.general.nomenclature.code).toBe("90191000");
    expect(r.general.note).toMatch(/AEC|MERCOSUR/i);
    // NCM no se consulta para destinos que no son MERCOSUR:
  });

  it("NCM y TARIC NO se consultan para destino fuera de su jurisdicción", async () => {
    await resolveTariff({ importCountry: "Estados Unidos", originCountry: "China", code: "851712" });
    expect(taricMock).not.toHaveBeenCalled();
    expect(ncmMock).not.toHaveBeenCalled();
  });

  it("preferencial: sólo con acuerdo + pref de fuente; el general NO se pisa; requires_validation", async () => {
    witsMock.mockResolvedValue({ source: "WITS", mfn_rate: 10, pref_rate: 0, year: new Date().getFullYear() - 3 });
    agreementMock.mockReturnValue({ name: "MERCOSUR", scope: "x" });
    const r = await resolveTariff({ importCountry: "Brasil", originCountry: "Argentina", code: "901910" });
    expect(r.general.value).toBe(10);            // el general sigue siendo la MFN
    expect(r.preferential?.value).toBe(0);
    expect(r.preferential?.requires_validation).toBe(true);
    expect(r.preferential?.note).toMatch(/origen/i);
  });

  it("sin acuerdo → no hay preferential aunque WITS traiga pref_rate", async () => {
    witsMock.mockResolvedValue({ source: "WITS", mfn_rate: 10, pref_rate: 0, year: 2022 });
    agreementMock.mockReturnValue(null);
    const r = await resolveTariff({ importCountry: "Estados Unidos", originCountry: "China", code: "901910" });
    expect(r.preferential).toBeUndefined();
  });

  it("una fuente que lanza no rompe la resolución", async () => {
    wtoMock.mockRejectedValue(new Error("boom"));
    witsMock.mockResolvedValue({ source: "WITS", mfn_rate: 5, pref_rate: null, year: 2023 });
    const r = await resolveTariff({ importCountry: "China", code: "901910" });
    expect(r.general.status).toBe("referential");
    expect(r.general.value).toBe(5);
  });
});
