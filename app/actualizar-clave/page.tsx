"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ActualizarClavePage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Al llegar desde el enlace del email, /auth/callback ya dejó la sesión activa.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(data.session ? "ok" : "invalid");
    });
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
    setLoading(false);

    if (error) {
      setError(error.message.toLowerCase().includes("different from the old")
        ? "La nueva contraseña tiene que ser distinta de la anterior."
        : "No pudimos actualizar la contraseña. Pedí un nuevo enlace e intentá otra vez.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1800);
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
            <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>Enlace inválido o vencido</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
              El enlace para restablecer la contraseña dura 1 hora y se usa una sola vez. Pedí uno nuevo.
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoFocus style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Repetir contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={8} style={inputStyle} />
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
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Te llevamos a tu panel…</p>
          </div>
        )}
      </div>
    </div>
  );
}
