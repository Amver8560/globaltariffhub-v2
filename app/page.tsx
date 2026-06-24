"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59");
function daysLeft() {
  return Math.max(0, Math.ceil((LAUNCH_OFFER_END.getTime() - Date.now()) / 86400000));
}

const content = {
  es: {
    nav_login: "Iniciar sesión",
    nav_register: "Empezar gratis",
    badge: "Próximamente",
    headline: "Inteligencia arancelaria para quienes importan y exportan",
    tagline: "Aranceles reales, costos exactos y simulaciones de ahorro — en segundos.",
    sub: "Pensado para emprendedores y pymes que necesitan tomar decisiones con información real, sin depender de un consultor externo.",
    cta_primary: "Empezar gratis →",
    cta_secondary: "Ver planes",
    cta_sub: "3 consultas gratis · Sin tarjeta de crédito",
    notify_label: "Anotate para acceso anticipado",
    notify_placeholder: "tu@email.com",
    notify_btn: "Avisame cuando lance",
    notify_sub: "Sin spam. Te avisamos una sola vez cuando abramos.",
    notify_thanks: "¡Gracias! Te avisamos cuando lancemos.",
    offer_text: "Oferta de lanzamiento",
    offer_detail: "Plan anual con 2 meses gratis",
    sources_title: "Datos oficiales, no estimaciones",
    sources: [
      { icon: "🌐", name: "WTO API", desc: "Tasas MFN aplicadas por código HS para 164 países miembro" },
      { icon: "🇧🇷", name: "Siscomex / BrasilAPI", desc: "Nomenclatura NCM oficial del MERCOSUR" },
      { icon: "🇪🇺", name: "TARIC EU", desc: "Base arancelaria de la Unión Europea" },
      { icon: "🤖", name: "IA + fuentes oficiales", desc: "Clasificación por imagen, texto o código con verificación real" },
    ],
    features_title: "Cuatro módulos. Una sola plataforma.",
    features: [
      {
        icon: "🔍",
        badge: "M01",
        title: "Buscador HS / NCM / TARIC",
        desc: "Búsqueda · Acuerdos Comerciales · Documentación",
        detail: "Buscá por imagen, descripción o código. Obtené la posición arancelaria, la tasa real, los acuerdos comerciales vigentes entre países y los documentos requeridos en origen y destino.",
        color: "#0057FF",
      },
      {
        icon: "📄",
        badge: "M02",
        title: "Simulador de Operaciones con Certificado de Origen",
        desc: "MERCOSUR · TLC · SGP",
        detail: "Simulá si tu operación califica para tasa preferencial, cuánto ahorrás y qué documentos necesitás.",
        color: "#22c55e",
      },
      {
        icon: "📦",
        badge: "M03",
        title: "Calculadora CIF",
        desc: "Incoterms · Tributos · Costo nacionalizado",
        detail: "Ingresá el código y el destino — el sistema obtiene la tasa y calcula el costo total con flete, seguro y todos los tributos.",
        color: "#C9A84C",
      },
      {
        icon: "💡",
        badge: "M04",
        title: "Viabilidad de Importación",
        desc: "Subí una foto o describí el producto",
        detail: "La IA identifica el código arancelario, calcula el costo nacionalizado y te dice si el negocio cierra con precio de venta sugerido.",
        color: "#a855f7",
      },
    ],
    stats: [
      { n: "164", label: "países cubiertos (WTO)" },
      { n: "3", label: "sistemas arancelarios" },
      { n: "4", label: "módulos integrados" },
    ],
    blog_title: "Últimas novedades",
    blog_tag: "Tratados comerciales",
    blog_date: "Junio 2026",
    blog_headline: "MERCOSUR–UE: el acuerdo que cambia las reglas para exportadores del bloque",
    blog_body: [
      "Después de más de 25 años de negociaciones, el acuerdo comercial entre el MERCOSUR y la Unión Europea avanza hacia su ratificación definitiva. Argentina, Brasil, Uruguay y Paraguay se posicionan para acceder al mercado europeo con condiciones preferenciales.",
      "El acuerdo establece la eliminación progresiva de aranceles para más del 90% del comercio bilateral. Para exportadores del MERCOSUR, eso significa acceso preferencial para productos clave como carne, lácteos, cuero, vino y software.",
      "Para acceder a las tasas preferenciales, los productos deben cumplir con las reglas de origen del acuerdo. Sin el certificado correspondiente, se tributa el arancel general — que puede llegar al 20% en productos agroindustriales.",
    ],
    blog_cta: "Simulá tu operación ahora →",
    footer: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
    footer_legal: "Datos de referencia provenientes de fuentes oficiales. No reemplaza la consulta con un despachante de aduana habilitado.",
  },
  en: {
    nav_login: "Sign in",
    nav_register: "Start free",
    badge: "Coming soon",
    headline: "Tariff intelligence for importers and exporters",
    tagline: "Real tariff rates, exact costs and savings simulations — in seconds.",
    sub: "Built for entrepreneurs and SMEs who need real data to make decisions, without relying on an external consultant.",
    cta_primary: "Start free →",
    cta_secondary: "See plans",
    cta_sub: "3 free consultations · No credit card",
    notify_label: "Get early access",
    notify_placeholder: "your@email.com",
    notify_btn: "Notify me at launch",
    notify_sub: "No spam. One email when we open.",
    notify_thanks: "Thanks! We'll notify you when we launch.",
    offer_text: "Launch offer",
    offer_detail: "Annual plan with 2 months free",
    sources_title: "Official data, not estimates",
    sources: [
      { icon: "🌐", name: "WTO API", desc: "Applied MFN rates by HS code for 164 member countries" },
      { icon: "🇧🇷", name: "Siscomex / BrasilAPI", desc: "Official NCM nomenclature for MERCOSUR" },
      { icon: "🇪🇺", name: "TARIC EU", desc: "European Union tariff database" },
      { icon: "🤖", name: "AI + official sources", desc: "Classification by image, text or code with real verification" },
    ],
    features_title: "Four modules. One platform.",
    features: [
      {
        icon: "🔍",
        badge: "M01",
        title: "HS / NCM / TARIC Search",
        desc: "Search · Trade Agreements · Documentation",
        detail: "Search by image, description or code. Get the tariff position, real rate, active trade agreements between countries and required documents at origin and destination.",
        color: "#0057FF",
      },
      {
        icon: "📄",
        badge: "M02",
        title: "Certificate of Origin Operations Simulator",
        desc: "MERCOSUR · FTA · GSP",
        detail: "Simulate if your operation qualifies for a preferential rate, how much you save and what documents you need.",
        color: "#22c55e",
      },
      {
        icon: "📦",
        badge: "M03",
        title: "CIF Calculator",
        desc: "Incoterms · Duties · Landed cost",
        detail: "Enter the code and destination — the system gets the rate and calculates the full cost with freight, insurance and all duties.",
        color: "#C9A84C",
      },
      {
        icon: "💡",
        badge: "M04",
        title: "Import Viability",
        desc: "Upload a photo or describe the product",
        detail: "AI identifies the tariff code, calculates the landed cost and tells you if the business works with a suggested selling price.",
        color: "#a855f7",
      },
    ],
    stats: [
      { n: "164", label: "countries covered (WTO)" },
      { n: "3", label: "tariff systems" },
      { n: "4", label: "integrated modules" },
    ],
    blog_title: "Latest news",
    blog_tag: "Trade agreements",
    blog_date: "June 2026",
    blog_headline: "MERCOSUR–EU: the agreement reshaping the rules for bloc exporters",
    blog_body: [
      "After more than 25 years of negotiations, the trade agreement between MERCOSUR and the European Union is moving toward final ratification. Argentina, Brazil, Uruguay and Paraguay are positioned to access the European market under preferential conditions.",
      "The agreement establishes the progressive elimination of tariffs on more than 90% of bilateral trade. For MERCOSUR exporters, this means preferential access for key products such as beef, dairy, leather, wine and software.",
      "To access preferential rates, products must comply with the agreement's rules of origin. Without the corresponding certificate, the general tariff applies — which can reach 20% on agro-industrial products.",
    ],
    blog_cta: "Simulate your operation now →",
    footer: "© 2025 Global Tariff Hub. All rights reserved.",
    footer_legal: "Reference data from official sources. Does not replace advice from a licensed customs broker.",
  },
};

export default function HomePage({ defaultLang = "es" }: { defaultLang?: "es" | "en" }) {
  const [lang, setLang] = useState<"es" | "en">(defaultLang as "es" | "en");
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const days = daysLeft();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const t = content[lang];

  return (
    <div style={{ backgroundColor: "#06060C", minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Top bar oferta */}
      {days > 0 && (
        <div style={{ background: "linear-gradient(90deg, #0D1B3E, #0A1628, #0D1B3E)", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "9px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#C9A84C", letterSpacing: 0.3 }}>
            ⚡ {t.offer_text} — {t.offer_detail} · {days} {lang === "es" ? "días restantes" : "days left"}
            <Link href="/pricing" style={{ marginLeft: 14, color: "#FFF", fontWeight: 800, textDecoration: "underline" }}>
              {lang === "es" ? "Ver oferta →" : "See offer →"}
            </Link>
          </p>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.5)", letterSpacing: 0.5 }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.3, color: "#FFF" }}>Global Tariff Hub</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#modulos" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
            {lang === "es" ? "Módulos" : "Modules"}
          </a>
          <Link href="/pricing" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Pricing</Link>
          <a href="#blog" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Blog</a>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["es", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFF" : "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}>{t.nav_login}</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "96px 40px 72px", textAlign: "center" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,87,255,0.1)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 20, padding: "6px 18px", marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{t.badge}</span>
        </div>

        <h1 style={{ fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 24, letterSpacing: -1, color: "#FFF" }}>
          {t.headline}
        </h1>

        <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#C9A84C", marginBottom: 20, fontWeight: 500, letterSpacing: 0.2 }}>
          {t.tagline}
        </p>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 52px", fontWeight: 400 }}>
          {t.sub}
        </p>

        {/* Formulario captura de email */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{t.notify_label}</p>
        {submitted ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "16px 28px" }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <p style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>{t.notify_thanks}</p>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await fetch("/api/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, lang }),
                });
              } catch {}
              setSubmitted(true);
            }}
            style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.notify_placeholder}
              required
              style={{ padding: "13px 20px", borderRadius: 9, border: "1px solid rgba(0,87,255,0.35)", background: "rgba(13,27,62,0.8)", color: "#FFF", fontSize: 14, width: 280, outline: "none" }}
            />
            <button
              type="submit"
              style={{ padding: "13px 28px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2 }}
            >
              {t.notify_btn}
            </button>
          </form>
        )}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12, letterSpacing: 0.3 }}>{t.notify_sub}</p>
      </main>

      {/* Stats */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{ background: "rgba(13,27,62,0.6)", borderRadius: 12, padding: "28px 16px", textAlign: "center", border: "1px solid rgba(0,87,255,0.12)" }}>
              <p style={{ fontSize: 38, fontWeight: 900, color: "#0057FF", marginBottom: 6, letterSpacing: -1 }}>{s.n}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fuentes de datos */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px 80px" }}>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.sources_title}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          {t.sources.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 18px" }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>{s.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#FFF", letterSpacing: -0.5 }}>{t.features_title}</h2>
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 44 }}>
          {lang === "es" ? "Cada módulo funciona en forma independiente o como flujo integrado." : "Each module works independently or as an integrated flow."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ background: "rgba(13,27,62,0.5)", border: `1px solid rgba(${f.color === "#0057FF" ? "0,87,255" : f.color === "#22c55e" ? "34,197,94" : f.color === "#C9A84C" ? "201,168,76" : "168,85,247"},0.2)`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>{f.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: f.color, background: `${f.color}18`, border: `1px solid ${f.color}40`, borderRadius: 6, padding: "3px 9px", letterSpacing: 0.5 }}>{f.badge}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, color: "#FFF", lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: 11, color: f.color, marginBottom: 12, fontWeight: 600, letterSpacing: 0.2 }}>{f.desc}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA central */}
      <section style={{ maxWidth: 680, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(0,87,255,0.12), rgba(13,27,62,0.8))", border: "1px solid rgba(0,87,255,0.25)", borderRadius: 20, padding: "56px 48px", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5 }}>
            {lang === "es" ? "Empezá ahora — es gratis" : "Start now — it's free"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.7 }}>
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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await fetch("/api/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, lang }),
                  });
                } catch {}
                setSubmitted(true);
              }}
              style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.notify_placeholder}
                required
                style={{ padding: "13px 20px", borderRadius: 9, border: "1px solid rgba(0,87,255,0.35)", background: "rgba(6,6,12,0.8)", color: "#FFF", fontSize: 14, width: 260, outline: "none" }}
              />
              <button type="submit" style={{ padding: "13px 28px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {t.notify_btn}
              </button>
            </form>
          )}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>{t.notify_sub}</p>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 96px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28, color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 16, letterSpacing: -0.3 }}>{t.blog_title}</h2>
        <article style={{ background: "rgba(13,27,62,0.5)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "40px 44px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
            <span style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.25)", letterSpacing: 0.5, textTransform: "uppercase" }}>{t.blog_tag}</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{t.blog_date}</span>
          </div>
          <h3 style={{ fontSize: "clamp(17px,2.5vw,21px)", fontWeight: 800, lineHeight: 1.35, marginBottom: 24, color: "#FFF", letterSpacing: -0.3 }}>{t.blog_headline}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {t.blog_body.map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>{para}</p>
            ))}
          </div>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href="/register" style={{ color: "#0057FF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.blog_cta}</Link>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }}>GTH</div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Global Tariff Hub</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/login", label: t.nav_login },
              { href: "/privacidad", label: lang === "es" ? "Privacidad" : "Privacy" },
              { href: "/terminos", label: lang === "es" ? "Términos" : "Terms" },
              { href: "/legales", label: lang === "es" ? "Aviso Legal" : "Legal Notice" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 500 }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 960, margin: "20px auto 0", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>{t.footer}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", lineHeight: 1.6 }}>{t.footer_legal}</p>
        </div>
      </footer>
    </div>
  );
}
