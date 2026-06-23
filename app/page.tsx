"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59");
function daysLeft() {
  return Math.max(0, Math.ceil((LAUNCH_OFFER_END.getTime() - Date.now()) / 86400000));
}

const content = {
  es: {
    nav_about: "Acerca de",
    nav_blog: "Blog",
    nav_login: "Iniciar sesión",
    nav_register: "Empezar gratis",
    badge: "Ya disponible",
    headline: "Comercio internacional ágil",
    tagline: "Importá y exportá con los datos que necesitás para negociar mejor.",
    sub: "Pensado para emprendedores y pymes que no tienen un consultor de comercio exterior — pero necesitan tomar decisiones con información real: aranceles, costos CIF y simulaciones de ahorro en segundos.",
    cta_primary: "Empezar gratis →",
    cta_secondary: "Ver planes",
    cta_sub: "3 consultas gratis · Sin tarjeta de crédito",
    offer_text: "Oferta de lanzamiento",
    offer_detail: "Plan anual con 2 meses gratis",
    features_title: "¿Qué podés hacer?",
    features: [
      { icon: "🤖", title: "Viabilidad de Importación", desc: "Subí una foto o describí el producto. La IA identifica el código arancelario y calculás el costo nacionalizado real.", badge: "M05" },
      { icon: "🔍", title: "Buscador HS / NCM / TARIC", desc: "Buscá por nombre, descripción o código y encontrá la posición arancelaria correcta con tasa y documentos.", badge: "M01" },
      { icon: "📄", title: "Certificado de Origen", desc: "Simulá si tu operación califica para tasa preferencial con MERCOSUR, TLC o SGP y cuánto ahorrás.", badge: "M03" },
      { icon: "📦", title: "Calculadora CIF", desc: "Calculá el costo total de importación con flete, seguro y todos los tributos por país de destino.", badge: "M04" },
    ],
    social_proof: "Diseñado para el mundo real",
    social_items: [
      { n: "+190", label: "países cubiertos para búsqueda arancelaria" },
      { n: "3", label: "sistemas arancelarios (HS · NCM · TARIC)" },
      { n: "∞", label: "consultas con plan activo" },
    ],
    blog_title: "Últimas novedades",
    blog_tag: "Tratados comerciales",
    blog_date: "Junio 2025",
    blog_headline: "Uruguay–UE: el nuevo acuerdo que cambia las reglas para exportadores del MERCOSUR",
    blog_body: [
      "Después de más de 25 años de negociaciones, el acuerdo comercial entre el MERCOSUR y la Unión Europea avanza hacia su ratificación definitiva. Uruguay se posiciona como el primer país del bloque en aprovechar las nuevas condiciones arancelarias.",
      "El acuerdo establece la eliminación progresiva de aranceles para más del 90% del comercio bilateral. Para los exportadores uruguayos, eso significa acceso preferencial al mercado europeo para productos clave como carne, lácteos, cuero, lana y software.",
      "Para acceder a las tasas preferenciales, los productos deben cumplir con las reglas de origen del acuerdo. Sin el certificado de origen correspondiente, el exportador tributa el arancel general.",
    ],
    blog_cta: "Simulá tu operación ahora →",
    footer: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
    footer_legal: "Datos de referencia. No reemplaza consulta profesional con despachante habilitado.",
  },
  en: {
    nav_about: "About",
    nav_blog: "Blog",
    nav_login: "Sign in",
    nav_register: "Start free",
    badge: "Now live",
    headline: "Simple international trade",
    tagline: "Import and export with the data you need to negotiate better.",
    sub: "Built for entrepreneurs and SMEs who don't have a trade consultant — but need real information to make decisions: tariffs, CIF costs, and savings simulations in seconds.",
    cta_primary: "Start free →",
    cta_secondary: "See plans",
    cta_sub: "3 free consultations · No credit card",
    offer_text: "Launch offer",
    offer_detail: "Annual plan with 2 months free",
    features_title: "What can you do?",
    features: [
      { icon: "🤖", title: "Import Viability", desc: "Upload a photo or describe the product. AI identifies the tariff code and calculates the real landed cost.", badge: "M05" },
      { icon: "🔍", title: "HS / NCM / TARIC Search", desc: "Search by name, description or code and find the right tariff position with rate and documents.", badge: "M01" },
      { icon: "📄", title: "Certificate of Origin", desc: "Simulate if your operation qualifies for a preferential rate with MERCOSUR, FTA or GSP and how much you save.", badge: "M03" },
      { icon: "📦", title: "CIF Calculator", desc: "Calculate the full import cost with freight, insurance and all duties by destination country.", badge: "M04" },
    ],
    social_proof: "Designed for the real world",
    social_items: [
      { n: "+190", label: "countries covered for tariff search" },
      { n: "3", label: "tariff systems (HS · NCM · TARIC)" },
      { n: "∞", label: "consultations with active plan" },
    ],
    blog_title: "Latest news",
    blog_tag: "Trade agreements",
    blog_date: "June 2025",
    blog_headline: "Uruguay–EU: the new agreement reshaping the rules for MERCOSUR exporters",
    blog_body: [
      "After more than 25 years of negotiations, the trade agreement between MERCOSUR and the European Union is moving toward final ratification. Uruguay is positioned to be the first country in the bloc to take advantage of the new tariff conditions.",
      "The agreement establishes the progressive elimination of tariffs on more than 90% of bilateral trade. For Uruguayan exporters, this means preferential access to the European market for key products such as beef, dairy, leather, wool, and software.",
      "To access preferential rates, products must comply with the agreement's rules of origin. Without the corresponding certificate of origin, the exporter pays the general tariff rate.",
    ],
    blog_cta: "Simulate your operation now →",
    footer: "© 2025 Global Tariff Hub. All rights reserved.",
    footer_legal: "Reference data only. Does not replace professional advice from a licensed customs broker.",
  },
};

export default function HomePage({ defaultLang = "es" }: { defaultLang?: "es" | "en" }) {
  const [lang, setLang] = useState<"es" | "en">(defaultLang as "es" | "en");
  const [mounted, setMounted] = useState(false);
  const days = daysLeft();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const t = content[lang];

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Oferta lanzamiento — top bar */}
      {days > 0 && (
        <div style={{ background: "linear-gradient(135deg, #C9A84C, #A07830)", padding: "8px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>
            ⚡ {t.offer_text} — {t.offer_detail} · {days} días restantes
            <Link href="/pricing" style={{ marginLeft: 12, textDecoration: "underline", color: "#000", fontWeight: 800 }}>Ver oferta →</Link>
          </p>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Global Tariff Hub</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="#features" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>{t.nav_about}</a>
          <a href="#blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>{t.nav_blog}</a>
          <Link href="/pricing" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
          <Link href="/login" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{t.nav_login}</Link>
          <Link href="/register" style={{ background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8 }}>{t.nav_register}</Link>
          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFF" : "rgba(255,255,255,0.5)" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 40px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 20, padding: "5px 16px", marginBottom: 28 }}>
          <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>✦ {t.badge}</span>
        </div>

        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: -1 }}>
          <span style={{ color: "#FFF" }}>Global </span>
          <span style={{ color: "#0057FF" }}>Tariff </span>
          <span style={{ color: "#C9A84C" }}>Hub</span>
        </h1>

        <p style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: "#FFF", marginBottom: 8 }}>{t.headline}</p>
        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "#C9A84C", marginBottom: 24, fontStyle: "italic" }}>&ldquo;{t.tagline}&rdquo;</p>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 44px" }}>{t.sub}</p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <Link href="/register" style={{ padding: "14px 32px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 16, fontWeight: 800, textDecoration: "none" }}>
            {t.cta_primary}
          </Link>
          <Link href="/pricing" style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.08)", color: "#C9A84C", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
            {t.cta_secondary}
          </Link>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{t.cta_sub}</p>
      </main>

      {/* Stats */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 40px 60px" }}>
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>{t.social_proof}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {t.social_items.map((s, i) => (
            <div key={i} style={{ background: "#0D1B3E", borderRadius: 14, padding: "24px 16px", textAlign: "center", border: "1px solid rgba(0,87,255,0.15)" }}>
              <p style={{ fontSize: 36, fontWeight: 900, color: "#0057FF", marginBottom: 6 }}>{s.n}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 960, margin: "0 auto", padding: "20px 40px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 36, color: "rgba(255,255,255,0.9)" }}>{t.features_title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 18 }}>
          {t.features.map((f, i) => (
            <Link key={i} href="/register" style={{ textDecoration: "none" }}>
              <div style={{ background: "#0D1B3E", border: "1px solid rgba(0,87,255,0.2)", borderRadius: 14, padding: "26px 22px", height: "100%", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0,87,255,0.2)", border: "1px solid rgba(0,87,255,0.35)", borderRadius: 6, padding: "2px 8px", color: "#6B9FFF" }}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#FFF" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA medio */}
      <section style={{ maxWidth: 700, margin: "0 auto 60px", padding: "0 40px" }}>
        <div style={{ background: "linear-gradient(135deg,#0D1B3E,#0A1628)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 20, padding: "48px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
            {lang === "es" ? "Empezá ahora — es gratis" : "Start now — it's free"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
            {lang === "es" ? "3 consultas gratis sin tarjeta de crédito. Cuando estés listo, activá tu plan." : "3 free consultations without a credit card. When you're ready, activate your plan."}
          </p>
          <Link href="/register" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
            {t.cta_primary}
          </Link>
          {days > 0 && (
            <p style={{ fontSize: 12, color: "#C9A84C", marginTop: 14 }}>⚡ {t.offer_text} — {days} {lang === "es" ? "días" : "days"}</p>
          )}
        </div>
      </section>

      {/* Blog */}
      <section id="blog" style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 28, color: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>{t.blog_title}</h2>
        <article style={{ background: "#0D1B3E", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "36px 40px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
            <span style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.3)" }}>{t.blog_tag}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{t.blog_date}</span>
          </div>
          <h3 style={{ fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, lineHeight: 1.3, marginBottom: 22, color: "#FFF" }}>{t.blog_headline}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {t.blog_body.map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>{para}</p>
            ))}
          </div>
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <Link href="/register" style={{ color: "#0057FF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.blog_cta}</Link>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 40px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/pricing" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Pricing</Link>
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.nav_login}</Link>
          <Link href="/privacidad" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacidad</Link>
          <Link href="/terminos" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Términos</Link>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{t.footer}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>{t.footer_legal}</p>
      </footer>
    </div>
  );
}
