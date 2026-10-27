"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AccessForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/site-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError("Contraseña incorrecta.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1B33",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: "#0B1B33",
        border: "1px solid rgba(59,123,246,0.25)",
        borderRadius: 20,
        padding: "48px 40px",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: "linear-gradient(135deg, #3B7BF6, #0B1B33)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 14, color: "#E3B341",
          border: "1.5px solid #E3B341",
          margin: "0 auto 24px",
        }}>GTH</div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>
          Global Tariff Hub
        </h1>
        <p style={{ fontSize: 13, color: "rgba(163,178,204,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
          Sitio en acceso privado.<br />Ingresá la contraseña para continuar.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            autoFocus
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              border: `1.5px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(59,123,246,0.25)"}`,
              background: "#0B1B33",
              color: "#FFFFFF",
              fontSize: 15,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: loading
                ? "rgba(59,123,246,0.4)"
                : "linear-gradient(135deg, #3B7BF6, #2557C7)",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verificando..." : "Ingresar →"}
          </button>
        </form>

        <p style={{ fontSize: 11, color: "rgba(163,178,204,0.3)", marginTop: 28 }}>
          From Product to Trade Intelligence™
        </p>
      </div>
    </div>
  );
}

export default function AccesoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0B1B33" }} />}>
      <AccessForm />
    </Suspense>
  );
}
