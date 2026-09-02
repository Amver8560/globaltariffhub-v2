import { describe, it, expect, vi } from "vitest";
import {
  describeAIError,
  creditNote,
  fetchWithDeadline,
  isAbortError,
} from "@/lib/aiClient";

describe("describeAIError", () => {
  it("sesión vencida → needsLogin, sin reintento", () => {
    const v = describeAIError({ lang: "es", status: 401, payload: { code: "UNAUTHENTICATED" } });
    expect(v.needsLogin).toBe(true);
    expect(v.retryable).toBe(false);
    expect(v.credit).toBe("none");
  });

  it("sin créditos → no reintentable, crédito 'spent', usa el mensaje del backend", () => {
    const v = describeAIError({
      lang: "es",
      status: 402,
      payload: { code: "NO_CREDITS", error: "Usaste tus 3 consultas gratuitas." },
    });
    expect(v.retryable).toBe(false);
    expect(v.credit).toBe("spent");
    expect(v.message).toMatch(/3 consultas/);
  });

  it("verificación de créditos caída → reintentable y crédito intacto", () => {
    const v = describeAIError({ lang: "es", status: 503, payload: { code: "CREDIT_CHECK_FAILED" } });
    expect(v.retryable).toBe(true);
    expect(v.credit).toBe("kept");
  });

  it("abort del cliente (backstop vencido) → reintentable, crédito sin confirmar ('review'), sin promesas en el mensaje", () => {
    const err = Object.assign(new Error("aborted"), { name: "AbortError" });
    const v = describeAIError({ lang: "es", thrown: err });
    expect(v.retryable).toBe(true);
    expect(v.credit).toBe("review");
    expect(v.code).toBe("CLIENT_TIMEOUT");
    expect(v.message).not.toMatch(/reponemos|restore/i);
  });

  it("error de red sin respuesta → reintentable, crédito sin confirmar ('review')", () => {
    const v = describeAIError({ lang: "es", thrown: new TypeError("Failed to fetch") });
    expect(v.retryable).toBe(true);
    expect(v.credit).toBe("review");
    expect(v.code).toBe("NETWORK");
  });

  it("cuerpo uniforme del backend con credit_refunded=true → 'kept'", () => {
    const v = describeAIError({
      lang: "es",
      status: 504,
      payload: { error: "La consulta tardó demasiado. Tu consulta no se descontó.", code: "AI_TIMEOUT", retryable: true, credit_refunded: true },
    });
    expect(v.retryable).toBe(true);
    expect(v.credit).toBe("kept");
    expect(v.code).toBe("AI_TIMEOUT");
  });

  it("cuerpo del backend con credit_refunded=false → 'review'", () => {
    const v = describeAIError({
      lang: "es",
      status: 500,
      payload: { error: "No pudimos completar la consulta.", code: "AI_ERROR", retryable: true, credit_refunded: false },
    });
    expect(v.credit).toBe("review");
  });

  it("respeta el idioma en los mensajes propios del cliente", () => {
    const v = describeAIError({ lang: "en", thrown: new TypeError("Failed to fetch") });
    expect(v.message).toMatch(/Connection problem/i);
  });
});

describe("creditNote", () => {
  it("mapea cada estado de crédito a una línea (o null)", () => {
    expect(creditNote({ credit: "kept" } as any, "es")).toMatch(/no se descontó/);
    expect(creditNote({ credit: "review" } as any, "es")).toMatch(/No pudimos confirmar/);
    expect(creditNote({ credit: "review" } as any, "es")).not.toMatch(/reponemos/);
    expect(creditNote({ credit: "spent" } as any, "es")).toBeNull();
    expect(creditNote({ credit: "none" } as any, "es")).toBeNull();
  });
});

describe("fetchWithDeadline", () => {
  it("aborta la request cuando vence el plazo", async () => {
    const fakeFetch = vi.fn((_url: unknown, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () =>
          reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
        );
      }),
    );
    vi.stubGlobal("fetch", fakeFetch);

    await expect(fetchWithDeadline("/x", {}, 20)).rejects.toSatisfy(
      (e: unknown) => isAbortError(e),
    );
    expect(fakeFetch).toHaveBeenCalledOnce();

    vi.unstubAllGlobals();
  });

  it("resuelve normalmente si la respuesta llega a tiempo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })));
    const res = await fetchWithDeadline("/x", {}, 1000);
    expect(res.status).toBe(200);
    vi.unstubAllGlobals();
  });
});
