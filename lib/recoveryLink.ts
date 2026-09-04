// Incidente separado — recuperación de contraseña (independiente de Bloque 3).
// Decide, a partir de la URL del enlace recibido por email, qué mecanismo de
// Supabase corresponde para establecer la sesión de recuperación. Función
// pura: no toca red ni DOM, sólo interpreta query string y fragmento. Se usa
// desde app/actualizar-clave/page.tsx.
//
// Formas soportadas:
//   a) ?token_hash=…&type=recovery      → verifyOtp        (plantilla {{ .TokenHash }})
//   b) #access_token=…&refresh_token=…  → setSession        (flujo implícito / plantilla por defecto)
//   c) ?code=…                          → exchangeCodeForSession (flujo PKCE)
//   d) sin ninguno de los anteriores    → getSession        (sesión ya activa, p.ej. vía /auth/callback)
// Un error explícito de Supabase (token vencido o ya usado) puede llegar
// tanto en el fragmento como en la query string, según el punto de falla.
export type RecoveryAction =
  | { kind: "error"; reason: "expired" | "generic" }
  | { kind: "token_hash"; token_hash: string }
  | { kind: "tokens"; access_token: string; refresh_token: string }
  | { kind: "code"; code: string }
  | { kind: "session" };

export function resolveRecoveryLink(search: string, hash: string): RecoveryAction {
  const qp = new URLSearchParams(search);
  const hp = new URLSearchParams(hash.replace(/^#/, ""));

  const err = hp.get("error_code") || hp.get("error") || qp.get("error_code") || qp.get("error");
  if (err) {
    return { kind: "error", reason: /expired|otp/i.test(err) ? "expired" : "generic" };
  }

  const tokenHash = qp.get("token_hash");
  const type = qp.get("type");
  if (tokenHash && type === "recovery") {
    return { kind: "token_hash", token_hash: tokenHash };
  }

  const at = hp.get("access_token");
  const rt = hp.get("refresh_token");
  if (at && rt) {
    return { kind: "tokens", access_token: at, refresh_token: rt };
  }

  const code = qp.get("code");
  if (code) {
    return { kind: "code", code };
  }

  return { kind: "session" };
}
