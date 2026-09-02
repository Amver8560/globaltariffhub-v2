// ─────────────────────────────────────────────────────────────
// GTH — Utilidades de cliente para llamar a las rutas con IA
//
// - fetchWithDeadline: aborta la request si el servidor no responde a
//   tiempo. Es un backstop: el servidor tiene su propio deadline (más
//   corto) y responde con un cuerpo de error uniforme antes de este.
// - describeAIError: traduce una respuesta fallida (o un abort) en un
//   mensaje claro + si conviene ofrecer "Reintentar" + en qué quedó el
//   crédito. Un timeout / error técnico es un fallo del servicio; el
//   mensaje lo dice sin alarmismo. (Distinto de "validar en fuente
//   oficial", que no es un fallo y no se maneja acá.)
// ─────────────────────────────────────────────────────────────

/** Backstop del cliente. Debe ser mayor que el deadline del servidor. */
export const CLIENT_DEADLINE_MS = 45_000;

export interface AIErrorView {
  /** Mensaje listo para mostrar al usuario. */
  message: string;
  /** true si tiene sentido ofrecer "Reintentar". */
  retryable: boolean;
  /**
   * Estado del crédito:
   *  - "kept"    → la consulta NO se descontó (o se reintegró).
   *  - "review"  → puede haberse descontado; hay que revisarlo / escribir.
   *  - "spent"   → se consumió correctamente (p. ej. sin créditos disponibles).
   *  - "none"    → no aplica (error de validación del formulario, etc.).
   */
  credit: "kept" | "review" | "spent" | "none";
  /** Código del backend si vino (AI_BUSY | AI_TIMEOUT | AI_ERROR | NO_CREDITS | …). */
  code?: string;
  /** true si el llamador debe redirigir a /login. */
  needsLogin?: boolean;
}

/** fetch con AbortController + timeout. Lanza AbortError si vence el plazo. */
export async function fetchWithDeadline(
  input: RequestInfo | URL,
  init: RequestInit = {},
  ms: number = CLIENT_DEADLINE_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function isAbortError(err: unknown): boolean {
  const e = err as { name?: string } | null;
  return e?.name === "AbortError" || e?.name === "TimeoutError";
}

interface DescribeInput {
  lang: string;
  /** El error capturado en el catch (si lo hubo). */
  thrown?: unknown;
  /** Status HTTP de la respuesta (si llegó). */
  status?: number;
  /** Cuerpo JSON de la respuesta, si se pudo parsear. */
  payload?: {
    error?: string;
    code?: string;
    retryable?: boolean;
    credit_refunded?: boolean;
  } | null;
}

export function describeAIError({ lang, thrown, status, payload }: DescribeInput): AIErrorView {
  const en = lang === "en";
  const code = payload?.code;

  // Sesión vencida → el llamador redirige.
  if (code === "UNAUTHENTICATED" || status === 401) {
    return {
      message: en ? "Please sign in to continue." : "Iniciá sesión para continuar.",
      retryable: false,
      credit: "none",
      code,
      needsLogin: true,
    };
  }

  // Sin créditos disponibles — no es un fallo técnico.
  if (code === "NO_CREDITS" || status === 402) {
    return {
      message:
        payload?.error ||
        (en
          ? "You've used your free early-access queries."
          : "Usaste tus consultas gratuitas de la apertura anticipada."),
      retryable: false,
      credit: "spent",
      code,
    };
  }

  // Verificación de créditos caída (no se llegó a consumir nada).
  if (code === "CREDIT_CHECK_FAILED" || status === 503) {
    return {
      message:
        payload?.error ||
        (en
          ? "We couldn't verify your credits right now. Try again in a moment."
          : "No pudimos verificar tus créditos ahora. Probá de nuevo en un momento."),
      retryable: true,
      credit: "kept",
      code,
    };
  }

  // Abort del cliente (venció el backstop): el servidor debería haber respondido
  // antes; si llegamos acá la conexión quedó colgada. No podemos confirmar el crédito.
  if (isAbortError(thrown)) {
    return {
      message: en
        ? "The query didn't respond in time."
        : "La consulta no respondió a tiempo.",
      retryable: true,
      credit: "review",
      code: "CLIENT_TIMEOUT",
    };
  }

  // Error de red antes de tener respuesta: no sabemos si el servidor llegó a procesar.
  if (thrown && status === undefined) {
    return {
      message: en
        ? "Connection problem. Check your internet and try again."
        : "Problema de conexión. Revisá tu internet y volvé a intentar.",
      retryable: true,
      credit: "review",
      code: "NETWORK",
    };
  }

  // Errores con cuerpo uniforme del backend (AI_BUSY | AI_TIMEOUT | AI_ERROR).
  if (payload?.error) {
    const refunded = payload.credit_refunded;
    return {
      message: payload.error,
      retryable: payload.retryable ?? true,
      credit: refunded === true ? "kept" : refunded === false ? "review" : "kept",
      code,
    };
  }

  // Fallback genérico.
  return {
    message: en
      ? "Something went wrong. Try again in a moment."
      : "Algo salió mal. Volvé a intentar en un momento.",
    retryable: true,
    credit: "review",
    code: "UNKNOWN",
  };
}

/** Línea corta sobre el estado del crédito, para mostrar bajo el mensaje de error. */
export function creditNote(view: AIErrorView, lang: string): string | null {
  const en = lang === "en";
  switch (view.credit) {
    case "kept":
      return en ? "Your query was not deducted." : "Tu consulta no se descontó.";
    case "review":
      return en
        ? "We couldn't confirm your query's status. Write to analia@globaltariffhub.com to review it."
        : "No pudimos confirmar el estado de tu consulta. Escribinos a analia@globaltariffhub.com para revisarlo.";
    case "spent":
    case "none":
    default:
      return null;
  }
}
