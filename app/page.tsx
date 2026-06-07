"use client";

import { useState, useEffect } from "react";

const content = {
  es: {
    nav_about: "Acerca de",
    nav_blog: "Blog",
    badge: "Próximamente",
    headline: "Comercio internacional ágil",
    tagline: "Importá y exportá con los datos que necesitás para negociar mejor.",
    sub: "Pensado para emprendedores y pymes que no tienen un consultor de comercio exterior — pero necesitan tomar decisiones con información real: aranceles, costos CIF y simulaciones de ahorro en segundos.",
    cta: "Quiero acceso anticipado",
    cta_sub: "Sé el primero en saber cuándo lanzamos. Sin spam.",
    placeholder: "tu@email.com",
    btn: "Notificarme",
    features_title: "¿Qué vas a poder hacer?",
    features: [
      { icon: "🤖", title: "Búsqueda por imagen + IA", desc: "Sacá una foto del producto y la IA identifica su código arancelario automáticamente. Sin saber nomencladores." },
      { icon: "🔍", title: "Buscador HS / NCM / TARIC", desc: "Buscá por nombre o descripción del producto y encontrá el código arancelario correcto." },
      { icon: "📄", title: "Simulación de Certificado de Origen", desc: "Calculá el ahorro real con MERCOSUR, TLC o SGP antes de tramitar el certificado." },
      { icon: "📦", title: "Calculadora CIF e Incoterms", desc: "Calculá el costo total de importación o exportación con cualquier Incoterm." },
    ],
    notify_success: "¡Listo! Te avisamos cuando lancemos.",
    blog_title: "Últimas novedades",
    blog_tag: "Tratados comerciales",
    blog_date: "Junio 2025",
    blog_headline: "Uruguay–UE: el nuevo acuerdo que cambia las reglas para exportadores del MERCOSUR",
    blog_body: [
      "Después de más de 25 años de negociaciones, el acuerdo comercial entre el MERCOSUR y la Unión Europea avanza hacia su ratificación definitiva. Uruguay, como uno de los impulsores más activos del tratado, se posiciona como el primer país del bloque en aprovechar las nuevas condiciones arancelarias.",
      "El acuerdo establece la eliminación progresiva de aranceles para más del 90% del comercio bilateral. Para los exportadores uruguayos, eso significa acceso preferencial al mercado europeo para productos clave como carne, lácteos, cuero, lana y software.",
      "¿Qué cambia en la práctica? Los exportadores que hoy pagan aranceles de entre 12% y 20% al ingresar a Europa verán esas tasas reducirse a 0% en un período de transición de 10 años. El primer escalón de reducción entra en vigor en 2026.",
      "Para acceder a las tasas preferenciales, los productos deben cumplir con las reglas de origen del acuerdo — un punto crítico que muchas pymes aún desconocen. Sin el certificado de origen correspondiente, el exportador tributa el arancel general.",
      "En Global Tariff Hub estamos construyendo el simulador que te permite calcular exactamente cuánto ahorrás operación por operación, según el código arancelario de tu producto y la ruta origen-destino. Próximamente disponible.",
    ],
    blog_cta: "Quiero acceso cuando esté disponible →",
    footer: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
    footer_legal: "Este sitio es de carácter informativo. No emite certificados de origen ni documentos aduaneros.",
  },
  en: {
    nav_about: "About",
    nav_blog: "Blog",
    badge: "Coming Soon",
    headline: "Simple international trade",
    tagline: "Import and export with the data you need to negotiate better.",
    sub: "Built for entrepreneurs and SMEs who don't have a trade consultant — but need real information to make decisions: tariffs, CIF costs, and savings simulations in seconds.",
    cta: "Get early access",
    cta_sub: "Be the first to know when we launch. No spam.",
    placeholder: "your@email.com",
    btn: "Notify me",
    features_title: "What will you be able to do?",
    features: [
      { icon: "🤖", title: "Image + AI Search", desc: "Take a photo of a product and AI automatically identifies its tariff code. No tariff knowledge needed." },
      { icon: "🔍", title: "HS / NCM / TARIC Search", desc: "Search by product name or description and find the right tariff code." },
      { icon: "📄", title: "Certificate of Origin Simulation", desc: "Calculate real savings with MERCOSUR, FTA or GSP before applying for the certificate." },
      { icon: "📦", title: "CIF & Incoterms Calculator", desc: "Calculate the full import or export cost with any Incoterm." },
    ],
    notify_success: "Done! We'll notify you when we launch.",
    blog_title: "Latest news",
    blog_tag: "Trade agreements",
    blog_date: "June 2025",
    blog_headline: "Uruguay–EU: the new agreement reshaping the rules for MERCOSUR exporters",
    blog_body: [
      "After more than 25 years of negotiations, the trade agreement between MERCOSUR and the European Union is moving toward final ratification. Uruguay, one of the bloc's most active advocates, is positioned to be the first country to take advantage of the new tariff conditions.",
      "The agreement establishes the progressive elimination of tariffs on more than 90% of bilateral trade. For Uruguayan exporters, this means preferential access to the European market for key products such as beef, dairy, leather, wool, and software.",
      "What changes in practice? Exporters currently paying tariffs of between 12% and 20% to enter Europe will see those rates reduced to 0% over a 10-year transition period. The first reduction step takes effect in 2026.",
      "To access preferential rates, products must comply with the agreement's rules of origin — a critical point that many SMEs are still unaware of. Without the corresponding certificate of origin, the exporter pays the general tariff rate.",
      "At Global Tariff Hub we are building the simulator that lets you calculate exactly how much you save operation by operation, based on your product's tariff code and origin-destination route. Coming soon.",
    ],
    blog_cta: "Get notified when it's available →",
    footer: "© 2025 Global Tariff Hub. All rights reserved.",
    footer_legal: "This site is for informational purposes only. It does not issue certificates of origin or customs documents.",
  },
};

export default function ComingSoon({ defaultLang = "es" }: { defaultLang?: "es" | "en" }) {
  const [lang, setLang] = useState<"es" | "en">(defaultLang as "es" | "en");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
    } catch {}
    setSubmitted(true);
  };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
            Global Tariff Hub
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#features" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>{t.nav_about}</a>
          <a href="#blog" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>{t.nav_blog}</a>
          <a href="/modulo01" style={{ color: "#C9A84C", textDecoration: "none", fontSize: 13, fontWeight: 700, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", padding: "5px 14px", borderRadius: 20 }}>Beta →</a>

          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: lang === l ? "#0057FF" : "transparent",
                  color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  transition: "all 0.2s",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 40px 60px", textAlign: "center" }}>

        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", border: "1px solid #C9A84C", borderRadius: 20, padding: "6px 18px", marginBottom: 32 }}>
          <span style={{ color: "#C9A84C", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>
            ✦ {t.badge}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: -1 }}>
          <span style={{ color: "#FFFFFF" }}>Global </span>
          <span style={{ color: "#0057FF" }}>Tariff </span>
          <span style={{ color: "#C9A84C" }}>Hub</span>
        </h1>

        <p style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700, color: "#FFFFFF", marginBottom: 8, letterSpacing: 0.5 }}>
          {t.headline}
        </p>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400, color: "#C9A84C", marginBottom: 28, fontStyle: "italic" }}>
          &ldquo;{t.tagline}&rdquo;
        </p>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 48px" }}>
          {t.sub}
        </p>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>{t.cta}</p>
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                required
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,87,255,0.4)",
                  background: "#0D1B3E",
                  color: "#FFFFFF",
                  fontSize: 15,
                  width: 280,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 28px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #0057FF, #003DB3)",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.btn}
              </button>
            </form>
          ) : (
            <div style={{ padding: "14px 28px", background: "rgba(0,87,255,0.15)", border: "1px solid #0057FF", borderRadius: 8, display: "inline-block", color: "#FFFFFF", fontSize: 15 }}>
              ✓ {t.notify_success}
            </div>
          )}
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>{t.cta_sub}</p>
        </div>
      </main>

      {/* Features */}
      <section id="features" style={{ maxWidth: 900, margin: "0 auto", padding: "20px 40px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 40, color: "rgba(255,255,255,0.9)" }}>
          {t.features_title}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ background: "#0D1B3E", border: "1px solid rgba(0,87,255,0.2)", borderRadius: 12, padding: "24px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#FFFFFF" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog article */}
      <section id="blog" style={{ maxWidth: 760, margin: "0 auto", padding: "20px 40px 80px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, color: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
          {t.blog_title}
        </h2>

        <article style={{ background: "#0D1B3E", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "36px 40px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
            <span style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.3)", letterSpacing: 0.5 }}>
              {t.blog_tag}
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{t.blog_date}</span>
          </div>

          <h3 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, lineHeight: 1.3, marginBottom: 24, color: "#FFFFFF" }}>
            {t.blog_headline}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {t.blog_body.map((para, i) => (
              <p key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
                {para}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => {
                const el = document.querySelector("input[type='email']") as HTMLInputElement;
                if (el) el.focus();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ background: "none", border: "none", color: "#0057FF", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              {t.blog_cta}
            </button>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{t.footer}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{t.footer_legal}</p>
      </footer>
    </div>
  );
}
