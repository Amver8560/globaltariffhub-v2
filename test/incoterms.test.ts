import { describe, it, expect } from "vitest";
import {
  SUPPORTED_INCOTERMS,
  isSupportedIncoterm,
  ASK_FOR_BASE,
  CONTEXTUAL_BASE,
  ALREADY_IN_PRICE,
  INCOTERM_META,
} from "@/lib/incoterms";

describe("Bloque 3 · incoterms — set cerrado (D1)", () => {
  it("son exactamente EXW · FCA · FOB · CFR · CIF", () => {
    expect([...SUPPORTED_INCOTERMS]).toEqual(["EXW", "FCA", "FOB", "CFR", "CIF"]);
  });

  it("isSupportedIncoterm rechaza DAP/DDP/CPT/CIP y cualquier otro string", () => {
    for (const bad of ["DAP", "DDP", "CPT", "CIP", "fob", "", "XYZ", null, undefined, 5]) {
      expect(isSupportedIncoterm(bad)).toBe(false);
    }
    for (const ok of SUPPORTED_INCOTERMS) expect(isSupportedIncoterm(ok)).toBe(true);
  });
});

describe("Bloque 3 · incoterms — qué pide GTH para la base", () => {
  it("CIF no pide nada para la base (flete y seguro ya en el precio)", () => {
    expect(ASK_FOR_BASE.CIF).toEqual([]);
    expect(ALREADY_IN_PRICE.CIF).toContain("Flete internacional");
    expect(ALREADY_IN_PRICE.CIF).toContain("Seguro internacional");
  });

  it("CFR pide sólo el seguro (el flete ya está en el precio)", () => {
    expect(ASK_FOR_BASE.CFR).toEqual(["insurance"]);
    expect(ALREADY_IN_PRICE.CFR).toContain("Flete internacional");
    expect(ALREADY_IN_PRICE.CFR).not.toContain("Seguro internacional");
  });

  it("FOB pide flete y seguro; no pide pre-embarque (ya en el precio)", () => {
    expect(ASK_FOR_BASE.FOB).toEqual(["international_freight", "insurance"]);
    expect(ASK_FOR_BASE.FOB).not.toContain("pre_shipment");
  });

  it("EXW pide pre-embarque + flete + seguro; ninguno es contextual", () => {
    expect(ASK_FOR_BASE.EXW).toEqual(["pre_shipment", "international_freight", "insurance"]);
    expect(CONTEXTUAL_BASE.EXW).toEqual([]);
  });

  it("FCA pide flete + seguro y trata el pre-embarque como contextual (no bloquea)", () => {
    expect(ASK_FOR_BASE.FCA).toContain("international_freight");
    expect(ASK_FOR_BASE.FCA).toContain("insurance");
    expect(CONTEXTUAL_BASE.FCA).toEqual(["pre_shipment"]);
  });
});

describe("Bloque 3 · incoterms — metadata", () => {
  it("FOB/CFR/CIF llevan nota de transporte marítimo/fluvial; EXW/FCA no", () => {
    for (const c of ["FOB", "CFR", "CIF"] as const) {
      expect(INCOTERM_META[c].transport_scope).toBe("sea_inland");
      expect(INCOTERM_META[c].scope_note_es.length).toBeGreaterThan(0);
    }
    for (const c of ["EXW", "FCA"] as const) {
      expect(INCOTERM_META[c].transport_scope).toBe("any");
      expect(INCOTERM_META[c].scope_note_es).toBe("");
    }
  });
});
