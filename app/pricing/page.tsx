"use client";

import Link from "next/link";

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0B1B33", color: "#FFF", fontFamily: "Arial, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#3B7BF6,#13294B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#E3B341", border: "1px solid #E3B341" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Dashboard</Link>
      </nav>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 24 }}>🔒</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Planes y precios</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 40 }}>
          Los planes de contratación estarán disponibles próximamente.<br />
          Estamos terminando de configurar la plataforma de pagos.
        </p>
        <Link
          href="/"
          style={{ display: "inline-block", padding: "13px 32px", borderRadius: 10, background: "linear-gradient(135deg,#3B7BF6,#2557C7)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
        >
          ← Volver al inicio
        </Link>
      </main>
    </div>
  );
}
