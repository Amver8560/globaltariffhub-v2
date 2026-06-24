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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Dashboard</Link>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Planes y precios</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>
            Empezá gratis. Escalá cuando estés listo.
          </p>

          {/* Banner oferta */}
          {days > 0 && (
            <div style={{ display: "inline-block", marginTop: 20, background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))", border: "1px solid #C9A84C", borderRadius: 30, padding: "8px 24px" }}>
              <p style={{ fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>⚡ Oferta de lanzamiento — quedan {days} días · Plan anual con 2 meses gratis</p>
            </div>
          )}
        </div>

        {/* Planes */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>

          {/* Plan Gratis */}
          <div style={cardStyle(false)}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Gratis</p>
            <p style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>USD 0</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Para explorar la plataforma</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "3 consultas gratuitas",
                "Todos los módulos",
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
              Empezar gratis
            </Link>
          </div>

          {/* Plan Mensual */}
          <div style={cardStyle(false)}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0057FF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Mensual</p>
            <p style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>USD 39<span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>/mes</span></p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Facturado mensualmente</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Consultas ilimitadas",
                "Todos los módulos",
                "Export PDF con marca GTH",
                "Bilingual ES / EN",
                "Actualizaciones de tasas",
                "Soporte por email",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>
            <a
              href="mailto:analia@globaltariffhub.com?subject=Quiero%20el%20plan%20mensual%20GTH%20%E2%80%94%20USD%2039%2Fmes&body=Hola%2C%20quiero%20activar%20el%20plan%20mensual%20de%20Global%20Tariff%20Hub%20(USD%2039%2Fmes).%0A%0ANombre%3A%20%0AEmail%20de%20mi%20cuenta%3A%20%0A%0AQuedar%C3%A9%20en%20espera%20de%20instrucciones%20de%20pago.%20Gracias."
              style={{ display: "block", width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              Elegir mensual →
            </a>
          </div>

          {/* Plan Anual — destacado */}
          <div style={cardStyle(true)}>
            {/* Badge */}
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", borderRadius: 20, padding: "4px 18px", fontSize: 11, fontWeight: 800, color: "#000", whiteSpace: "nowrap" }}>
              {days > 0 ? `⚡ OFERTA — ${days} días` : "MÁS POPULAR"}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Anual</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 40, fontWeight: 900 }}>USD {days > 0 ? "238" : "290"}</p>
              {days > 0 && <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>290</p>}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: days > 0 ? 4 : 28 }}>Facturado anualmente</p>
            {days > 0 && <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginBottom: 24 }}>2 meses gratis incluidos ↑</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Consultas ilimitadas",
                "Todos los módulos",
                "Export PDF con marca GTH",
                "Bilingual ES / EN",
                "Actualizaciones de tasas",
                "Soporte prioritario",
                "Acceso a nuevos módulos",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#C9A84C", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{f}</span>
                </div>
              ))}
            </div>
            <a
              href={`mailto:analia@globaltariffhub.com?subject=Quiero%20el%20plan%20anual%20GTH%20%E2%80%94%20USD%20${days > 0 ? "238" : "290"}%2Fa%C3%B1o&body=Hola%2C%20quiero%20activar%20el%20plan%20anual%20de%20Global%20Tariff%20Hub%20(USD%20${days > 0 ? "238" : "290"}%2Fa%C3%B1o${days > 0 ? "%20%E2%80%94%20oferta%20de%20lanzamiento" : ""}).%0A%0ANombre%3A%20%0AEmail%20de%20mi%20cuenta%3A%20%0A%0AQuedar%C3%A9%20en%20espera%20de%20instrucciones%20de%20pago.%20Gracias.`}
              style={{ display: "block", width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C9A84C,#A07830)", color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              Elegir anual →
            </a>
          </div>
        </div>

        {/* FAQ rápido */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 32, border: "1px solid rgba(0,87,255,0.15)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Preguntas frecuentes</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { q: "¿Qué incluyen las 3 consultas gratis?", a: "Acceso completo a todos los módulos — búsqueda, certificado, CIF y viabilidad. Sin tarjeta de crédito." },
              { q: "¿Puedo cancelar en cualquier momento?", a: "Sí. El plan mensual se puede cancelar antes del próximo ciclo. El anual no tiene reembolso parcial." },
              { q: "¿Los datos son de fuentes oficiales?", a: "Las tasas base provienen de ARCA (ex AFIP), Receita Federal, WTO y fuentes oficiales. Se actualizan periódicamente." },
              { q: "¿Reemplaza a un despachante de aduana?", a: "No. GTH es una herramienta de análisis previo. El despacho formal requiere un profesional habilitado." },
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

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}>
      <PricingInner />
    </Suspense>
  );
}
