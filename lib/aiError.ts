// ─────────────────────────────────────────────────────────────
// GTH — Manejo de errores de las rutas con IA
//
// Un timeout o un error técnico en estas rutas es un fallo del
// servicio (no es lo mismo que la validación en fuente oficial o
// con un profesional, que sí es parte natural del alcance de GTH y
// NO un fallo). Acá solo se maneja lo primero: el mensaje al usuario
// es claro y sin alarmismo, pero describe una falla técnica.
//
// El catch de una ruta con IA se ejecuta antes de responder, así que
// acá SIEMPRE se intenta reintegrar el crédito y se informa qué pasó
// y en qué quedó la consulta.
//
// Tipos de fallo:
//   · busy    → servicio de IA saturado (429/503/529/overloaded)
//   · timeout → superó el límite de tiempo del servidor o se abortó
//   · error   → cualquier otro fallo previo a la respuesta
// Todos son reintentables desde la interfaz.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { refundCredit } from "@/lib/credits";

/** Límite de tiempo del servidor para una llamada al modelo (ms). */
export const MODEL_DEADLINE_MS = 28_000;
/** Límite de tiempo del servidor para el bloque de enriquecimiento con fuentes (ms). */
export const ENRICH_DEADLINE_MS = 9_000;

export type AIErrorKind = "busy" | "timeout" | "error";
export type AIErrorCode = "AI_BUSY" | "AI_TIMEOUT" | "AI_ERROR";

/** true si el error indica que el servicio de IA está saturado y conviene reintentar. */
export function isAIBusyError(error: unknown): boolean {
  const e = error as { status?: number; statusCode?: number; response?: { status?: number }; message?: string } | null;
  const status = e?.status ?? e?.statusCode ?? e?.response?.status ?? null;
  if (status === 429 || status === 503 || status === 529) return true;
  const msg = String(e?.message || "").toLowerCase();
  return /overloaded|rate limit|too many requests|capacity/.test(msg);
}

/** true si el error es un timeout o un abort (deadline del servidor, AbortSignal, SDK). */
export function isAbortOrTimeoutError(error: unknown): boolean {
  const e = error as { name?: string; message?: string; code?: string } | null;
  const name = String(e?.name || "");
  if (
    name === "APIConnectionTimeoutError" ||
    name === "APIUserAbortError" ||
    name === "AbortError" ||
    name === "TimeoutError"
  ) return true;
  if (e?.code === "ETIMEDOUT" || e?.code === "UND_ERR_CONNECT_TIMEOUT") return true;
  const msg = String(e?.message || "").toLowerCase();
  return /timed out|timeout|request was aborted|the operation was aborted/.test(msg);
}

export function classifyAIError(error: unknown): AIErrorKind {
  if (isAbortOrTimeoutError(error)) return "timeout";
  if (isAIBusyError(error)) return "busy";
  return "error";
}

const CODE_BY_KIND: Record<AIErrorKind, AIErrorCode> = {
  busy: "AI_BUSY",
  timeout: "AI_TIMEOUT",
  error: "AI_ERROR",
};

const STATUS_BY_KIND: Record<AIErrorKind, number> = {
  busy: 429,
  timeout: 504,
  error: 500,
};

/**
 * Cláusula sobre el estado del crédito. Solo afirma lo confirmado:
 *  - reintegrado (true)  → "Tu consulta no se descontó.";
 *  - no confirmado (false) → sin promesas: pedir revisión por contacto.
 */
export function creditClause(lang: string | undefined, creditRefunded: boolean): string {
  const en = lang === "en";
  return creditRefunded
    ? en
      ? " Your query was not deducted."
      : " Tu consulta no se descontó."
    : en
      ? " We couldn't confirm your query's status. Write to analia@globaltariffhub.com to review it."
      : " No pudimos confirmar el estado de tu consulta. Escribinos a analia@globaltariffhub.com para revisarlo.";
}

/**
 * Mensaje para el usuario. Claro y sin alarmismo: dice qué falló y en qué
 * quedó la consulta. Describe un fallo técnico del servicio; la acción de
 * reintentar la ofrece la interfaz (botón), no este texto.
 */
export function aiErrorMessage(
  kind: AIErrorKind,
  lang: string | undefined,
  creditRefunded: boolean,
): string {
  const en = lang === "en";

  const head = en
    ? {
        busy: "The AI service is under heavy load right now.",
        timeout: "The query took longer than expected and was cancelled.",
        error: "We couldn't complete the query.",
      }[kind]
    : {
        busy: "El servicio de IA está con mucha demanda en este momento.",
        timeout: "La consulta tardó más de lo esperado y se canceló.",
        error: "No pudimos completar la consulta.",
      }[kind];

  return head + creditClause(lang, creditRefunded);
}

export interface AIErrorPayload {
  error: string;
  code: AIErrorCode;
  retryable: true;
  credit_refunded: boolean;
}

/**
 * Cuerpo de error uniforme para las rutas con IA (streaming y no streaming).
 * SIEMPRE intenta reintegrar el crédito: este helper se invoca en caminos
 * donde la ruta no llegó a entregar un resultado.
 */
export async function buildAIErrorPayload(
  error: unknown,
  opts: { lang?: string; userId?: string; fallback?: string } = {},
): Promise<AIErrorPayload> {
  const kind = classifyAIError(error);
  if (kind === "error") console.error("AI route error:", error);

  let refunded = true;
  try {
    refunded = await refundCredit(opts.userId);
  } catch (e) {
    console.error("[aiError] refundCredit lanzó una excepción:", e);
    refunded = false;
  }

  const message =
    kind === "error" && opts.fallback
      ? `${opts.fallback}${creditClause(opts.lang, refunded)}`
      : aiErrorMessage(kind, opts.lang, refunded);

  return { error: message, code: CODE_BY_KIND[kind], retryable: true, credit_refunded: refunded };
}

/**
 * Respuesta estándar para el catch de una ruta con IA no streaming.
 * Reintegra el crédito (cualquier tipo de fallo) y devuelve un cuerpo
 * uniforme con código, retryable y estado del crédito.
 */
export async function aiErrorResponse(
  error: unknown,
  opts: { lang?: string; userId?: string; fallback?: string } = {},
): Promise<NextResponse> {
  const payload = await buildAIErrorPayload(error, opts);
  const kind: AIErrorKind =
    payload.code === "AI_BUSY" ? "busy" : payload.code === "AI_TIMEOUT" ? "timeout" : "error";
  return NextResponse.json(payload, { status: STATUS_BY_KIND[kind] });
}
