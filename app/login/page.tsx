"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    urlError === "expired"
      ? "Ese enlace venció o ya se usó. Pedí uno nuevo desde «¿Olvidaste tu contraseña?»."
      : urlError === "auth"
      ? "No pudimos validar el enlace. Volvé a intentar o pedí uno nuevo."
      : ""
  );
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setNeedsConfirm(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else if (m.includes("email not confirmed") || m.includes("not confirmed")) {
        setError("Tu email todavía no está confirmado. Revisá tu correo (y la carpeta de spam).");
        setNeedsConfirm(true);
      } else if (m.includes("rate limit") || m.includes("too many")) {
        setError("Demasiados intentos. Esperá un minuto y probá de nuevo.");
      } else {
        setError("No pudimos iniciar sesión. Intentá de nuevo en un momento.");
      }
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  };

  const handleResend = async () => {
    setResendMsg("");
    if (!email) { setResendMsg("Ingresá tu email arriba primero."); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResendMsg(error
      ? "No se pudo reenviar ahora. Esperá unos minutos e intentá otra vez."
      : "Listo. Te reenviamos el email de confirmación.");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E",
    color: "#FFF", fontSize: 14, boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", color: "#FFF", marginBottom: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: "#0D1B3E", borderRadius: 16, padding: 36, border: "1px solid rgba(0,87,255,0.2)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Iniciar sesión</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28 }}>Accedé a tus módulos de análisis</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>{error}</p>
          )}

          {needsConfirm && (
            <button type="button" onClick={handleResend} style={{ fontSize: 12, color: "#6B9FFF", background: "none", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
              Reenviar email de confirmación
            </button>
          )}
          {resendMsg && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{resendMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/recuperar" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div style={{ marginTop: 16, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            ¿No tenés cuenta?{" "}
            <Link href="/register" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
              Registrate gratis
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}>
      <LoginInner />
    </Suspense>
  );
}
