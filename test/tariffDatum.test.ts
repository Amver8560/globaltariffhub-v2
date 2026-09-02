import { describe, it, expect } from "vitest";
import { deriveConfidence, notDetermined, toLegacyRateString, toLegacyRateNumber } from "@/lib/tariffDatum";

describe("deriveConfidence — factores verificables, nunca la IA", () => {
  it("nacional + vigente + calidad + sin aproximaciones → high", () => {
    const c = deriveConfidence({
      jurisdictionMatch: true, nationalLevel: true, current: true, qualitySource: true, hasApproximations: false,
    });
    expect(c.level).toBe("high");
  });

  it("agregado multilateral HS6 (aproximación) nunca es high", () => {
    const c = deriveConfidence({
      jurisdictionMatch: true, nationalLevel: false, current: true, qualitySource: true, hasApproximations: true,
    });
    expect(c.level).not.toBe("high");
    expect(c.rationale).toMatch(/HS6|promedio|aproximación/i);
  });

  it("sin vigencia utilizable → no puede ser high", () => {
    const c = deriveConfidence({
      jurisdictionMatch: true, nationalLevel: true, current: false, qualitySource: true, hasApproximations: false,
    });
    expect(c.level).not.toBe("high");
    expect(c.rationale).toMatch(/vigencia/i);
  });

  it("jurisdicción que no corresponde → low, siempre", () => {
    const c = deriveConfidence({
      jurisdictionMatch: false, nationalLevel: true, current: true, qualitySource: true, hasApproximations: false,
    });
    expect(c.level).toBe("low");
  });
});

describe("notDetermined", () => {
  it("value null, status not_determined, requires_validation, note obligatoria", () => {
    const d = notDetermined("Estados Unidos", "GTH no tiene fuente para este corredor.");
    expect(d.value).toBeNull();
    expect(d.status).toBe("not_determined");
    expect(d.requires_validation).toBe(true);
    expect(d.note).toBeTruthy();
    expect(d.jurisdiction.country).toBe("Estados Unidos");
  });
});

describe("toLegacyRate* — derivan EXCLUSIVAMENTE del TariffDatum, nunca fallback", () => {
  const base = notDetermined("X", "nada");

  it("not_determined → null (string y number)", () => {
    expect(toLegacyRateString(base)).toBeNull();
    expect(toLegacyRateNumber(base)).toBeNull();
    expect(toLegacyRateString(null)).toBeNull();
    expect(toLegacyRateString(undefined)).toBeNull();
  });

  it("referential con valor → ese valor, no un default", () => {
    const d = { ...base, status: "referential" as const, value: 6.5 };
    expect(toLegacyRateString(d)).toBe("6.5%");
    expect(toLegacyRateNumber(d)).toBe(6.5);
  });

  it("value null aunque el status no sea not_determined → null", () => {
    const d = { ...base, status: "referential" as const, value: null };
    expect(toLegacyRateString(d)).toBeNull();
  });
});
