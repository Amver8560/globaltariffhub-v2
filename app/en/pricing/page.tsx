"use client";

import Link from "next/link";

export default function PricingPageEN() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#FFF", fontFamily: "Arial, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/en" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/pricing" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Ver en español</Link>
          <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 24 }}>🔒</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Plans & Pricing</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 40 }}>
          Subscription plans will be available soon.<br />
          We are finishing the setup of our payment platform.
        </p>
        <Link
          href="/en"
          style={{ display: "inline-block", padding: "13px 32px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
