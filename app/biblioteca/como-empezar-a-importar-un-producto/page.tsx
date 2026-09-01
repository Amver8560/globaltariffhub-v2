import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo empezar a importar un producto",
  description:
    "Qué necesitás saber antes de avanzar con una importación: qué es una operación de comercio exterior, qué información reunir, en qué orden explorarla y cuándo consultar a un profesional.",
  alternates: { canonical: "https://globaltariffhub.com/biblioteca/como-empezar-a-importar-un-producto" },
  openGraph: {
    title: "Cómo empezar a importar un producto: qué necesitás saber antes de avanzar",
    description:
      "Una guía para ordenar las primeras preguntas de una importación y explorarlas en el orden correcto.",
    url: "https://globaltariffhub.com/biblioteca/como-empezar-a-importar-un-producto",
    type: "article",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", position: 1, name: "Inicio", item: "https://globaltariffhub.com/" },
        { "@type": "ListItem", position: 2, name: "Biblioteca", item: "https://globaltariffhub.com/biblioteca" },
        { "@type": "ListItem", position: 3, name: "Cómo empezar a importar un producto", item: "https://globaltariffhub.com/biblioteca/como-empezar-a-importar-un-producto" },
      ],
    },
    {
      "@type": "Article",
      headline: "Cómo empezar a importar un producto: qué necesitás saber antes de avanzar",
      description:
        "Qué necesitás saber antes de avanzar con una importación: qué es una operación de comercio exterior, qué información reunir y en qué orden explorarla.",
      inLanguage: "es",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "Global Tariff Hub", url: "https://globaltariffhub.com" },
      mainEntityOfPage: "https://globaltariffhub.com/biblioteca/como-empezar-a-importar-un-producto",
    },
  ],
};

export default function ArticlePage() {
  return (
    <div className="art">
      <style>{CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="art-nav">
        <Link href="/" className="art-logo"><span className="art-mark">GTH</span><span>Global Tariff Hub</span></Link>
        <Link href="/biblioteca" className="art-back">← Biblioteca</Link>
      </header>

      <main className="art-main">
        <nav aria-label="Ruta de navegación" className="art-crumbs">
          <Link href="/">Inicio</Link> <span>/</span> <Link href="/biblioteca">Biblioteca</Link>
        </nav>

        <article>
          <p className="art-cat">EMPEZAR A IMPORTAR Y EXPORTAR</p>
          <h1>Cómo empezar a importar un producto: qué necesitás saber antes de avanzar</h1>

          <p className="art-intro">
            Cuando alguien piensa por primera vez en importar un producto, la duda inicial no suele
            ser cuál es el arancel exacto. Es más básica: ¿qué necesito averiguar y en qué orden?
            Esta guía ordena esas primeras preguntas.
          </p>

          <h2>¿Qué es una operación de comercio exterior?</h2>
          <p>
            Importar no es solo comprar en otro país y recibir un paquete. Es una operación regulada:
            la mercadería tiene que estar clasificada bajo un código arancelario, pagar los tributos que
            correspondan al país de destino, cumplir requisitos y, en muchos casos, contar con
            documentación específica. El conjunto de esas condiciones depende de tres cosas: qué es el
            producto, desde dónde sale y a dónde entra.
          </p>

          <h2>1. Definí bien el producto</h2>
          <p>
            Antes de cualquier número, necesitás describir el producto con precisión: material,
            función, presentación, uso. Esa descripción es la base para determinar su
            <strong> clasificación arancelaria</strong> —el código HS (internacional, 6 dígitos), su
            versión regional NCM en el Mercosur o TARIC en la Unión Europea—. El código no es un
            detalle administrativo: define el arancel, los impuestos y buena parte de los requisitos.
          </p>
          <p>
            Un mismo producto puede tener más de un código posible según el detalle. Por eso conviene
            partir de una descripción completa y, cuando el caso es dudoso, confirmar la posición con
            un despachante de aduana antes de operar.
          </p>

          <h2>2. Definí el corredor: origen y destino</h2>
          <p>
            El mismo producto puede tener condiciones muy distintas según los países involucrados.
            Entre países con un <strong>acuerdo comercial</strong> vigente (por ejemplo, Mercosur, o
            un TLC bilateral) puede existir una tasa preferencial, muchas veces menor a la general,
            si la operación cumple las reglas de origen. Entre países sin un tratamiento preferencial
            aplicable, puede corresponder la tasa general o NMF (Nación Más Favorecida, MFN por sus
            siglas en inglés).
          </p>
          <p>
            El país de destino también define qué impuestos internos se suman al arancel (IVA,
            percepciones y otros tributos varían por país) y qué organismos regulan el ingreso.
          </p>

          <h2>3. Estimá los costos, no solo el precio del proveedor</h2>
          <p>
            El precio de compra es apenas una parte. El <strong>costo CIF</strong> incorpora el flete
            internacional y el seguro; sobre esa base se calculan el arancel y los tributos del
            destino. A eso se agregan gastos de despacho, transporte interno y el tipo de cambio
            utilizado en la valoración. Con esas variables podés construir una primera estimación
            del costo nacionalizado y evaluar mejor la viabilidad económica de la operación.
          </p>

          <h2>4. Revisá requisitos y restricciones</h2>
          <p>
            Según el producto y el destino puede hacer falta un certificado sanitario, un permiso
            previo, una licencia de importación, una norma técnica o un certificado de origen para
            acceder a una preferencia arancelaria. Algunas mercaderías tienen cuotas o tratamientos
            especiales. Detectar esto temprano evita frenos costosos más adelante.
          </p>

          <h2>El orden importa</h2>
          <p>
            Una secuencia razonable para explorar una importación es: <strong>producto → clasificación
            → corredor (origen y destino) → aranceles y acuerdos → requisitos → costos →
            viabilidad</strong>. Cada paso alimenta al siguiente. Empezar por el costo sin haber
            fijado el código lleva a números que no sirven.
          </p>

          <h2>Cuándo consultar a un profesional</h2>
          <p>
            La exploración previa te permite llegar preparado, con las preguntas ordenadas y una
            primera dimensión de la operación. Antes de ejecutar una operación, la clasificación
            arancelaria, la liquidación aduanera y los requisitos regulatorios deben validarse con
            las autoridades y los profesionales competentes según el país y el tipo de operación.
            La herramienta no reemplaza esa validación: la vuelve más eficiente.
          </p>

          <div className="art-cta">
            <p>
              Global Tariff Hub te ayuda a recorrer estos pasos desde un producto: clasificación,
              acuerdos, requisitos y costos en un mismo lugar.
            </p>
            <Link href="/register" className="art-btn">Explorar GTH →</Link>
          </div>
        </article>
      </main>

      <footer className="art-footer">
        <p>Global Tariff Hub — From Product to Trade Intelligence™</p>
        <p>© 2025 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const CSS = `
.art{background:#062863;color:#fff;min-height:100vh;font-family:var(--font-inter),'Helvetica Neue',Arial,sans-serif}
.art a{color:inherit;text-decoration:none}
.art-nav{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;border-bottom:1px solid rgba(59,130,246,0.25)}
.art-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:15px}
.art-mark{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#2563EB,#0D2247);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#F4C542;border:1.5px solid #F4C542}
.art-back{font-size:13px;color:rgba(184,196,217,0.6)}
.art-main{max-width:720px;margin:0 auto;padding:48px 24px 80px}
.art-crumbs{font-size:12px;color:rgba(184,196,217,0.55);margin-bottom:20px}
.art-crumbs a:hover{color:#F4C542}
.art-cat{font-size:11px;font-weight:800;color:#F4C542;letter-spacing:1.5px;margin:0 0 12px}
.art-main h1{font-size:clamp(24px,3.4vw,34px);font-weight:800;line-height:1.2;letter-spacing:-0.5px;margin:0 0 20px}
.art-intro{font-size:17px;color:#fff;font-weight:500;line-height:1.7;margin:0 0 8px}
.art-main h2{font-size:19px;font-weight:800;margin:34px 0 10px}
.art-main p{font-size:15px;color:#B8C4D9;line-height:1.8;margin:0 0 14px}
.art-main strong{color:#fff}
.art-cta{margin-top:40px;background:#0B1E3D;border:1px solid rgba(244,197,66,0.35);border-radius:14px;padding:24px}
.art-cta p{font-size:14px;color:#B8C4D9;margin:0 0 14px}
.art-btn{display:inline-block;background:linear-gradient(135deg,#F4C542,#F9D96A);color:#062863;font-weight:700;font-size:14px;padding:12px 24px;border-radius:9px}
.art-footer{border-top:1px solid rgba(255,255,255,0.08);padding:24px 40px;text-align:center}
.art-footer p{font-size:11px;color:rgba(255,255,255,0.4);margin:2px 0}
@media (max-width:520px){.art-nav{padding:14px 16px}.art-main{padding:36px 16px 60px}}
`;
