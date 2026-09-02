import { describe, it, expect, vi, beforeEach } from "vitest";

// El módulo bajo prueba importa NextResponse y refundCredit; los aislamos.
const refundCredit = vi.fn(async (_userId?: string): Promise<boolean> => true);

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
  refundCredit: (userId?: string) => refundCredit(userId),
}));

import {
  isAIBusyError,
  isAbortOrTimeoutError,
  classifyAIError,
  aiErrorMessage,
  buildAIErrorPayload,
  aiErrorResponse,
} from "@/lib/aiError";

beforeEach(() => {
  refundCredit.mockReset();
  refundCredit.mockResolvedValue(true);
});

describe("isAIBusyError", () => {
  it("detecta 429 / 503 / 529", () => {
    expect(isAIBusyError({ status: 429 })).toBe(true);
    expect(isAIBusyError({ status: 503 })).toBe(true);
    expect(isAIBusyError({ status: 529 })).toBe(true);
  });
  it("detecta mensajes de saturación", () => {
    expect(isAIBusyError({ message: "Overloaded" })).toBe(true);
    expect(isAIBusyError({ message: "rate limit exceeded" })).toBe(true);
  });
  it("no marca errores comunes", () => {
    expect(isAIBusyError({ status: 500 })).toBe(false);
    expect(isAIBusyError(new Error("boom"))).toBe(false);
    expect(isAIBusyError(null)).toBe(false);
  });
});

describe("isAbortOrTimeoutError", () => {
  it("detecta abort del SDK y del AbortSignal", () => {
    expect(isAbortOrTimeoutError({ name: "APIUserAbortError" })).toBe(true);
    expect(isAbortOrTimeoutError({ name: "APIConnectionTimeoutError" })).toBe(true);
    expect(isAbortOrTimeoutError({ name: "AbortError" })).toBe(true);
    expect(isAbortOrTimeoutError({ name: "TimeoutError" })).toBe(true);
  });
  it("detecta por mensaje", () => {
    expect(isAbortOrTimeoutError(new Error("The operation was aborted"))).toBe(true);
    expect(isAbortOrTimeoutError(new Error("request timed out"))).toBe(true);
  });
  it("no marca errores comunes", () => {
    expect(isAbortOrTimeoutError({ status: 500 })).toBe(false);
    expect(isAbortOrTimeoutError(new Error("bad json"))).toBe(false);
  });
});

describe("classifyAIError", () => {
  it("prioriza timeout sobre otros", () => {
    expect(classifyAIError({ name: "APIUserAbortError", status: 500 })).toBe("timeout");
  });
  it("clasifica busy y error", () => {
    expect(classifyAIError({ status: 429 })).toBe("busy");
    expect(classifyAIError(new Error("whatever"))).toBe("error");
  });
});

describe("aiErrorMessage", () => {
  it("incluye el estado del crédito cuando se reintegró", () => {
    const msg = aiErrorMessage("timeout", "es", true);
    expect(msg).toMatch(/no se descontó/i);
  });
  it("deriva a contacto cuando NO se pudo reintegrar", () => {
    const msg = aiErrorMessage("error", "es", false);
    expect(msg).toMatch(/analia@globaltariffhub\.com/);
  });
  it("respeta el idioma", () => {
    expect(aiErrorMessage("busy", "en", true)).toMatch(/not deducted/i);
  });
});

describe("buildAIErrorPayload — SIEMPRE intenta reintegrar", () => {
  it("reintegra y marca credit_refunded=true en un error genérico", async () => {
    const p = await buildAIErrorPayload(new Error("boom"), { lang: "es", userId: "u1" });
    expect(refundCredit).toHaveBeenCalledWith("u1");
    expect(p).toMatchObject({ code: "AI_ERROR", retryable: true, credit_refunded: true });
  });

  it("reintegra también en timeout y en busy", async () => {
    const t = await buildAIErrorPayload({ name: "APIUserAbortError" }, { userId: "u1" });
    expect(t.code).toBe("AI_TIMEOUT");
    expect(refundCredit).toHaveBeenCalledTimes(1);

    const b = await buildAIErrorPayload({ status: 429 }, { userId: "u1" });
    expect(b.code).toBe("AI_BUSY");
    expect(refundCredit).toHaveBeenCalledTimes(2);
  });

  it("credit_refunded=false → pide revisión por contacto, sin prometer reposición", async () => {
    refundCredit.mockResolvedValue(false);
    const p = await buildAIErrorPayload(new Error("x"), { userId: "u1" });
    expect(p.credit_refunded).toBe(false);
    expect(p.error).toMatch(/No pudimos confirmar el estado de tu consulta/);
    expect(p.error).toMatch(/analia@globaltariffhub\.com/);
    expect(p.error).not.toMatch(/reponemos|la restaur|we'll restore/i);
  });

  it("credit_refunded=true → solo afirma 'no se descontó'", async () => {
    refundCredit.mockResolvedValue(true);
    const p = await buildAIErrorPayload({ name: "APIUserAbortError" }, { userId: "u1" });
    expect(p.error).toMatch(/no se descontó/i);
    expect(p.error).not.toMatch(/analia@globaltariffhub\.com/);
  });

  it("no rompe si refundCredit lanza", async () => {
    refundCredit.mockRejectedValue(new Error("db down"));
    const p = await buildAIErrorPayload(new Error("x"), { userId: "u1" });
    expect(p.credit_refunded).toBe(false);
    expect(p.retryable).toBe(true);
  });
});

describe("aiErrorResponse — status coherente y cuerpo uniforme", () => {
  it("busy → 429, timeout → 504, error → 500; siempre retryable", async () => {
    const busy = await aiErrorResponse({ status: 429 }, { userId: "u1" });
    expect(busy.status).toBe(429);

    const to = await aiErrorResponse({ name: "APIConnectionTimeoutError" }, { userId: "u1" });
    expect(to.status).toBe(504);

    const err = await aiErrorResponse(new Error("boom"), { userId: "u1" });
    expect(err.status).toBe(500);

    for (const r of [busy, to, err]) {
      const body = await r.json();
      expect(body.retryable).toBe(true);
      expect(typeof body.credit_refunded).toBe("boolean");
    }
    expect(refundCredit).toHaveBeenCalledTimes(3);
  });
});
