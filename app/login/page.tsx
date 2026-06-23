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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos."
        : error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
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

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            ¿No tenés cuenta?{" "}
            <Link href="/register" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
              Registrate gratis
            </Link>
          </p>
        </div>

        {/* Oferta de lanzamiento */}
        <div style={{ marginTop: 24, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>⚡ OFERTA DE LANZAMIENTO</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Plan anual con 2 meses gratis — tiempo limitado</p>
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
