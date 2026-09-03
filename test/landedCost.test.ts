import { describe, it, expect } from "vitest";
import { computeLandedCost, toMoney, toInsurance, type CostInput } from "@/lib/landedCost";

const REF = { status: "referential" as const, rate: 10 };
const NOT_DET = { status: "not_determined" as const, rate: null };

function base(over: Partial<CostInput>): CostInput {
  return { declared_value: 10000, incoterm: "FOB", duty: REF, ...over };
}

describe("computeLandedCost — CIF: nada se re-suma para la base", () => {
  it("base = precio declarado; flete y seguro aparecen como ya incluidos", () => {
    const r = computeLandedCost(
      base({
        incoterm: "CIF",
        declared_value: 12000,
        // aunque el usuario mande valores, NO deben sumarse (no double counting)
        international_freight: { state: "informed", value: 800 },
        insurance: { state: "informed", kind: "amount", value: 60 },
      }),
    );
    expect(r.base_known).toBe(12000);
    expect(r.added_to_base).toHaveLength(0);
    expect(r.already_in_price).toEqual(
      expect.arrayContaining(["Flete internacional", "Seguro internacional"]),
    );
    expect(r.missing_base_components).toHaveLength(0);
    expect(r.base_complete).toBe(true);
    expect(r.completeness).toBe("complete");
    expect(r.duty.amount).toBe(1200); // 10% de 12000
    expect(r.operation_estimate).toBe(13200);
  });
});

describe("computeLandedCost — CFR (validación ATLAS: flete ya incluido, sólo pide seguro)", () => {
  it("reconoce el flete ya incluido; suma sólo el seguro; sin double counting", () => {
    const r = computeLandedCost(
      base({
        incoterm: "CFR",
        declared_value: 10000,
        international_freight: { state: "informed", value: 700 }, // debe ignorarse (ya en el precio)
        pre_shipment: { state: "informed", value: 400 },          // no lo pide CFR → ignorado
        insurance: { state: "informed", kind: "amount", value: 80 },
      }),
    );
    expect(r.base_known).toBe(10080); // 10000 + 80 seguro, NADA de flete ni pre-embarque
    expect(r.added_to_base.map((l) => l.key)).toEqual(["insurance"]);
    expect(r.already_in_price).toContain("Flete internacional");
    expect(r.missing_base_components).toHaveLength(0);
    expect(r.completeness).toBe("complete");
  });

  it("seguro NO informado → resultado parcial, sin aplicar ningún default", () => {
    const r = computeLandedCost(base({ incoterm: "CFR", declared_value: 10000, insurance: { state: "missing" } }));
    expect(r.base_known).toBe(10000); // se muestra lo conocido
    expect(r.missing_base_components).toEqual(["seguro internacional"]);
    expect(r.completeness).toBe("partial");
    expect(r.added_to_base.find((l) => l.key === "insurance")).toBeUndefined(); // no se inventó %
  });

  it("seguro = 0 informado deliberadamente → completo, sin faltantes", () => {
    const r = computeLandedCost(base({ incoterm: "CFR", declared_value: 10000, insurance: { state: "zero" } }));
    expect(r.missing_base_components).toHaveLength(0);
    expect(r.base_known).toBe(10000);
    expect(r.completeness).toBe("complete");
  });
});

describe("computeLandedCost — FOB: pide flete y seguro", () => {
  it("ambos informados → base completa", () => {
    const r = computeLandedCost(
      base({
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "informed", kind: "amount", value: 50 },
      }),
    );
    expect(r.base_known).toBe(10650);
    expect(r.base_complete).toBe(true);
    expect(r.completeness).toBe("complete");
    expect(r.duty.amount).toBe(1065);
    expect(r.operation_estimate).toBe(11715);
  });

  it("seguro % se calcula sobre el acumulado previo (precio + flete)", () => {
    const r = computeLandedCost(
      base({
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "informed", kind: "percent", value: 1 }, // 1% de 10600
      }),
    );
    expect(r.base_known).toBe(10706); // 10000 + 600 + 106
  });
});

describe("computeLandedCost — tres estados: informed / zero / missing", () => {
  it("zero: el usuario declaró 0 → cuenta 0, NO falta, resultado completo", () => {
    const r = computeLandedCost(
      base({
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "zero" },
      }),
    );
    expect(r.missing_base_components).toHaveLength(0);
    expect(r.base_complete).toBe(true);
    expect(r.base_known).toBe(10600);
    expect(r.completeness).toBe("complete");
  });

  it("missing: seguro no informado → resultado PARCIAL, no bloqueo; sin default", () => {
    const r = computeLandedCost(
      base({
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "missing" },
      }),
    );
    expect(r.base_known).toBe(10600); // se muestra lo conocido
    expect(r.missing_base_components).toEqual(["seguro internacional"]);
    expect(r.base_complete).toBe(false);
    expect(r.completeness).toBe("partial");
    // provisional: el arancel se calcula sobre lo conocido, marcado como provisional
    expect(r.duty.amount).toBe(1060);
    expect(r.operation_estimate).toBe(11660);
    expect(r.note_es).toContain("provisional");
    expect(r.note_es).toContain("seguro internacional");
    // no se inventó ningún porcentaje ni se asumió 0
    expect(r.added_to_base.find((l) => l.key === "insurance")).toBeUndefined();
  });

  it("missing en flete Y seguro → parcial, ambos listados, sin inventar", () => {
    const r = computeLandedCost(base({ international_freight: { state: "missing" }, insurance: { state: "missing" } }));
    expect(r.base_known).toBe(10000);
    expect(r.missing_base_components).toEqual(["flete internacional", "seguro internacional"]);
    expect(r.completeness).toBe("partial");
    expect(r.operation_estimate).toBe(11000); // 10% de 10000, provisional
  });
});

describe("computeLandedCost — EXW: pide pre-embarque + flete + seguro", () => {
  it("todo informado → completo", () => {
    const r = computeLandedCost(
      base({
        incoterm: "EXW",
        pre_shipment: { state: "informed", value: 300 },
        international_freight: { state: "informed", value: 900 },
        insurance: { state: "informed", kind: "amount", value: 60 },
      }),
    );
    expect(r.base_known).toBe(11260);
    expect(r.base_complete).toBe(true);
  });

  it("pre-embarque faltante → parcial (no bloquea la exploración)", () => {
    const r = computeLandedCost(
      base({
        incoterm: "EXW",
        pre_shipment: { state: "missing" },
        international_freight: { state: "informed", value: 900 },
        insurance: { state: "informed", kind: "amount", value: 60 },
      }),
    );
    expect(r.base_known).toBe(10960);
    expect(r.missing_base_components).toContain("costos previos al transporte internacional");
    expect(r.completeness).toBe("partial");
  });
});

describe("computeLandedCost — FCA (validación ATLAS: modelo reducido, sin double counting, faltantes → parcial)", () => {
  it("flete y seguro informados, pre-embarque contextual faltante → resultado COMPLETO", () => {
    const r = computeLandedCost(
      base({
        incoterm: "FCA",
        pre_shipment: { state: "missing" },
        international_freight: { state: "informed", value: 700 },
        insurance: { state: "informed", kind: "amount", value: 40 },
      }),
    );
    // el pre-embarque en FCA es contextual: se lista como no informado pero NO bloquea la base
    expect(r.missing_base_components).toContain("costos previos al transporte internacional");
    expect(r.base_complete).toBe(true);
    expect(r.completeness).toBe("complete");
    expect(r.base_known).toBe(10740); // 10000 + 700 + 40
  });

  it("despacho de exportación ya está en el precio: un valor cargado en un componente no pedido se ignora (sin double counting)", () => {
    const r = computeLandedCost(
      base({
        incoterm: "FCA",
        declared_value: 10000,
        // FCA sólo pide international_freight, insurance y (contextual) pre_shipment.
        international_freight: { state: "informed", value: 700 },
        insurance: { state: "informed", kind: "amount", value: 40 },
        pre_shipment: { state: "informed", value: 300 }, // pre-terminal: se suma
      }),
    );
    expect(r.base_known).toBe(11040); // 10000 + 700 + 40 + 300
    // no hay componentes de origen separados que pudieran duplicarse
    expect(r.added_to_base.map((l) => l.key).sort()).toEqual(["insurance", "international_freight", "pre_shipment"]);
  });

  it("flete faltante → resultado PARCIAL, sin defaults, con el faltante señalado", () => {
    const r = computeLandedCost(
      base({
        incoterm: "FCA",
        international_freight: { state: "missing" },
        insurance: { state: "informed", kind: "amount", value: 40 },
      }),
    );
    expect(r.completeness).toBe("partial");
    expect(r.missing_base_components).toContain("flete internacional");
    expect(r.base_known).toBe(10040); // 10000 + 40 seguro; el flete NO se estima
    expect(r.added_to_base.find((l) => l.key === "international_freight")).toBeUndefined();
  });
});

describe("computeLandedCost — arancel not_determined", () => {
  it("no se inventa tasa; se muestra sólo la base conocida", () => {
    const r = computeLandedCost(
      base({
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "informed", kind: "amount", value: 50 },
        duty: NOT_DET,
      }),
    );
    expect(r.base_known).toBe(10650);
    expect(r.duty.amount).toBeNull();
    expect(r.operation_estimate).toBeNull();
    expect(r.completeness).toBe("not_computable");
    expect(r.note_es).toContain("no está determinado");
  });

  it("rate null con status referential → mismo tratamiento", () => {
    const r = computeLandedCost(base({ incoterm: "CIF", declared_value: 9000, duty: { status: "referential", rate: null } }));
    expect(r.operation_estimate).toBeNull();
    expect(r.completeness).toBe("not_computable");
  });
});

describe("computeLandedCost — precio inválido", () => {
  it("declared_value 0 → not_computable, sin estimación", () => {
    const r = computeLandedCost(base({ declared_value: 0 }));
    expect(r.base_known).toBe(0);
    expect(r.operation_estimate).toBeNull();
    expect(r.completeness).toBe("not_computable");
  });
});

describe("computeLandedCost — otros costos: aparte, opcionales", () => {
  it("no entran a la base ni al operation_estimate; total_with_other_costs es suma explícita", () => {
    const r = computeLandedCost(
      base({
        incoterm: "CIF",
        declared_value: 12000,
        other_costs: [
          { label: "Despacho de importación", amount: { state: "informed", value: 300 } },
          { label: "Transporte interno destino", amount: { state: "zero" } },
          { label: "Gastos portuarios destino", amount: { state: "missing" } },
        ],
      }),
    );
    expect(r.base_known).toBe(12000);
    expect(r.operation_estimate).toBe(13200); // 12000 + 1200 arancel, SIN otros costos
    expect(r.other_costs_declared.map((l) => l.label_es)).toEqual(["Despacho de importación"]);
    expect(r.total_with_other_costs).toBe(13500);
  });

  it("sin otros costos informados → total_with_other_costs null", () => {
    const r = computeLandedCost(base({ incoterm: "CIF", declared_value: 12000 }));
    expect(r.other_costs_declared).toHaveLength(0);
    expect(r.total_with_other_costs).toBeNull();
  });
});

describe("computeLandedCost — no double counting", () => {
  it("componente que el Incoterm ya cubre, con valor cargado, se ignora", () => {
    const r = computeLandedCost(
      base({
        incoterm: "CIF",
        declared_value: 10000,
        international_freight: { state: "informed", value: 5000 },
        insurance: { state: "informed", kind: "percent", value: 50 },
      }),
    );
    expect(r.base_known).toBe(10000);
    expect(r.operation_estimate).toBe(11000);
  });
});

describe("computeLandedCost — paridad M3/M4 (contrato congelado)", () => {
  it("mismo CostInput → mismo CostResult", () => {
    const input = base({
      incoterm: "FOB",
      international_freight: { state: "informed", value: 600 },
      insurance: { state: "informed", kind: "percent", value: 0.8 },
      quantity: { state: "informed", value: 1000 },
    });
    expect(computeLandedCost(input)).toEqual(computeLandedCost({ ...input }));
  });
});

describe("computeLandedCost — per_unit", () => {
  it("cantidad informada > 0 → operation_estimate / cantidad", () => {
    const r = computeLandedCost(
      base({
        incoterm: "CIF",
        declared_value: 10000,
        quantity: { state: "informed", value: 1000 },
      }),
    );
    expect(r.per_unit).toBe(11); // 11000 / 1000
  });
  it("cantidad missing o 0 → per_unit null", () => {
    expect(computeLandedCost(base({ incoterm: "CIF", quantity: { state: "missing" } })).per_unit).toBeNull();
    expect(computeLandedCost(base({ incoterm: "CIF", quantity: { state: "zero" } })).per_unit).toBeNull();
  });
});

describe("computeLandedCost — sin fiscalidad", () => {
  it("operation_estimate nunca supera base_known + duty.amount", () => {
    const r = computeLandedCost(
      base({
        incoterm: "FOB",
        international_freight: { state: "informed", value: 600 },
        insurance: { state: "informed", kind: "amount", value: 50 },
      }),
    );
    expect(r.operation_estimate).toBe(r.base_known + (r.duty.amount ?? 0));
  });
});

describe("computeLandedCost — Incoterm no soportado", () => {
  it("lanza para DAP/DDP/CPT/CIP sin mapear a otro", () => {
    // @ts-expect-error prueba de runtime
    expect(() => computeLandedCost(base({ incoterm: "DDP" }))).toThrow();
    // @ts-expect-error prueba de runtime
    expect(() => computeLandedCost(base({ incoterm: "CPT" }))).toThrow();
  });
});

describe("toMoney / toInsurance — tres estados desde string de formulario", () => {
  it("'' → missing · '0' → zero · '150' → informed", () => {
    expect(toMoney("")).toEqual({ state: "missing" });
    expect(toMoney(undefined)).toEqual({ state: "missing" });
    expect(toMoney("0")).toEqual({ state: "zero" });
    expect(toMoney("150")).toEqual({ state: "informed", value: 150 });
    expect(toMoney("1,5")).toEqual({ state: "informed", value: 1.5 });
    expect(toMoney("abc")).toEqual({ state: "missing" });
  });
  it("toInsurance conserva kind y estado", () => {
    expect(toInsurance("percent", "0.8")).toEqual({ state: "informed", kind: "percent", value: 0.8 });
    expect(toInsurance("amount", "")).toEqual({ state: "missing" });
    expect(toInsurance("amount", "0")).toEqual({ state: "zero" });
  });
});
