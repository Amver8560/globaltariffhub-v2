"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59");
function daysLeft() {
  return Math.max(0, Math.ceil((LAUNCH_OFFER_END.getTime() - Date.now()) / 86400000));
}

const content = {
  es: {
    nav_tagline: "Inteligencia para el Comercio Global",
    nav_features: "Características",
    nav_modules: "Módulos",
    nav_sources: "Fuentes de Datos",
    nav_pricing: "Precios",
    nav_login: "Iniciar sesión",
    nav_cta: "Probar ahora",
    hero_label: "INTELIGENCIA ARANCELARIA",
    hero_title: "Para Importadores\ny Exportadores",
    hero_sub: "Decisiones más inteligentes. Comercio sin fronteras.",
    hero_photo_title: "Subí una foto de tu producto",
    hero_photo_highlight: "foto",
    hero_photo_desc: "La Inteligencia Artificial identifica automáticamente la clasificación arancelaria y los requisitos asociados.",
    hero_checks: ["HS Code Internacional", "NCM Mercosur", "TARIC Europa", "Requisitos documentales", "Impacto arancelario", "Clasificaciones similares"],
    cta_primary: "→  Comenzar análisis",
    cta_secondary: "▷  Ver cómo funciona",
    notify_label: "Anotate para acceso anticipado",
    notify_placeholder: "tu@email.com",
    notify_btn: "Avisame cuando lance",
    notify_sub: "Sin spam. Te avisamos una sola vez cuando abramos.",
    notify_thanks: "¡Gracias! Te avisamos cuando lancemos.",
    stats: [
      { n: "+10.000", label: "Empresas activas" },
      { n: "+2M", label: "Consultas realizadas" },
      { n: "160+", label: "Países cubiertos" },
      { n: "70%", label: "Ahorro de tiempo\nPromedio" },
    ],
    modules_title: "Todo lo que necesitás para tomar mejores decisiones",
    modules: [
      {
        icon: "📷",
        color: "#0057FF",
        title: "Clasificación Inteligente de Productos",
        desc: "Buscá por foto, descripción o código. La IA identifica la clasificación arancelaria y los requisitos asociados.",
      },
      {
        icon: "📄",
        color: "#C9A84C",
        title: "Impacto del Certificado de Origen",
        desc: "Analizá beneficios arancelarios y ahorro potencial según acuerdos comerciales aplicables.",
      },
      {
        icon: "🧮",
        color: "#22c55e",
        title: "Calculadora CIF",
        desc: "Calculá automáticamente el costo total de importación o exportación incluyendo flete, seguro, aranceles e impuestos.",
      },
      {
        icon: "✅",
        color: "#a855f7",
        title: "Viabilidad de Importación",
        desc: "Detectá restricciones, organismos intervinientes, requisitos especiales y riesgos regulatorios antes de operar.",
      },
    ],
    coverage_title: "Cobertura y datos integrados",
    coverage: ["HS Codes\nInternacionales", "NCM\nMercosur", "TARIC\nEuropa", "Datos\nInternacionales", "Reportes\nPDF exportables"],
    trust: [
      { icon: "🔒", label: "Información actualizada\nde fuentes oficiales" },
      { icon: "🎯", label: "Análisis preciso\ncon IA avanzada" },
      { icon: "⚡", label: "Decisiones más rápidas\ny seguras" },
      { icon: "☁️", label: "Datos seguros\ny confidenciales" },
    ],
    offer_text: "Oferta de lanzamiento",
    offer_detail: "Plan anual con 2 meses gratis",
    footer: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
    footer_legal: "Datos de referencia provenientes de fuentes oficiales. No reemplaza la consulta con un despachante de aduana habilitado.",
  },
  en: {
    nav_tagline: "Intelligence for Global Trade",
    nav_features: "Features",
    nav_modules: "Modules",
    nav_sources: "Data Sources",
    nav_pricing: "Pricing",
    nav_login: "Sign in",
    nav_cta: "Try now",
    hero_label: "TARIFF INTELLIGENCE",
    hero_title: "For Importers\nand Exporters",
    hero_sub: "Smarter decisions. Borderless trade.",
    hero_photo_title: "Upload a photo of your product",
    hero_photo_highlight: "photo",
    hero_photo_desc: "Artificial Intelligence automatically identifies the tariff classification and associated requirements.",
    hero_checks: ["International HS Code", "NCM Mercosur", "TARIC Europe", "Documentary requirements", "Tariff impact", "Similar classifications"],
    cta_primary: "→  Start analysis",
    cta_secondary: "▷  See how it works",
    notify_label: "Get early access",
    notify_placeholder: "your@email.com",
    notify_btn: "Notify me at launch",
    notify_sub: "No spam. One email when we open.",
    notify_thanks: "Thanks! We'll notify you when we launch.",
    stats: [
      { n: "+10.000", label: "Active companies" },
      { n: "+2M", label: "Queries processed" },
      { n: "160+", label: "Countries covered" },
      { n: "70%", label: "Time saved\nAverage" },
    ],
    modules_title: "Everything you need to make better decisions",
    modules: [
      {
        icon: "📷",
        color: "#0057FF",
        title: "Intelligent Product Classification",
        desc: "Search by photo, description or code. AI identifies the tariff classification and associated requirements.",
      },
      {
        icon: "📄",
        color: "#C9A84C",
        title: "Certificate of Origin Impact",
        desc: "Analyze tariff benefits and potential savings based on applicable trade agreements.",
      },
      {
        icon: "🧮",
        color: "#22c55e",
        title: "CIF Calculator",
        desc: "Automatically calculate the total import or export cost including freight, insurance, tariffs and taxes.",
      },
      {
        icon: "✅",
        color: "#a855f7",
        title: "Import Viability",
        desc: "Detect restrictions, regulatory bodies, special requirements and regulatory risks before operating.",
      },
    ],
    coverage_title: "Coverage and integrated data",
    coverage: ["International\nHS Codes", "NCM\nMercosur", "TARIC\nEurope", "International\nData", "PDF\nExportable Reports"],
    trust: [
      { icon: "🔒", label: "Updated information\nfrom official sources" },
      { icon: "🎯", label: "Precise analysis\nwith advanced AI" },
      { icon: "⚡", label: "Faster and safer\ndecisions" },
      { icon: "☁️", label: "Secure and\nconfidential data" },
    ],
    offer_text: "Launch offer",
    offer_detail: "Annual plan with 2 months free",
    footer: "© 2025 Global Tariff Hub. All rights reserved.",
    footer_legal: "Reference data from official sources. Does not replace advice from a licensed customs broker.",
  },
};

export default function HomePage({ defaultLang = "es" }: { defaultLang?: "es" | "en" }) {
  const [lang, setLang] = useState<"es" | "en">(defaultLang as "es" | "en");
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const days = daysLeft();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const t = content[lang];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
    } catch {}
    setSubmitted(true);
    setShowEmailForm(false);
  };

  return (
    <div style={{ backgroundColor: "#060B18", minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Top bar oferta */}
      {days > 0 && (
        <div style={{ background: "linear-gradient(90deg,#0D1B3E,#0A1628,#0D1B3E)", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "8px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#C9A84C", letterSpacing: 0.3 }}>
            ⚡ {t.offer_text} — {t.offer_detail} · {days} {lang === "es" ? "días restantes" : "days left"}
            <Link href="/pricing" style={{ marginLeft: 14, color: "#FFF", fontWeight: 800, textDecoration: "underline" }}>
              {lang === "es" ? "Ver oferta →" : "See offer →"}
            </Link>
          </p>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 48px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(6,11,24,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.6)", letterSpacing: 0.5 }}>GTH</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.2, color: "#FFF", lineHeight: 1.1 }}>Global Tariff Hub</p>
            <p style={{ fontSize: 10, color: "rgba(201,168,76,0.8)", fontWeight: 500, letterSpacing: 0.3 }}>{t.nav_tagline}</p>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {[
            { label: t.nav_features, href: "#modulos" },
            { label: t.nav_modules, href: "#modulos" },
            { label: t.nav_sources, href: "#cobertura" },
            { label: t.nav_pricing, href: "/pricing" },
          ].map((link) => (
            <a key={link.label} href={link.href} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["es", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "3px 11px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFF" : "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "7px 14px" }}>
            👤 {t.nav_login}
          </Link>
          <button
            onClick={() => setShowEmailForm(true)}
            style={{ fontSize: 13, fontWeight: 700, color: "#060B18", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", letterSpacing: 0.2 }}
          >
            {t.nav_cta}
          </button>
        </div>
      </nav>

      {/* Hero — dos columnas */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 48px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

        {/* Columna izquierda */}
        <div>
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#C9A84C", letterSpacing: 2, textTransform: "uppercase" }}>{t.hero_label}</span>
            <div style={{ height: 1, width: 40, background: "#C9A84C" }} />
          </div>

          {/* Título */}
          <h1 style={{ fontSize: "clamp(36px,4vw,58px)", fontWeight: 900, lineHeight: 1.08, marginBottom: 18, letterSpacing: -1.5, color: "#FFF" }}>
            {t.hero_title.split("\n").map((line, i) => <span key={i}>{line}{i < t.hero_title.split("\n").length - 1 && <br />}</span>)}
          </h1>

          {/* Subtítulo */}
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", marginBottom: 36, fontWeight: 400, lineHeight: 1.5 }}>{t.hero_sub}</p>

          {/* Tagline de marca */}
          <p style={{ fontSize: 13, color: "#C9A84C", fontWeight: 700, marginBottom: 32, letterSpacing: 0.5, fontStyle: "italic" }}>
            From Product to Trade Intelligence™
          </p>

          {/* Card foto */}
          <div style={{ background: "rgba(13,27,62,0.8)", border: "1px solid rgba(0,87,255,0.35)", borderRadius: 16, padding: "24px 28px", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(0,87,255,0.15)", border: "2px solid rgba(0,87,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📷</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#FFF", lineHeight: 1.2 }}>
                  {t.hero_photo_title.split(t.hero_photo_highlight).map((part, i, arr) =>
                    i < arr.length - 1
                      ? <span key={i}>{part}<span style={{ color: "#C9A84C" }}>{t.hero_photo_highlight}</span></span>
                      : <span key={i}>{part}</span>
                  )}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, lineHeight: 1.5 }}>{t.hero_photo_desc}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              {t.hero_checks.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(0,87,255,0.2)", border: "1px solid #0057FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: "#0057FF" }}>✓</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          {submitted ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 24px" }}>
              <span>✅</span>
              <p style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>{t.notify_thanks}</p>
            </div>
          ) : showEmailForm ? (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.notify_placeholder}
                required
                autoFocus
                style={{ padding: "13px 18px", borderRadius: 9, border: "1px solid rgba(0,87,255,0.4)", background: "rgba(13,27,62,0.9)", color: "#FFF", fontSize: 14, flex: 1, minWidth: 200, outline: "none" }}
              />
              <button type="submit" style={{ padding: "13px 22px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#060B18", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                {t.notify_btn}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowEmailForm(true)}
                style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#060B18", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: 0.2 }}
              >
                {t.cta_primary}
              </button>
              <button
                onClick={() => document.getElementById("modulos")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "14px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                {t.cta_secondary}
              </button>
            </div>
          )}
          {!submitted && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>{t.notify_sub}</p>}
        </div>

        {/* Columna derecha — Globe visual + stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>

          {/* Globe placeholder */}
          <div style={{ width: "100%", maxWidth: 420, aspectRatio: "1", borderRadius: 24, background: "radial-gradient(ellipse at 40% 35%, rgba(0,87,255,0.25) 0%, rgba(13,27,62,0.6) 50%, rgba(6,11,24,0.9) 100%)", border: "1px solid rgba(0,87,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {/* Círculos decorativos */}
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(0,87,255,0.15)" }} />
            <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(0,87,255,0.2)" }} />
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(0,87,255,0.3)" }} />
            {/* Puntos de conexión */}
            {[
              { top: "20%", left: "30%", color: "#C9A84C" },
              { top: "35%", left: "65%", color: "#0057FF" },
              { top: "60%", left: "25%", color: "#22c55e" },
              { top: "55%", left: "70%", color: "#C9A84C" },
              { top: "75%", left: "50%", color: "#0057FF" },
            ].map((dot, i) => (
              <div key={i} style={{ position: "absolute", top: dot.top, left: dot.left, width: 8, height: 8, borderRadius: "50%", background: dot.color, boxShadow: `0 0 12px ${dot.color}` }} />
            ))}
            <div style={{ textAlign: "center", zIndex: 1 }}>
              <p style={{ fontSize: 52, marginBottom: 8 }}>🌐</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>164 países · 3 sistemas arancelarios</p>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 420 }}>
            {t.stats.map((s, i) => (
              <div key={i} style={{ background: "rgba(13,27,62,0.7)", border: "1px solid rgba(0,87,255,0.15)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#0057FF" }}>
                    {i === 0 ? "🏢" : i === 1 ? "📋" : i === 2 ? "🌐" : "⏱"}
                  </span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 900, color: "#FFF", letterSpacing: -0.5, lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, lineHeight: 1.4, whiteSpace: "pre-line" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" style={{ background: "rgba(13,27,62,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "64px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, justifyContent: "center" }}>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#FFF", textAlign: "center", whiteSpace: "nowrap" }}>{t.modules_title}</h2>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {t.modules.map((m, i) => (
              <div key={i} style={{ background: "rgba(6,11,24,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${m.color}60`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${m.color}18`, border: `1px solid ${m.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#FFF", marginBottom: 10, lineHeight: 1.3 }}>{m.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{m.desc}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${m.color}20`, border: `1px solid ${m.color}50`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color, fontSize: 14, fontWeight: 700 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cobertura */}
      <section id="cobertura" style={{ padding: "0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", background: "rgba(13,27,62,0.5)", border: "1px solid rgba(0,87,255,0.15)", borderRadius: 0, padding: "24px 32px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", flexShrink: 0, minWidth: 180 }}>{t.coverage_title}</p>
          <div style={{ display: "flex", gap: 0, flex: 1, flexWrap: "wrap" }}>
            {t.coverage.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <span style={{ fontSize: 16 }}>{["📦", "🌎", "🇪🇺", "📊", "📋"][i]}</span>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4, whiteSpace: "pre-line" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ padding: "0 48px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", background: "rgba(6,11,24,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {t.trust.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, whiteSpace: "pre-line" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA central */}
      <section style={{ maxWidth: 720, margin: "0 auto 80px", padding: "0 48px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(0,87,255,0.12),rgba(13,27,62,0.9))", border: "1px solid rgba(0,87,255,0.25)", borderRadius: 20, padding: "56px 48px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>From Product to Trade Intelligence™</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>
            {lang === "es" ? "Empezá ahora — es gratis" : "Start now — it's free"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 36, maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.7 }}>
            {lang === "es"
              ? "3 consultas gratis, sin tarjeta de crédito. Cuando escales, activás tu plan."
              : "3 free consultations, no credit card. When you scale, activate your plan."}
          </p>
          {submitted ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 24px" }}>
              <span>✅</span>
              <p style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>{t.notify_thanks}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.notify_placeholder}
                required
                style={{ padding: "13px 20px", borderRadius: 9, border: "1px solid rgba(0,87,255,0.35)", background: "rgba(6,11,24,0.8)", color: "#FFF", fontSize: 14, width: 260, outline: "none" }}
              />
              <button type="submit" style={{ padding: "13px 28px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#060B18", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                {t.notify_btn}
              </button>
            </form>
          )}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>{t.notify_sub}</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }}>GTH</div>
            <div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Global Tariff Hub</p>
              <p style={{ fontSize: 10, color: "rgba(201,168,76,0.5)" }}>From Product to Trade Intelligence™</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/login", label: t.nav_login },
              { href: lang === "es" ? "/privacidad" : "/privacy", label: lang === "es" ? "Privacidad" : "Privacy" },
              { href: "/terminos", label: lang === "es" ? "Términos" : "Terms" },
              { href: "/legales", label: lang === "es" ? "Aviso Legal" : "Legal Notice" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 500 }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "20px auto 0", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>{t.footer}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", lineHeight: 1.6 }}>{t.footer_legal}</p>
        </div>
      </footer>
    </div>
  );
}
