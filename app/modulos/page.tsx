"use client";

import { useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";

const t = {
  es: {
    kicker: "Elegí por dónde empezar",
    title: "Cuatro módulos. Uno solo o todos.",
    sub: "Cada módulo funciona de forma independiente. No necesitás pasar por el Módulo 01 para llegar al resto — entrá directo al que necesités.",
    open: "Abrir módulo",
    independent: "Se puede usar solo",
    back_home: "← Volver al inicio",
    flow_hint: "¿No sabés por dónde empezar? El orden sugerido es 01 → 02 → 03 → 04, pero podés saltar libremente.",
  },
  en: {
    kicker: "Choose where to start",
    title: "Four modules. One or all of them.",
    sub: "Each module works independently. You don't need to go through Module 01 to reach the rest — jump straight to the one you need.",
    open: "Open module",
    independent: "Can be used on its own",
    back_home: "← Back to home",
    flow_hint: "Not sure where to start? The suggested order is 01 → 02 → 03 → 04, but you can skip around freely.",
  },
};

const MODULES = {
  es: [
    {
      href: "/modulo01", badge: "Módulo 01", icon: "🔍",
      question: "¿Qué impuestos paga este producto?",
      title: "Clasificación Arancelaria con IA",
      desc: "Encontrá el código HS / NCM / TARIC de tu producto y su arancel de referencia por país, con los acuerdos comerciales aplicables.",
      color: "#0057FF", bg: "rgba(0,87,255,0.12)", border: "rgba(0,87,255,0.4)",
    },
    {
      href: "/modulo02", badge: "Módulo 02", icon: "📄",
      question: "¿Podés pagar menos impuestos?",
      title: "Simulador con Certificado de Origen",
      desc: "Simulá tu ahorro arancelario con y sin certificado de origen, verificá si hay acuerdo comercial vigente y qué documentación necesitás.",
      color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)",
    },
    {
      href: "/modulo03", badge: "Módulo 03", icon: "📦",
      question: "¿Cuánto cuesta realmente traerlo?",
      title: "Calculadora CIF",
      desc: "Calculá el costo CIF con flete, seguro y todos los tributos de importación desglosados por país de destino.",
      color: "#C9A84C", bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.4)",
    },
    {
      href: "/modulo04", badge: "Módulo 04", icon: "💡",
      question: "¿Conviene el negocio?",
      title: "Viabilidad de Importación",
      desc: "Subí una foto o descripción y obtené costo nacionalizado, margen estimado y precio de venta sugerido para decidir si el negocio cierra.",
      color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)",
    },
  ],
  en: [
    {
      href: "/modulo01", badge: "Module 01", icon: "🔍",
      question: "What taxes does this product pay?",
      title: "AI Tariff Classification",
      desc: "Find your product's HS / NCM / TARIC code and its reference tariff by country, with the applicable trade agreements.",
      color: "#0057FF", bg: "rgba(0,87,255,0.12)", border: "rgba(0,87,255,0.4)",
    },
    {
      href: "/modulo02", badge: "Module 02", icon: "📄",
      question: "Can you pay less in taxes?",
      title: "Certificate of Origin Simulator",
      desc: "Simulate your tariff savings with and without a certificate of origin, check whether a trade agreement is in force and what documents you need.",
      color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)",
    },
    {
      href: "/modulo03", badge: "Module 03", icon: "📦",
      question: "What does it really cost to bring it in?",
      title: "CIF Calculator",
      desc: "Calculate CIF cost with freight, insurance and every import tax broken down by destination country.",
      color: "#C9A84C", bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.4)",
    },
    {
      href: "/modulo04", badge: "Module 04", icon: "💡",
      question: "Is the business worth it?",
      title: "Import Viability",
      desc: "Upload a photo or description and get landed cost, estimated margin and suggested sale price to decide if the deal makes sense.",
      color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)",
    },
  ],
};

export default function ModulosPage() {
  const [lang, setLang] = useState<Lang>("es");
  const c = t[lang];
  const mods = MODULES[lang];

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{c.back_home}</Link>
          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "56px 24px 96px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#C9A84C", letterSpacing: 2.5, textTransform: "uppercase" }}>{c.kicker}</span>
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, marginTop: 14, marginBottom: 14, letterSpacing: -0.5 }}>{c.title}</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{c.sub}</p>
        </div>

        {/* Grid de módulos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {mods.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              style={{
                textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 14,
                background: "#0D1B3E", border: `1px solid ${m.border}`, borderRadius: 18, padding: "28px 26px",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 34px ${m.color}22`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: m.bg, border: `1.5px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{m.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "4px 12px" }}>{m.badge}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 6, lineHeight: 1.4 }}>{m.question}</p>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{m.title}</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{m.desc}</p>
              </div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>✓ {c.independent}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{c.open} →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Hint de flujo */}
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 36, lineHeight: 1.7 }}>{c.flow_hint}</p>
      </main>
    </div>
  );
}
