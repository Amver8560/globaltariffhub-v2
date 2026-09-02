"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Cliente de flujo IMPLÍCITO sólo para este pedido: el enlace del email
    // vuelve con la sesión en el fragmento (#access_token…) o con
    // ?token_hash=… — ambos funcionan al abrirlos en otro navegador/dispositivo
    // (no dependen de la cookie code-verifier de PKCE).
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: "implicit" } }
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-clave`,
    });

    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many")) {
        setError("Enviamos demasiados correos en poco tiempo. Esperá unos minutos y volvé a intentar.");
      } else {
        setError("No pudimos procesar el pedido. Intentá de nuevo en un momento.");
      }
      return;
    }
    setSent(true);
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
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 44, marginBottom: 14 }}>📩</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Revisá tu correo</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
              Si existe una cuenta con <strong style={{ color: "#C9A84C" }}>{email}</strong>, te enviamos un enlace para crear una nueva contraseña. El enlace vence en 1 hora y se usa una sola vez.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
              Abrilo apenas te llegue. ¿No aparece? Revisá spam o esperá unos minutos antes de pedir otro.
            </p>
            <Link href="/login" style={{ display: "block", padding: "13px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Recuperar contraseña</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28 }}>
              Ingresá tu email y te mandamos un enlace para crear una nueva.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required autoFocus style={inputStyle} />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>{error}</p>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>

            <div style={{ marginTop: 22, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                <Link href="/login" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>← Volver al login</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
