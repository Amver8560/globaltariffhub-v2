"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ActualizarClavePage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [invalidReason, setInvalidReason] = useState<"expired" | "generic">("generic");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Establece la sesión de recuperación a partir del enlace del email.
  // Soporta las tres formas en que puede llegar:
  //   a) ?token_hash=…&type=recovery   → verifyOtp  (plantilla {{ .TokenHash }})
  //   b) #access_token=…&refresh_token=… → setSession (flujo implícito / plantilla por defecto)
  //   c) sesión ya activa               → getSession (enlace vía /auth/callback)
  // (a) y (b) NO dependen de cookies → funcionan al abrir el email en otro dispositivo.
  useEffect(() => {
    const supabase = createClient();

    const cleanUrl = () => {
      try {
        window.history.replaceState({}, "", "/actualizar-clave");
      } catch {}
    };

    const finish = (ok: boolean, reason: "expired" | "generic" = "generic") => {
      setInvalidReason(reason);
      setReady(ok ? "ok" : "invalid");
    };

    const run = async () => {
      const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const qp = new URLSearchParams(window.location.search);

      // Error explícito de Supabase en el fragmento (token vencido o ya usado)
      const fragErr = hp.get("error_code") || hp.get("error");
      if (fragErr) {
        cleanUrl();
        finish(false, /expired|otp/i.test(fragErr) ? "expired" : "generic");
        return;
      }

      // a) token_hash en la query
      const tokenHash = qp.get("token_hash");
      const type = qp.get("type");
      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        cleanUrl();
        finish(!error, "expired");
        return;
      }

      // b) tokens en el fragmento
      const at = hp.get("access_token");
      const rt = hp.get("refresh_token");
      if (at && rt) {
        const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
        cleanUrl();
        finish(!error, "expired");
        return;
      }

      // c) sesión ya activa
      const { data } = await supabase.auth.getSession();
      finish(!!data.session, "generic");
    };

    run();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady("ok");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      const m = error.message.toLowerCase();
      if (m.includes("different from the old")) {
        setError("La nueva contraseña tiene que ser distinta de la anterior.");
      } else if (m.includes("session") || m.includes("jwt") || m.includes("token")) {
        setError("El enlace expiró mientras completabas el formulario. Pedí uno nuevo e intentá otra vez.");
      } else {
        setError("No pudimos actualizar la contraseña. Pedí un nuevo enlace e intentá otra vez.");
      }
      return;
    }

    // Cerramos la sesión de recuperación para que el usuario entre limpio con la contraseña nueva.
    try { await supabase.auth.signOut(); } catch {}
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E",
    color: "#FFF", fontSize: 14, boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", color: "#FFF", marginBottom: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: "#0D1B3E", borderRadius: 16, padding: 36, border: "1px solid rgba(0,87,255,0.2)" }}>
        {ready === "checking" && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Verificando el enlace…</p>
        )}

        {ready === "invalid" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 14 }}>⏳</p>
            <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>
              {invalidReason === "expired" ? "Enlace vencido o ya utilizado" : "Enlace inválido"}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
              {invalidReason === "expired"
                ? "El enlace para restablecer la contraseña dura 1 hora y se usa una sola vez. Pedí uno nuevo y abrilo apenas te llegue."
                : "No pudimos validar este enlace. Pedí uno nuevo desde “Recuperar contraseña”."}
            </p>
            <Link href="/recuperar" style={{ display: "block", padding: "13px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Pedir un nuevo enlace
            </Link>
          </div>
        )}

        {ready === "ok" && !done && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Nueva contraseña</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28 }}>Elegí una contraseña nueva para tu cuenta.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Nueva contraseña <span style={{ color: "rgba(255,255,255,0.3)" }}>(mín. 8)</span></label>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoFocus style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Repetir contraseña</label>
                <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={8} style={inputStyle} />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>{error}</p>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                {loading ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          </>
        )}

        {done && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 44, marginBottom: 14 }}>✅</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Contraseña actualizada</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Iniciá sesión con tu nueva contraseña. Te llevamos al login…</p>
          </div>
        )}
      </div>
    </div>
  );
}
