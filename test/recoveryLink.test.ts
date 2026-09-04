import { describe, it, expect } from "vitest";
import { resolveRecoveryLink } from "@/lib/recoveryLink";

describe("resolveRecoveryLink — incidente de recuperación de contraseña (independiente de Bloque 3)", () => {
  it("a) ?token_hash=…&type=recovery → token_hash", () => {
    const action = resolveRecoveryLink("?token_hash=abc123&type=recovery", "");
    expect(action).toEqual({ kind: "token_hash", token_hash: "abc123" });
  });

  it("token_hash sin type=recovery no se toma como (a)", () => {
    const action = resolveRecoveryLink("?token_hash=abc123&type=signup", "");
    expect(action.kind).not.toBe("token_hash");
  });

  it("b) #access_token=…&refresh_token=… → tokens", () => {
    const action = resolveRecoveryLink("", "#access_token=AT&refresh_token=RT&type=recovery");
    expect(action).toEqual({ kind: "tokens", access_token: "AT", refresh_token: "RT" });
  });

  it("c) ?code=… (PKCE) → code — rama nueva de esta corrección", () => {
    const action = resolveRecoveryLink("?code=11111111-2222-3333-4444-555555555555", "");
    expect(action).toEqual({ kind: "code", code: "11111111-2222-3333-4444-555555555555" });
  });

  it("d) sin ningún parámetro → session (sesión ya activa / vía /auth/callback)", () => {
    const action = resolveRecoveryLink("", "");
    expect(action).toEqual({ kind: "session" });
  });

  it("error en el fragmento (forma histórica) → error, vencido si otp/expired", () => {
    const action = resolveRecoveryLink("", "#error=access_denied&error_code=otp_expired");
    expect(action).toEqual({ kind: "error", reason: "expired" });
  });

  it("error en la query string — rama nueva de esta corrección (antes se ignoraba)", () => {
    const action = resolveRecoveryLink("?error=access_denied&error_code=otp_expired", "");
    expect(action).toEqual({ kind: "error", reason: "expired" });
  });

  it("error genérico (sin 'expired'/'otp') → reason generic", () => {
    const action = resolveRecoveryLink("?error=access_denied&error_code=invalid_request", "");
    expect(action).toEqual({ kind: "error", reason: "generic" });
  });

  it("el error tiene prioridad sobre code/token_hash si ambos llegaran juntos", () => {
    const action = resolveRecoveryLink("?code=xyz&error_code=otp_expired", "");
    expect(action).toEqual({ kind: "error", reason: "expired" });
  });

  it("token_hash tiene prioridad sobre code si llegaran juntos", () => {
    const action = resolveRecoveryLink("?token_hash=abc&type=recovery&code=xyz", "");
    expect(action.kind).toBe("token_hash");
  });
});
