"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59");

function daysLeft() {
  const diff = LAUNCH_OFFER_END.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function PricingInner() {
  const searchParams = useSearchParams();
  const highlightAnnual = searchParams.get("plan") === "annual";
  const days = daysLeft();

  const cardStyle = (highlight: boolean): React.CSSProperties => ({
    background: highlight ? "linear-gradient(135deg, #0D2A6E, #0D1B3E)" : "#0D1B3E",
    borderRadius: 20,
    padding: 36,
    border: highlight ? "2px solid #C9A84C" : "1px solid rgba(0,87,255,0.2)",
    position: "relative",
    flex: 1,
    minWidth: 260,
    maxWidth: 340,
  });

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

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Plans & Pricing</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>
            Start free. Scale when you&apos;re ready.
          </p>

          {/* Launch offer banner */}
          {days > 0 && (
            <div style={{ display: "inline-block", marginTop: 20, background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))", border: "1px solid #C9A84C", borderRadius: 30, padding: "8px 24px" }}>
              <p style={{ fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>⚡ Launch offer — {days} days left · Annual plan with 2 months free</p>
            </div>
          )}
        </div>

        {/* Plans */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>

          {/* Free plan */}
          <div style={cardStyle(false)}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Free</p>
            <p style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>USD 0</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>To explore the platform</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "3 free consultations",
                "All modules",
                "Export PDF",
                "Bilingual ES / EN",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{ display: "block", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              Start for free
            </Link>
          </div>

          {/* Monthly plan */}
          <div style={cardStyle(false)}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0057FF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Monthly</p>
            <p style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>USD 39<span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>/mo</span></p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Billed monthly</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Unlimited consultations",
                "All modules",
                "Export PDF with GTH branding",
                "Bilingual ES / EN",
                "Rate updates",
                "Email support",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>
            <a
              href="mailto:analia@globaltariffhub.com?subject=Monthly%20plan%20GTH%20%E2%80%94%20USD%2039%2Fmo&body=Hi%2C%20I%20want%20to%20activate%20the%20monthly%20plan%20for%20Global%20Tariff%20Hub%20(USD%2039%2Fmo).%0A%0AName%3A%20%0AAccount%20email%3A%20%0A%0AI%20will%20wait%20for%20payment%20instructions.%20Thank%20you."
              style={{ display: "block", width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              Choose monthly →
            </a>
          </div>

          {/* Annual plan — highlighted */}
          <div style={cardStyle(true)}>
            {/* Badge */}
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", borderRadius: 20, padding: "4px 18px", fontSize: 11, fontWeight: 800, color: "#000", whiteSpace: "nowrap" }}>
              {days > 0 ? `⚡ OFFER — ${days} days` : "MOST POPULAR"}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Annual</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 40, fontWeight: 900 }}>USD {days > 0 ? "238" : "290"}</p>
              {days > 0 && <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>290</p>}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: days > 0 ? 4 : 28 }}>Billed annually</p>
            {days > 0 && <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginBottom: 24 }}>2 months free included ↑</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Unlimited consultations",
                "All modules",
                "Export PDF with GTH branding",
                "Bilingual ES / EN",
                "Rate updates",
                "Priority support",
                "Access to new modules",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#C9A84C", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{f}</span>
                </div>
              ))}
            </div>
            <a
              href={`mailto:analia@globaltariffhub.com?subject=Annual%20plan%20GTH%20%E2%80%94%20USD%20${days > 0 ? "238" : "290"}%2Fyr&body=Hi%2C%20I%20want%20to%20activate%20the%20annual%20plan%20for%20Global%20Tariff%20Hub%20(USD%20${days > 0 ? "238" : "290"}%2Fyr${days > 0 ? "%20%E2%80%94%20launch%20offer" : ""}).%0A%0AName%3A%20%0AAccount%20email%3A%20%0A%0AI%20will%20wait%20for%20payment%20instructions.%20Thank%20you.`}
              style={{ display: "block", width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C9A84C,#A07830)", color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              Choose annual →
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 32, border: "1px solid rgba(0,87,255,0.15)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Frequently asked questions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { q: "What do the 3 free consultations include?", a: "Full access to all modules — search, certificate of origin, CIF calculator, and import viability. No credit card required." },
              { q: "Can I cancel at any time?", a: "Yes. The monthly plan can be cancelled before the next billing cycle. The annual plan has no partial refunds." },
              { q: "Is the data from official sources?", a: "Base tariff rates come from official sources including WTO, Brazil's Receita Federal, and the EU TARIC database. Updated monthly." },
              { q: "Does it replace a customs broker?", a: "No. GTH is a preliminary analysis tool. Formal customs clearance requires a licensed professional." },
            ].map((item) => (
              <div key={item.q}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#FFF" }}>{item.q}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPageEN() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}>
      <PricingInner />
    </Suspense>
  );
}
