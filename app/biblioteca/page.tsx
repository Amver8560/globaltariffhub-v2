import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biblioteca Digital GTH",
  description:
    "Conocimiento para comprender, explorar y evaluar operaciones de comercio internacional: importar y exportar, clasificación arancelaria, aranceles, acuerdos, Incoterms y costos.",
  alternates: { canonical: "https://globaltariffhub.com/biblioteca" },
  openGraph: {
    title: "Biblioteca Digital GTH",
    description: "Conocimiento para comprender, explorar y evaluar operaciones de comercio internacional.",
    url: "https://globaltariffhub.com/biblioteca",
  },
};

const CATEGORIES = [
  "Empezar a importar y exportar",
  "Clasificación arancelaria",
  "Aranceles e impuestos",
  "Acuerdos comerciales",
  "Incoterms y costos",
  "Documentación y requisitos",
  "Evaluación de operaciones",
];

const ARTICLES = [
  {
    href: "/biblioteca/como-empezar-a-importar-un-producto",
    title: "Cómo empezar a importar un producto: qué necesitás saber antes de avanzar",
    excerpt:
      "Una guía para ordenar las primeras preguntas de una importación: qué es una operación de comercio exterior, qué información necesitás reunir y en qué orden conviene explorarla.",
    category: "Empezar a importar y exportar",
  },
];

export default function BibliotecaPage() {
  return (
    <div className="lib">
      <style>{CSS}</style>
      <header className="lib-nav">
        <Link href="/" className="lib-logo">
          <span className="lib-mark">GTH</span>
          <span className="lib-name">Global Tariff Hub</span>
        </Link>
        <Link href="/" className="lib-back">← Inicio</Link>
      </header>

      <main className="lib-main">
        <p className="lib-eyebrow">BIBLIOTECA</p>
        <h1>Biblioteca Digital GTH</h1>
        <p className="lib-lead">
          Conocimiento para comprender, explorar y evaluar operaciones de comercio internacional.
        </p>

        <section aria-label="Artículos publicados">
          <h2 className="lib-h2">Artículos</h2>
          <div className="lib-grid">
            {ARTICLES.map((a) => (
              <article key={a.href} className="lib-card">
                <p className="lib-cat">{a.category}</p>
                <h3><Link href={a.href}>{a.title}</Link></h3>
                <p className="lib-excerpt">{a.excerpt}</p>
                <Link href={a.href} className="lib-readmore">Leer →</Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Temas de la Biblioteca">
          <h2 className="lib-h2">Temas</h2>
          <p className="lib-note">
            La Biblioteca crece de forma continua. Estos son los temas que la organizan;
            se irán publicando artículos en cada uno.
          </p>
          <ul className="lib-cats">
            {CATEGORIES.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>
      </main>

      <footer className="lib-footer">
        <p>Global Tariff Hub — From Product to Trade Intelligence™</p>
        <p>© 2025 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const CSS = `
.lib{background:#062863;color:#fff;min-height:100vh;font-family:var(--font-inter),'Helvetica Neue',Arial,sans-serif}
.lib a{color:inherit;text-decoration:none}
.lib-nav{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;border-bottom:1px solid rgba(59,130,246,0.25)}
.lib-logo{display:flex;align-items:center;gap:10px}
.lib-mark{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#2563EB,#0D2247);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#F4C542;border:1.5px solid #F4C542}
.lib-name{font-weight:800;font-size:15px}
.lib-back{font-size:13px;color:rgba(184,196,217,0.6)}
.lib-main{max-width:860px;margin:0 auto;padding:56px 24px 80px}
.lib-eyebrow{font-size:11px;font-weight:800;color:#F4C542;letter-spacing:2px;margin-bottom:12px}
.lib-main h1{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-0.5px;margin:0 0 14px}
.lib-lead{font-size:16px;color:#B8C4D9;line-height:1.7;margin:0 0 40px}
.lib-h2{font-size:18px;font-weight:800;margin:36px 0 14px}
.lib-grid{display:grid;gap:14px}
.lib-card{background:#0B1E3D;border:1px solid rgba(59,130,246,0.25);border-radius:14px;padding:22px 24px}
.lib-cat{font-size:11px;font-weight:700;color:#F4C542;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px}
.lib-card h3{font-size:17px;font-weight:700;line-height:1.35;margin:0 0 8px}
.lib-card h3 a:hover{color:#F4C542}
.lib-excerpt{font-size:13px;color:#B8C4D9;line-height:1.7;margin:0 0 10px}
.lib-readmore{font-size:13px;font-weight:700;color:#3B82F6}
.lib-note{font-size:13px;color:rgba(184,196,217,0.55);line-height:1.7;margin:0 0 12px}
.lib-cats{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.lib-cats li{font-size:12px;color:#B8C4D9;background:rgba(255,255,255,0.04);border:1px solid rgba(59,130,246,0.25);border-radius:20px;padding:6px 14px}
.lib-footer{border-top:1px solid rgba(255,255,255,0.08);padding:24px 40px;text-align:center}
.lib-footer p{font-size:11px;color:rgba(255,255,255,0.4);margin:2px 0}
@media (max-width:520px){.lib-nav{padding:14px 16px}.lib-main{padding:40px 16px 60px}}
`;
