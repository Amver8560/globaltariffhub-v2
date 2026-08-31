"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);

  const allAccepted = acceptTerms && acceptPrivacy && acceptLegal;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Atribución de campaña (LinkedIn, etc.) — desde los UTM de la URL
    const sp = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: sp.get("utm_source") || "",
      utm_medium: sp.get("utm_medium") || "",
      utm_campaign: sp.get("utm_campaign") || "",
    };
    const signup_source =
      utm.utm_source ||
      (document.referrer && !document.referrer.includes(window.location.host)
        ? new URL(document.referrer).hostname
        : "direct");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, signup_source, ...utm },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("already registered") || m.includes("already exists") || error.status === 422) {
        setError("Ya existe una cuenta con ese email. Probá iniciar sesión o recuperar tu contraseña.");
      } else if (m.includes("rate limit") || m.includes("too many") || m.includes("email send")) {
        setError("Estamos recibiendo muchos registros en este momento. Esperá unos minutos y volvé a intentar.");
      } else if (m.includes("signups not allowed") || m.includes("disabled")) {
        setError("El registro está temporalmente deshabilitado. Escribinos a analia@globaltariffhub.com.");
      } else if (m.includes("database error")) {
        setError("Hubo un problema al crear tu cuenta. Escribinos a analia@globaltariffhub.com y lo resolvemos.");
      } else if (m.includes("invalid") && m.includes("email")) {
        setError("El email no parece válido. Revisalo e intentá de nuevo.");
      } else {
        setError("No pudimos crear la cuenta. Intentá de nuevo en un momento.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleResend = async () => {
    setResendMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResendMsg(error
      ? "No se pudo reenviar ahora. Esperá unos minutos e intentá otra vez."
      : "Te reenviamos el email de confirmación.");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E",
    color: "#FFF", fontSize: 14, boxSizing: "border-box",
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#0D1B3E", borderRadius: 16, padding: 40, border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>✅</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>¡Cuenta creada!</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 20 }}>
            Te enviamos un email de confirmación a <strong style={{ color: "#C9A84C" }}>{email}</strong>.<br />
            Confirmá tu cuenta para acceder a tus 3 consultas gratis.
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
            Si no llega en unos minutos, revisá la carpeta de spam.
          </p>
          <button type="button" onClick={handleResend} style={{ fontSize: 12, color: "#6B9FFF", background: "none", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", marginBottom: 8 }}>
            Reenviar email de confirmación
          </button>
          {resendMsg && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>{resendMsg}</p>}
          <Link href="/login" style={{ display: "block", padding: "14px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, textDecoration: "none", marginTop: 12 }}>
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", color: "#FFF", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: "#0D1B3E", borderRadius: 16, padding: 36, border: "1px solid rgba(0,87,255,0.2)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Crear cuenta gratis</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 8 }}>3 consultas gratis · Sin tarjeta de crédito</p>

        {/* Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {["📦 Módulo Viabilidad", "🌐 Bilingual ES/EN", "📄 Export PDF"].map((b) => (
            <span key={b} style={{ fontSize: 10, background: "rgba(0,87,255,0.12)", border: "1px solid rgba(0,87,255,0.25)", borderRadius: 20, padding: "3px 10px", color: "rgba(255,255,255,0.6)" }}>{b}</span>
          ))}
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ana García"
              required
              style={inputStyle}
            />
          </div>

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
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Contraseña <span style={{ color: "rgba(255,255,255,0.3)" }}>(mín. 8 caracteres)</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ margin: 0 }}>{error}</p>
              {error.includes("Ya existe") && (
                <p style={{ margin: "8px 0 0", display: "flex", gap: 14 }}>
                  <Link href="/login" style={{ color: "#6B9FFF", fontWeight: 700 }}>Iniciar sesión</Link>
                  <Link href="/recuperar" style={{ color: "#6B9FFF", fontWeight: 700 }}>Recuperar contraseña</Link>
                </p>
              )}
            </div>
          )}

          {/* Checkboxes legales obligatorios */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px", background: "rgba(0,87,255,0.06)", border: "1px solid rgba(0,87,255,0.2)", borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Aceptación obligatoria</p>

            {[
              {
                checked: acceptTerms,
                setter: setAcceptTerms,
                label: <>Leí y acepto los <Link href="/terminos" target="_blank" style={{ color: "#C9A84C", fontWeight: 600 }}>Términos de Uso</Link></>
              },
              {
                checked: acceptPrivacy,
                setter: setAcceptPrivacy,
                label: <>Leí y acepto la <Link href="/privacidad" target="_blank" style={{ color: "#C9A84C", fontWeight: 600 }}>Política de Privacidad</Link></>
              },
              {
                checked: acceptLegal,
                setter: setAcceptLegal,
                label: <>Leí y acepto el <Link href="/legales" target="_blank" style={{ color: "#C9A84C", fontWeight: 600 }}>Aviso Legal</Link> — entiendo que GTH no reemplaza la consulta con un despachante de aduana habilitado</>
              },
            ].map(({ checked, setter, label }, i) => (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setter(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#0057FF", flexShrink: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !allAccepted}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: (loading || !allAccepted) ? "rgba(0,87,255,0.25)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: (loading || !allAccepted) ? "rgba(255,255,255,0.4)" : "#FFF", fontSize: 15, fontWeight: 700, cursor: (loading || !allAccepted) ? "not-allowed" : "pointer", marginTop: 4, transition: "all 0.2s" }}
          >
            {loading ? "Creando cuenta..." : !allAccepted ? "Aceptá los términos para continuar" : "Crear cuenta gratis →"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
