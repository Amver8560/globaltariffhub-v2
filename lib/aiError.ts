// ─────────────────────────────────────────────────────────────
// GTH — Manejo de errores de las rutas con IA
// Detecta saturación temporal (rate limit / overloaded) y devuelve
// un mensaje amable + código AI_BUSY. Si el usuario ya había
// consumido un crédito, se lo devuelve.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { refundCredit } from "@/lib/credits";

/** true si el error indica que el servicio de IA está saturado y conviene reintentar. */
export function isAIBusyError(error: any): boolean {
  const status =
    error?.status ??
    error?.statusCode ??
    error?.response?.status ??
    null;
  if (status === 429 || status === 503 || status === 529) return true;
  const msg = String(error?.message || "").toLowerCase();
  return /overloaded|rate limit|too many requests|capacity/.test(msg);
}

export function aiBusyMessage(lang?: string): string {
  return lang === "en"
    ? "We're experiencing high demand right now. Wait a minute and try again — this query was not deducted from your credits."
    : "Estamos con mucha demanda en este momento. Esperá un minuto y volvé a intentar — esta consulta no se descontó de tus créditos.";
}

export function aiGenericMessage(lang?: string): string {
  return lang === "en"
    ? "Something went wrong processing your request. Please try again."
    : "Ocurrió un error procesando la consulta. Intentá de nuevo.";
}

/**
 * Respuesta estándar para el catch de una ruta con IA.
 * - Saturación → 429 + mensaje amable + refund del crédito (si se pasa userId).
 * - Otro error → 500 + mensaje genérico (o `fallback`).
 */
export async function aiErrorResponse(
  error: any,
  opts: { lang?: string; userId?: string; fallback?: string } = {}
): Promise<NextResponse> {
  const { lang, userId, fallback } = opts;

  if (isAIBusyError(error)) {
    if (userId) {
      try { await refundCredit(userId); } catch { /* no bloquear la respuesta */ }
    }
    return NextResponse.json(
      { error: aiBusyMessage(lang), code: "AI_BUSY", retryable: true },
      { status: 429 }
    );
  }

  console.error("AI route error:", error);
  return NextResponse.json(
    { error: fallback ?? aiGenericMessage(lang) },
    { status: 500 }
  );
}
