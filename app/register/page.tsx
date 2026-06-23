"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59"); // 30 días desde lanzamiento

function daysLeft() {
  const diff = LAUNCH_OFFER_END.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Ya existe una cuenta con ese email. ¿Querés iniciar sesión?"
        : error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E",
    color: "#FFF", fontSize: 14, boxSizing: "border-box",
  };

  const days = daysLeft();

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#0D1B3E", borderRadius: 16, padding: 40, border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>✅</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>¡Cuenta creada!</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
            Te enviamos un email de confirmación a <strong style={{ color: "#C9A84C" }}>{email}</strong>.<br />
            Confirmá tu cuenta para acceder a tus 3 consultas gratis.
          </p>
          <Link href="/login" style={{ display: "block", padding: "14px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
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

      {/* Banner oferta */}
      {days > 0 && (
        <div style={{ width: "100%", maxWidth: 400, background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid #C9A84C", borderRadius: 12, padding: "12px 20px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#C9A84C", marginBottom: 2 }}>⚡ OFERTA DE LANZAMIENTO — {days} días restantes</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Plan anual <s style={{ color: "rgba(255,255,255,0.35)" }}>USD 290</s> → <strong style={{ color: "#FFF" }}>USD 238</strong> · 2 meses gratis</p>
        </div>
      )}

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
            <p style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta gratis →"}
          </button>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.5 }}>
            Al registrarte aceptás los{" "}
            <Link href="/terminos" style={{ color: "rgba(255,255,255,0.4)" }}>Términos de servicio</Link>
            {" "}y la{" "}
            <Link href="/privacidad" style={{ color: "rgba(255,255,255,0.4)" }}>Política de privacidad</Link>
          </p>
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
