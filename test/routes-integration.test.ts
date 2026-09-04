import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Aislar las rutas de Next, Supabase, el SDK y las fuentes ──
const refundCredit = vi.fn(async () => true);
const checkAndConsumeCredit = vi.fn(async () => ({ ok: true, userId: "u1" }));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

vi.mock("@/lib/credits", () => ({
  checkAndConsumeCredit: () => checkAndConsumeCredit(),
  refundCredit: (id?: string) => refundCredit(),
}));

// El comportamiento del modelo se define por test.
const modelBehavior: { mode: "timeout" | "error" | "ok" } = { mode: "timeout" };

function makeError(mode: "timeout" | "error") {
  return mode === "timeout"
    ? Object.assign(new Error("Request was aborted."), { name: "APIUserAbortError" })
    : new Error("kaboom");
}

vi.mock("@anthropic-ai/sdk", () => {
  class FakeAnthropic {
    messages = {
      create: async () => {
        if (modelBehavior.mode !== "ok") throw makeError(modelBehavior.mode);
        return { content: [{ type: "text", text: "{}" }] };
      },
      stream: () => ({
        on: () => {},
        finalMessage: async () => {
          if (modelBehavior.mode !== "ok") throw makeError(modelBehavior.mode);
          return { content: [{ type: "text", text: "{}" }] };
        },
      }),
    };
  }
  return { default: FakeAnthropic };
});

// Fuentes de enriquecimiento — no se alcanzan en los caminos de fallo.
vi.mock("@/lib/wtoApi", () => ({ getWTOMFNRate: vi.fn(), normalizeHS6: (s: string) => s.replace(/\D/g, "").slice(0, 6) }));
vi.mock("@/lib/ncmApi", () => ({ getNCMCode: vi.fn(), normalizeNCM8: (s: string) => s.replace(/\D/g, "").slice(0, 8) }));
vi.mock("@/lib/taricApi", () => ({ getTARICRate: vi.fn(), hs6ToTaric: (s: string) => s.padEnd(10, "0") }));
vi.mock("@/lib/witsApi", () => ({ getWitsRates: vi.fn(async () => ({ mfn_rate: null, pref_rate: null, year: null, source: "none" })) }));

// Bloque 3 — resolver de arancel controlado por test (no toca fuentes reales).
const tariffBehavior: { status: "referential" | "not_determined"; value: number | null } = { status: "referential", value: 10 };
vi.mock("@/lib/tariffResolver", () => ({
  resolveTariff: vi.fn(async () => ({
    general: {
      status: tariffBehavior.status,
      value: tariffBehavior.value,
      unit: "%",
      basis: "referential_multilateral",
      source: { id: "test", name: "test", kind: "api" },
      as_of: { kind: "year", value: "2025" },
      nomenclature: { system: "HS", level: "HS6", national_position_determined: false },
      jurisdiction: { country: "Brasil", role: "import" },
      confidence: { level: "medium", rationale: "test" },
      requires_validation: true,
      note: "test",
    },
    preferential: null,
    jurisdiction: { regime: "unknown" },
  })),
}));

import { POST as searchPOST } from "@/app/api/search/route";
import { POST as certificatePOST } from "@/app/api/certificate/route";
import { POST as viabilityPOST } from "@/app/api/viability/route";

const MARKER = "\x00ENRICHED\x00";

beforeEach(() => {
  refundCredit.mockClear();
  refundCredit.mockResolvedValue(true);
  checkAndConsumeCredit.mockClear();
  checkAndConsumeCredit.mockResolvedValue({ ok: true, userId: "u1" });
  modelBehavior.mode = "timeout";
});

describe("/api/search — el stream nunca queda colgado", () => {
  function req() {
    const fd = new FormData();
    fd.set("query", "vino tinto");
    fd.set("origin", "Argentina");
    fd.set("destination", "Brasil");
    fd.set("lang", "es");
    return new Request("http://x/api/search", { method: "POST", body: fd }) as never;
  }

  it("timeout del modelo → frame de error uniforme + reintegro, y el stream cierra", async () => {
    modelBehavior.mode = "timeout";
    const res = await searchPOST(req());
    const text = await (res as Response).text(); // resuelve → no quedó colgado

    const idx = text.indexOf(MARKER);
    expect(idx).toBeGreaterThanOrEqual(0);
    const payload = JSON.parse(text.slice(idx + MARKER.length));

    expect(payload).toMatchObject({ code: "AI_TIMEOUT", retryable: true, credit_refunded: true });
    expect(refundCredit).toHaveBeenCalledTimes(1);
    expect(payload.error).toMatch(/no se descontó/i);
  });

  it("error genérico del modelo → AI_ERROR + reintegro", async () => {
    modelBehavior.mode = "error";
    const res = await searchPOST(req());
    const text = await (res as Response).text();
    const payload = JSON.parse(text.slice(text.indexOf(MARKER) + MARKER.length));
    expect(payload.code).toBe("AI_ERROR");
    expect(payload.credit_refunded).toBe(true);
    expect(refundCredit).toHaveBeenCalledTimes(1);
  });
});

describe("/api/certificate — catch no streaming", () => {
  function req() {
    return new Request("http://x/api/certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: "Argentina", destination: "Brasil", fob_value: 10000, quantity: "1", unit: "kg", lang: "es" }),
    }) as never;
  }

  it("timeout → 504 + cuerpo uniforme + reintegro", async () => {
    modelBehavior.mode = "timeout";
    const res: any = await certificatePOST(req());
    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body).toMatchObject({ code: "AI_TIMEOUT", retryable: true, credit_refunded: true });
    expect(refundCredit).toHaveBeenCalledTimes(1);
  });

  it("error genérico → 500 + reintegro (crédito no se pierde)", async () => {
    modelBehavior.mode = "error";
    const res: any = await certificatePOST(req());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("AI_ERROR");
    expect(body.credit_refunded).toBe(true);
  });

  it("si el reintegro falla → credit_refunded=false y mensaje deriva a contacto", async () => {
    modelBehavior.mode = "error";
    refundCredit.mockResolvedValue(false);
    const res: any = await certificatePOST(req());
    const body = await res.json();
    expect(body.credit_refunded).toBe(false);
    expect(body.error).toMatch(/analia@globaltariffhub\.com/);
  });
});

describe("/api/viability — Bloque 3 · motor canónico de costos", () => {
  function req(fields: Record<string, string>) {
    const fd = new FormData();
    const base: Record<string, string> = {
      hs_code: "220421", tariff_system: "HS", supplier_country: "Argentina",
      destination: "Brasil", unit_price: "10000", quantity: "1", lang: "es",
    };
    for (const [k, v] of Object.entries({ ...base, ...fields })) fd.set(k, v);
    return new Request("http://x/api/viability", { method: "POST", body: fd }) as never;
  }

  beforeEach(() => { tariffBehavior.status = "referential"; tariffBehavior.value = 10; });

  it("body JSON / no-form → 400 INVALID_REQUEST, sin 5xx y sin consumir crédito", async () => {
    const jsonReq = new Request("http://x/api/viability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: "Brasil", unit_price: 10000 }),
    }) as never;
    const res: any = await viabilityPOST(jsonReq);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("INVALID_REQUEST");
    expect(checkAndConsumeCredit).not.toHaveBeenCalled();
  });

  it("body vacío → 400 INVALID_REQUEST, sin consumir crédito", async () => {
    const emptyReq = new Request("http://x/api/viability", { method: "POST" }) as never;
    const res: any = await viabilityPOST(emptyReq);
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_REQUEST");
    expect(checkAndConsumeCredit).not.toHaveBeenCalled();
  });

  it("sin Incoterm → 400 MISSING_INCOTERM y NO consume crédito", async () => {
    const res: any = await viabilityPOST(req({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("MISSING_INCOTERM");
    expect(checkAndConsumeCredit).not.toHaveBeenCalled();
  });

  it("CIF + flete informado → el flete no se re-suma; base = precio declarado", async () => {
    const res: any = await viabilityPOST(req({ incoterm: "CIF", intl_freight: "800" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cost.base_known).toBe(10000);
    expect(body.cost.already_in_price).toContain("Flete internacional");
    expect(body.cost.operation_estimate).toBe(11000); // + 10% arancel
    expect(body.not_included_notice).toBeTruthy();
  });

  it("FOB con flete NO informado → resultado parcial, no bloqueo; sin default", async () => {
    const res: any = await viabilityPOST(req({ incoterm: "FOB" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cost.completeness).toBe("partial");
    expect(body.cost.missing_base_components).toEqual(
      expect.arrayContaining(["flete internacional", "seguro internacional"]),
    );
    expect(body.cost.base_known).toBe(10000);
  });

  it("arancel not_determined → sólo base conocida, sin estimación", async () => {
    tariffBehavior.status = "not_determined"; tariffBehavior.value = null;
    const res: any = await viabilityPOST(req({ incoterm: "CIF" }));
    const body = await res.json();
    expect(body.cost.completeness).toBe("not_computable");
    expect(body.cost.operation_estimate).toBeNull();
    expect(body.cost.base_known).toBe(10000);
  });
});
