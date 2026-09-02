import { describe, it, expect } from "vitest";
import { resolveJurisdiction } from "@/lib/jurisdiction";

const ids = (p: ReturnType<typeof resolveJurisdiction>) => p.tariff_sources.map((s) => s.id);

describe("resolveJurisdiction — nomenclatura por jurisdicción/región", () => {
  it("importador MERCOSUR → regime NCM; incluye NCM, NO TARIC", () => {
    for (const c of ["Argentina", "Brasil", "Uruguay", "Paraguay"]) {
      const p = resolveJurisdiction(c);
      expect(p.regime).toBe("NCM");
      expect(ids(p)).toContain("NCM_NOMENCLATURE");
      expect(ids(p)).not.toContain("TARIC_TABLE");
      expect(p.membership_source).toMatch(/MERCOSUR/);
    }
  });

  it("importador UE → regime TARIC; incluye TARIC, NO NCM", () => {
    for (const c of ["España", "Alemania", "Francia", "Italia"]) {
      const p = resolveJurisdiction(c);
      expect(p.regime).toBe("TARIC");
      expect(ids(p)).toContain("TARIC_TABLE");
      expect(ids(p)).not.toContain("NCM_NOMENCLATURE");
    }
  });

  it("Reino Unido NO es UE (post-Brexit) → unknown", () => {
    expect(resolveJurisdiction("Reino Unido").regime).toBe("unknown");
  });

  it("importador fuera de bloque (EE.UU., China) → unknown; sólo WTO/WITS HS6", () => {
    for (const c of ["Estados Unidos", "China", "Japón", "México", "Chile"]) {
      const p = resolveJurisdiction(c);
      expect(p.regime).toBe("unknown");
      expect(ids(p).sort()).toEqual(["WITS_HS6", "WTO_HS6"]);
    }
  });

  it("una fuente nacional/regional tiene mayor prioridad que la multilateral HS6", () => {
    const eu = resolveJurisdiction("Alemania");
    const taricTable = eu.tariff_sources.find((s) => s.id === "TARIC_TABLE")!;
    const wto = eu.tariff_sources.find((s) => s.id === "WTO_HS6")!;
    expect(taricTable.priority).toBeGreaterThan(wto.priority);
  });
});
