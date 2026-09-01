import Link from "next/link";
import { PUBLIC_ACCESS_MODE } from "@/lib/accessMode";

// ─────────────────────────────────────────────────────────────
// GTH — Home (Server Component, SSR completo para rastreo/SEO).
// Sin estado de cliente: el selector ES/EN son enlaces a "/" y "/en".
// Responsive por CSS (media queries) — misma identidad visual.
// ─────────────────────────────────────────────────────────────

type Lang = "es" | "en";

const C = {
  bg: "#062863",
  bgCard: "#0B1E3D",
  blue: "#2563EB",
  blueBright: "#3B82F6",
  gold: "#F4C542",
  white: "#FFFFFF",
  textSec: "#B8C4D9",
  textMuted: "rgba(184,196,217,0.55)",
  border: "rgba(59,130,246,0.25)",
  borderGold: "rgba(244,197,66,0.35)",
};

const T = {
  es: {
    nav_tagline: "Comercio internacional ágil",
    nav: [
      ["#como-funciona", "Cómo funciona"],
      ["#modulos", "Módulos"],
      ["#para-quien", "Para quién"],
      ["/biblioteca", "Biblioteca"],
      ["#fuentes", "Fuentes"],
      ["#mision", "Nuestra misión"],
    ] as [string, string][],
    nav_login: "Iniciar sesión",
    nav_cta: "Crear cuenta →",

    hero_eyebrow_open: "ACCESO ANTICIPADO · GRATIS HASTA EL 4 DE SEPTIEMBRE",
    hero_eyebrow_closed: "PRÓXIMO LANZAMIENTO",
    h1: "Explorá una operación de comercio exterior desde tu producto.",
    hero_sub:
      "Aunque no sepas por dónde empezar, Global Tariff Hub te acompaña a descubrir qué necesitás saber para comprender y evaluar una importación o exportación.",
    hero_support:
      "Subí una foto o describí un producto. GTH te ayuda a identificarlo, explorar su clasificación arancelaria, analizar el corredor comercial, conocer requisitos y acuerdos, estimar costos y simular la operación antes de decidir avanzar.",
    hero_support_closed:
      "Global Tariff Hub se encuentra en preparación para su lanzamiento. Conocé cómo funciona y registrate para recibir novedades.",
    signature: "From Product to Trade Intelligence™",
    cta_primary_open: "Explorar GTH →",
    cta_primary_closed: "Quiero conocer el lanzamiento →",
    cta_secondary: "Ver cómo funciona ↓",
    cta_microcopy_open:
      "Acceso gratuito por tiempo limitado · Creá tu cuenta y explorá la plataforma",
    cta_microcopy_closed: "Registrate para recibir novedades del lanzamiento",

    steps: [
      "Subí una foto o describí tu producto",
      "GTH te ayuda a identificarlo y clasificarlo",
      "Explorá aranceles, acuerdos, requisitos y costos",
      "Simulá la operación antes de decidir",
    ],

    why_h2: "No necesitás saber todas las preguntas para poder empezar.",
    why_p1:
      "El comercio exterior reúne clasificación arancelaria, impuestos, acuerdos comerciales, documentación, requisitos, Incoterms, costos y muchas otras variables.",
    why_p2:
      "Para quien está comenzando, el primer problema muchas veces no es encontrar una respuesta. Es saber qué necesita preguntar.",
    why_p3:
      "GTH no presupone que el usuario sabe qué preguntar. Lo acompaña a descubrir qué necesita saber para comprender y evaluar una operación de comercio exterior.",

    how_eyebrow: "CÓMO FUNCIONA",
    how_h2: "¿Cómo funciona Global Tariff Hub?",
    how_intro:
      "Antes de avanzar con una operación internacional aparecen muchas preguntas. GTH ayuda a organizarlas y explorarlas en un mismo recorrido.",
    questions: [
      [
        "¿Puedo importar este producto?",
        "Seleccionás país de origen, país de destino y tipo de operación. GTH ayuda a clasificar el producto, identificar su código HS/NCM/TARIC y explorar las condiciones aplicables a ese corredor comercial.",
      ],
      [
        "¿Puedo exportarlo?",
        "Indicás el país desde donde exportás y el país de destino. GTH ayuda a identificar requisitos de entrada, restricciones y documentación que puede ser necesaria para analizar la operación.",
      ],
      [
        "¿Qué impuestos tendría?",
        "Según el país de destino y la clasificación arancelaria del producto, GTH permite explorar aranceles, impuestos y otros tributos que pueden afectar la operación.",
      ],
      [
        "¿Necesito certificados?",
        "GTH ayuda a identificar certificaciones, permisos o licencias que podrían ser necesarias según el producto y el país de destino, como certificados sanitarios, de origen o requisitos técnicos.",
      ],
      [
        "¿Existen restricciones?",
        "GTH permite explorar restricciones y tratamientos especiales vinculados al producto y al corredor origen-destino, incluyendo licencias, cuotas u otras condiciones cuando corresponda.",
      ],
      [
        "¿Cuál sería el costo total?",
        "La Calculadora CIF permite estimar el costo de la operación incorporando variables como precio de compra, flete, seguro, aranceles, tributos y tipo de cambio utilizado en el cálculo.",
      ],
      [
        "¿Hay beneficios arancelarios disponibles?",
        "GTH ayuda a identificar acuerdos comerciales y tratamientos preferenciales que pueden reducir el arancel aplicable cuando existen condiciones para acceder al beneficio.",
      ],
    ] as [string, string][],
    how_disclaimer:
      "GTH es una herramienta de análisis previo. Sus resultados ayudan a comprender y evaluar una operación y no sustituyen la validación de las autoridades ni el asesoramiento profesional cuando corresponda.",

    product_h2: "Empezá por un producto. Terminá comprendiendo mucho más que su arancel.",
    product_p:
      "Clasificación, acuerdos comerciales, requisitos, costos y viabilidad forman parte de una misma pregunta: ¿qué implicaría convertir este producto en una operación internacional?",

    mod_eyebrow: "FUNCIONALIDADES",
    mod_h2: "Cuatro módulos para explorar una operación.",
    mod_sub:
      "Podés utilizar cada módulo según lo que necesites analizar o recorrer distintas capacidades de GTH para construir una visión más completa de la operación.",
    modules: [
      {
        href: "/modulo01",
        color: C.blueBright,
        name: "Clasificación Arancelaria de Productos con IA",
        question: "¿Qué impuestos paga este producto?",
        copy:
          "Subí una foto o describí el producto. GTH utiliza inteligencia artificial para ayudarte a identificar su clasificación arancelaria, explorar impuestos, documentación y posibles beneficios aplicables a la operación.",
        tags: ["HS Code", "NCM Mercosur", "TARIC Europa", "Acuerdos Comerciales"],
      },
      {
        href: "/modulo02",
        color: C.gold,
        name: "Ahorro arancelario según el país de origen",
        question: "¿Podés pagar menos aranceles de importación?",
        copy:
          "Algunos acuerdos comerciales permiten reducir o eliminar determinados aranceles. GTH ayuda a comparar la tasa aplicable sin tratamiento preferencial con la tasa preferencial disponible cuando existen datos para ese corredor comercial.",
        tags: ["MERCOSUR", "TLC", "SGP", "Ahorro arancelario"],
      },
      {
        href: "/modulo03",
        color: "#22c55e",
        name: "Calculadora CIF",
        question: "¿Cuánto podría costar traerlo?",
        copy:
          "El precio del proveedor es solo una parte de la operación. La Calculadora CIF permite estimar el costo incorporando precio, flete, seguro, aranceles, tributos y otras variables aplicables.",
        tags: ["Incoterms", "CIF", "FOB", "Costo nacionalizado"],
      },
      {
        href: "/modulo04",
        color: "#a78bfa",
        name: "Viabilidad de Importación",
        question: "¿Cómo se ven los números de la operación?",
        copy:
          "Ingresá precio, cantidad y destino para estimar costos, explorar márgenes y conocer restricciones o requisitos que pueden influir en la viabilidad de la operación.",
        tags: ["Restricciones", "Organismos", "Precio sugerido", "Márgenes"],
      },
    ],
    mod_open: "Abrir módulo →",
    mod_cta: "Elegí un módulo y empezá →",

    aud_eyebrow: "PARA QUIÉN",
    aud_h2: "Pensado especialmente para quienes necesitan empezar a comprender una operación.",
    aud_primary: [
      ["Emprendedores", "Explorá una oportunidad internacional antes de comprometer recursos."],
      ["PyMEs", "Comprendé mejor los requisitos, costos y variables de una operación antes de avanzar."],
    ] as [string, string][],
    aud_secondary_title: "También puede ayudar a",
    aud_secondary: [
      ["Equipos de compras", "Evaluá productos y operaciones antes de negociar."],
      ["Equipos de comercio exterior", "Centralizá información para realizar análisis preliminares."],
      ["Consultores", "Acelerá análisis iniciales y organizá información para tus clientes."],
      ["Despachantes", "Utilizá GTH como herramienta complementaria de análisis preliminar."],
    ] as [string, string][],

    src_eyebrow: "DATOS, FUENTES Y METODOLOGÍA",
    src_h2: "Sabé de dónde viene la información que estás usando.",
    src_p1:
      "GTH combina información proveniente de fuentes externas de comercio internacional con lógica propia de análisis y capacidades asistidas por inteligencia artificial.",
    src_p2:
      "Cuando un resultado utiliza datos provenientes de una fuente identificable, GTH procura mostrar su procedencia y período de referencia. Cuando el resultado corresponde a una estimación asistida por IA, se identifica como tal.",
    src_list_title: "Fuentes, nomenclaturas y bases de referencia",
    sources: [
      [
        "WITS / UNCTAD TRAINS",
        "Tasas arancelarias MFN y preferenciales cuando existen datos disponibles para el producto y corredor analizado. Se informa el año de referencia.",
      ],
      ["NCM / MERCOSUR", "Nomenclatura utilizada para clasificación arancelaria regional."],
      [
        "TARIC / Unión Europea",
        "Información arancelaria y nomenclatura de referencia para operaciones vinculadas con la Unión Europea.",
      ],
      ["OMC / WTO", "Tasas MFN de referencia por código arancelario, conforme a sus condiciones de uso."],
    ] as [string, string][],
    src_ai_title: "Análisis asistido por inteligencia artificial",
    src_ai_p:
      "GTH utiliza inteligencia artificial para asistir determinados procesos de clasificación, interpretación y análisis. Los resultados generados mediante IA se identifican como orientativos cuando requieren validación.",
    src_disclaimer:
      "Las determinaciones arancelarias definitivas, requisitos regulatorios y demás condiciones aplicables a una operación deben verificarse ante las autoridades y profesionales competentes.",

    mission_eyebrow: "POR QUÉ EXISTIMOS",
    mission_h2: "Nuestra misión",
    mission_lead: "Hacer más accesible el conocimiento necesario para explorar el comercio internacional.",
    mission_p1:
      "Global Tariff Hub nació para transformar conocimiento complejo y disperso en un recorrido más claro para quienes necesitan evaluar una operación internacional.",
    mission_p2:
      "Especialmente emprendedores y PyMEs que identifican un producto o una oportunidad, pero todavía necesitan comprender qué implica convertirlos en una operación de comercio exterior.",

    vision_h2: "Nuestra visión",
    vision_p:
      "Imaginamos un mundo donde más empresas puedan explorar oportunidades internacionales sin que la complejidad inicial del comercio exterior sea una barrera para empezar.",

    lib_eyebrow: "BIBLIOTECA",
    lib_h2: "Biblioteca Digital GTH",
    lib_p: "Conocimiento para comprender, explorar y evaluar operaciones de comercio internacional.",
    lib_cta: "Ir a la Biblioteca →",

    final_eyebrow_open: "ACCESO ANTICIPADO",
    final_eyebrow_closed: "PRÓXIMO LANZAMIENTO",
    final_h2: "Explorá Global Tariff Hub",
    final_p_open:
      "Durante esta apertura anticipada podés crear tu cuenta y recorrer gratuitamente la plataforma.",
    final_p_closed:
      "Global Tariff Hub se encuentra en preparación para su lanzamiento. Conocé cómo funciona y registrate para recibir novedades.",
    final_btn_open: "Crear cuenta y explorar →",
    final_btn_closed: "Quiero conocer el lanzamiento →",
    final_micro_open: "Acceso gratuito hasta el 4 de septiembre · Sin tarjeta de crédito",
    final_micro_closed: "Te avisamos cuando abra la plataforma",

    closing_a: "Nuestra misión no es calcular aranceles.",
    closing_b: "Nuestra misión es reducir la incertidumbre del comercio internacional.",

    footer_links: [
      ["/privacidad", "Privacidad"],
      ["/terminos", "Términos"],
      ["/legales", "Aviso Legal"],
      ["/biblioteca", "Biblioteca"],
    ] as [string, string][],
    footer_copy: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
    footer_disclaimer:
      "GTH proporciona herramientas de apoyo para análisis de comercio internacional. La clasificación arancelaria definitiva y los requisitos regulatorios deben ser verificados por profesionales competentes. Los resultados generados por IA son orientativos y no constituyen asesoramiento legal, tributario ni aduanero.",
  },

  en: {
    nav_tagline: "Agile international trade",
    nav: [
      ["#como-funciona", "How it works"],
      ["#modulos", "Modules"],
      ["#para-quien", "Who it's for"],
      ["/biblioteca", "Library"],
      ["#fuentes", "Sources"],
      ["#mision", "Our mission"],
    ] as [string, string][],
    nav_login: "Sign in",
    nav_cta: "Create account →",

    hero_eyebrow_open: "EARLY ACCESS · FREE UNTIL SEPTEMBER 4",
    hero_eyebrow_closed: "UPCOMING LAUNCH",
    h1: "Explore an international trade operation, starting from your product.",
    hero_sub:
      "Even if you don't know where to start, Global Tariff Hub helps you discover what you need to know to understand and evaluate an import or export.",
    hero_support:
      "Upload a photo or describe a product. GTH helps you identify it, explore its tariff classification, analyze the trade corridor, learn requirements and agreements, estimate costs and simulate the operation before deciding to move forward.",
    hero_support_closed:
      "Global Tariff Hub is being prepared for launch. Learn how it works and sign up to get updates.",
    signature: "From Product to Trade Intelligence™",
    cta_primary_open: "Explore GTH →",
    cta_primary_closed: "Get launch updates →",
    cta_secondary: "See how it works ↓",
    cta_microcopy_open: "Free access for a limited time · Create your account and explore the platform",
    cta_microcopy_closed: "Sign up to receive launch updates",

    steps: [
      "Upload a photo or describe your product",
      "GTH helps you identify and classify it",
      "Explore tariffs, agreements, requirements and costs",
      "Simulate the operation before deciding",
    ],

    why_h2: "You don't need to know all the questions to get started.",
    why_p1:
      "International trade brings together tariff classification, taxes, trade agreements, documentation, requirements, Incoterms, costs and many other variables.",
    why_p2:
      "For someone starting out, the first problem is often not finding an answer. It's knowing what to ask.",
    why_p3:
      "GTH does not assume the user knows what to ask. It helps them discover what they need to know to understand and evaluate an international trade operation.",

    how_eyebrow: "HOW IT WORKS",
    how_h2: "How does Global Tariff Hub work?",
    how_intro:
      "Before moving forward with an international operation, many questions come up. GTH helps organize and explore them in a single flow.",
    questions: [
      [
        "Can I import this product?",
        "You select the origin country, destination country and type of operation. GTH helps classify the product, identify its HS/NCM/TARIC code and explore the conditions that apply to that trade corridor.",
      ],
      [
        "Can I export it?",
        "You indicate the country you export from and the destination country. GTH helps identify entry requirements, restrictions and documentation that may be needed to analyze the operation.",
      ],
      [
        "What taxes would apply?",
        "Based on the destination country and the product's tariff classification, GTH lets you explore tariffs, taxes and other charges that may affect the operation.",
      ],
      [
        "Do I need certificates?",
        "GTH helps identify certifications, permits or licenses that could be required depending on the product and destination country, such as sanitary, origin or technical requirements.",
      ],
      [
        "Are there restrictions?",
        "GTH lets you explore restrictions and special treatments linked to the product and the origin-destination corridor, including licenses, quotas or other conditions where applicable.",
      ],
      [
        "What would the total cost be?",
        "The CIF Calculator lets you estimate the operation cost incorporating variables such as purchase price, freight, insurance, tariffs, taxes and the exchange rate used in the calculation.",
      ],
      [
        "Are there tariff benefits available?",
        "GTH helps identify trade agreements and preferential treatments that may reduce the applicable tariff when the conditions to access the benefit exist.",
      ],
    ] as [string, string][],
    how_disclaimer:
      "GTH is a preliminary analysis tool. Its results help you understand and evaluate an operation and do not replace validation by the authorities or professional advice where applicable.",

    product_h2: "Start with a product. End up understanding much more than its tariff.",
    product_p:
      "Classification, trade agreements, requirements, costs and viability are all part of the same question: what would it take to turn this product into an international operation?",

    mod_eyebrow: "FEATURES",
    mod_h2: "Four modules to explore an operation.",
    mod_sub:
      "You can use each module for what you need to analyze, or work through GTH's different capabilities to build a fuller view of the operation.",
    modules: [
      {
        href: "/modulo01",
        color: C.blueBright,
        name: "AI Product Tariff Classification",
        question: "What taxes does this product pay?",
        copy:
          "Upload a photo or describe the product. GTH uses artificial intelligence to help you identify its tariff classification and explore taxes, documentation and potential benefits that apply to the operation.",
        tags: ["HS Code", "NCM Mercosur", "TARIC Europe", "Trade Agreements"],
      },
      {
        href: "/modulo02",
        color: C.gold,
        name: "Tariff savings by country of origin",
        question: "Can you pay lower import tariffs?",
        copy:
          "Some trade agreements allow reducing or eliminating certain tariffs. GTH helps compare the rate that applies without preferential treatment with the preferential rate available when data exists for that trade corridor.",
        tags: ["MERCOSUR", "FTA", "GSP", "Tariff savings"],
      },
      {
        href: "/modulo03",
        color: "#22c55e",
        name: "CIF Calculator",
        question: "What could it cost to bring it in?",
        copy:
          "The supplier price is only part of the operation. The CIF Calculator lets you estimate the cost incorporating price, freight, insurance, tariffs, taxes and other applicable variables.",
        tags: ["Incoterms", "CIF", "FOB", "Landed cost"],
      },
      {
        href: "/modulo04",
        color: "#a78bfa",
        name: "Import Viability",
        question: "How do the operation's numbers look?",
        copy:
          "Enter price, quantity and destination to estimate costs, explore margins and learn about restrictions or requirements that may affect the operation's viability.",
        tags: ["Restrictions", "Agencies", "Suggested price", "Margins"],
      },
    ],
    mod_open: "Open module →",
    mod_cta: "Pick a module and get started →",

    aud_eyebrow: "WHO IT'S FOR",
    aud_h2: "Built especially for those who need to start understanding an operation.",
    aud_primary: [
      ["Entrepreneurs", "Explore an international opportunity before committing resources."],
      ["SMEs", "Better understand the requirements, costs and variables of an operation before moving forward."],
    ] as [string, string][],
    aud_secondary_title: "It can also help",
    aud_secondary: [
      ["Procurement teams", "Evaluate products and operations before negotiating."],
      ["Foreign trade teams", "Centralize information for preliminary analysis."],
      ["Consultants", "Speed up initial analysis and organize information for your clients."],
      ["Customs brokers", "Use GTH as a complementary preliminary analysis tool."],
    ] as [string, string][],

    src_eyebrow: "DATA, SOURCES AND METHODOLOGY",
    src_h2: "Know where the information you're using comes from.",
    src_p1:
      "GTH combines information from external international trade sources with its own analysis logic and AI-assisted capabilities.",
    src_p2:
      "When a result uses data from an identifiable source, GTH aims to show its provenance and reference period. When the result is an AI-assisted estimate, it is identified as such.",
    src_list_title: "Sources, nomenclatures and reference databases",
    sources: [
      [
        "WITS / UNCTAD TRAINS",
        "MFN and preferential tariff rates where data exists for the product and corridor analyzed. The reference year is shown.",
      ],
      ["NCM / MERCOSUR", "Nomenclature used for regional tariff classification."],
      [
        "TARIC / European Union",
        "Tariff information and reference nomenclature for operations involving the European Union.",
      ],
      ["WTO", "Reference MFN rates by tariff code, subject to its terms of use."],
    ] as [string, string][],
    src_ai_title: "AI-assisted analysis",
    src_ai_p:
      "GTH uses artificial intelligence to assist certain classification, interpretation and analysis processes. Results generated with AI are identified as indicative when they require validation.",
    src_disclaimer:
      "Final tariff determinations, regulatory requirements and other conditions applicable to an operation must be verified with the competent authorities and professionals.",

    mission_eyebrow: "WHY WE EXIST",
    mission_h2: "Our mission",
    mission_lead: "Make the knowledge needed to explore international trade more accessible.",
    mission_p1:
      "Global Tariff Hub was created to turn complex, scattered knowledge into a clearer path for those who need to evaluate an international operation.",
    mission_p2:
      "Especially entrepreneurs and SMEs who identify a product or an opportunity but still need to understand what it takes to turn it into a foreign trade operation.",

    vision_h2: "Our vision",
    vision_p:
      "We imagine a world where more companies can explore international opportunities without the initial complexity of foreign trade being a barrier to getting started.",

    lib_eyebrow: "LIBRARY",
    lib_h2: "GTH Digital Library",
    lib_p: "Knowledge to understand, explore and evaluate international trade operations.",
    lib_cta: "Go to the Library →",

    final_eyebrow_open: "EARLY ACCESS",
    final_eyebrow_closed: "UPCOMING LAUNCH",
    final_h2: "Explore Global Tariff Hub",
    final_p_open: "During this early opening you can create your account and explore the platform for free.",
    final_p_closed:
      "Global Tariff Hub is being prepared for launch. Learn how it works and sign up to get updates.",
    final_btn_open: "Create account and explore →",
    final_btn_closed: "Get launch updates →",
    final_micro_open: "Free access until September 4 · No credit card",
    final_micro_closed: "We'll let you know when the platform opens",

    closing_a: "Our mission is not to calculate tariffs.",
    closing_b: "Our mission is to reduce the uncertainty of international trade.",

    footer_links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/legales", "Legal Notice"],
      ["/biblioteca", "Library"],
    ] as [string, string][],
    footer_copy: "© 2025 Global Tariff Hub. All rights reserved.",
    footer_disclaimer:
      "GTH provides support tools for international trade analysis. Final tariff classification and regulatory requirements must be verified by competent professionals. AI-generated results are indicative and do not constitute legal, tax or customs advice.",
  },
};

export default function HomeContent({ lang = "es" }: { lang?: Lang }) {
  const t = T[lang];
  const open = PUBLIC_ACCESS_MODE;
  const otherLangHref = lang === "es" ? "/en" : "/";

  return (
    <div className="gth-home">
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────── */}
      <header className="gth-nav">
        <Link href={lang === "es" ? "/" : "/en"} className="gth-logo">
          <span className="gth-logo-mark">GTH</span>
          <span>
            <span className="gth-logo-name">Global Tariff Hub</span>
            <span className="gth-logo-tag">{t.nav_tagline}</span>
          </span>
        </Link>

        <nav className="gth-nav-links" aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}>
          {t.nav.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <div className="gth-nav-actions">
          <div className="gth-lang">
            <Link href={lang === "es" ? "/" : "/en"} aria-current={lang === "es" ? "page" : undefined} className={lang === "es" ? "on" : ""}>ES</Link>
            <Link href={otherLangHref} aria-current={lang === "en" ? "page" : undefined} className={lang === "en" ? "on" : ""}>EN</Link>
          </div>
          <Link href="/login" className="gth-link-muted">{t.nav_login}</Link>
          <Link href="/register" className="gth-btn gth-btn-gold">{t.nav_cta}</Link>
        </div>
      </header>

      <main>
        {/* ── Hero ────────────────────────────── */}
        <section className="gth-hero">
          <div className="gth-hero-text">
            <p className="gth-eyebrow">{open ? t.hero_eyebrow_open : t.hero_eyebrow_closed}</p>
            <h1 className="gth-h1">{t.h1}</h1>
            <p className="gth-hero-sub">{open ? t.hero_sub : t.hero_support_closed}</p>
            {open && <p className="gth-hero-support">{t.hero_support}</p>}
            <p className="gth-signature">{t.signature}</p>

            <div className="gth-hero-ctas">
              <Link href="/register" className="gth-btn gth-btn-primary">{open ? t.cta_primary_open : t.cta_primary_closed}</Link>
              <a href="#como-funciona" className="gth-btn gth-btn-ghost">{t.cta_secondary}</a>
            </div>
            <p className="gth-microcopy">{open ? t.cta_microcopy_open : t.cta_microcopy_closed}</p>
          </div>

          <div className="gth-hero-img">
            <img
              src="/hero-globe.png"
              alt={lang === "es"
                ? "Plataforma Global Tariff Hub para analizar operaciones de comercio exterior"
                : "Global Tariff Hub platform for analyzing foreign trade operations"}
              width={560}
              height={560}
              loading="eager"
            />
          </div>
        </section>

        {/* ── Cuatro pasos ────────────────────── */}
        <section className="gth-steps" aria-label={lang === "es" ? "Cómo empezar" : "How to start"}>
          {t.steps.map((s, i) => (
            <div key={i} className="gth-step">
              <span className="gth-step-num">{String(i + 1).padStart(2, "0")}</span>
              <p>{s}</p>
            </div>
          ))}
        </section>

        {/* ── Why ─────────────────────────────── */}
        <section className="gth-section gth-why">
          <div className="gth-narrow">
            <h2>{t.why_h2}</h2>
            <p>{t.why_p1}</p>
            <p>{t.why_p2}</p>
            <p className="gth-why-key">{t.why_p3}</p>
          </div>
        </section>

        {/* ── Cómo funciona / 7 preguntas ─────── */}
        <section id="como-funciona" className="gth-section gth-alt">
          <div className="gth-wide">
            <p className="gth-eyebrow">{t.how_eyebrow}</p>
            <h2>{t.how_h2}</h2>
            <p className="gth-lead">{t.how_intro}</p>

            <div className="gth-qgrid">
              {t.questions.map(([q, a], i) => (
                <article key={i} className="gth-qcard">
                  <h3>{q}</h3>
                  <p>{a}</p>
                </article>
              ))}
            </div>

            <p className="gth-note">{t.how_disclaimer}</p>
          </div>
        </section>

        {/* ── Empezá por un producto ──────────── */}
        <section className="gth-section">
          <div className="gth-narrow gth-product">
            <h2>{t.product_h2}</h2>
            <p>{t.product_p}</p>
          </div>
        </section>

        {/* ── Módulos ─────────────────────────── */}
        <section id="modulos" className="gth-section gth-alt">
          <div className="gth-wide">
            <p className="gth-eyebrow">{t.mod_eyebrow}</p>
            <h2>{t.mod_h2}</h2>
            <p className="gth-lead">{t.mod_sub}</p>

            <div className="gth-modgrid">
              {t.modules.map((m) => (
                <Link key={m.href} href={m.href} className="gth-modcard" style={{ borderColor: m.color + "55" }}>
                  <p className="gth-mod-q" style={{ color: m.color }}>{m.question}</p>
                  <h3>{m.name}</h3>
                  <p className="gth-mod-copy">{m.copy}</p>
                  <div className="gth-tags">
                    {m.tags.map((tag) => (
                      <span key={tag} style={{ color: m.color, borderColor: m.color + "55" }}>{tag}</span>
                    ))}
                  </div>
                  <span className="gth-mod-open" style={{ color: m.color }}>{t.mod_open}</span>
                </Link>
              ))}
            </div>

            <div className="gth-center">
              <Link href="/modulos" className="gth-btn gth-btn-ghost gth-btn-gold-outline">{t.mod_cta}</Link>
            </div>
          </div>
        </section>

        {/* ── Para quién ──────────────────────── */}
        <section id="para-quien" className="gth-section">
          <div className="gth-wide">
            <p className="gth-eyebrow">{t.aud_eyebrow}</p>
            <h2>{t.aud_h2}</h2>

            <div className="gth-aud-primary">
              {t.aud_primary.map(([label, desc]) => (
                <div key={label} className="gth-aud-card gth-aud-card--primary">
                  <h3>{label}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <p className="gth-aud-sub">{t.aud_secondary_title}</p>
            <div className="gth-aud-secondary">
              {t.aud_secondary.map(([label, desc]) => (
                <div key={label} className="gth-aud-card">
                  <h3>{label}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Datos, fuentes y metodología ────── */}
        <section id="fuentes" className="gth-section gth-alt">
          <div className="gth-wide">
            <p className="gth-eyebrow">{t.src_eyebrow}</p>
            <h2>{t.src_h2}</h2>
            <p className="gth-lead">{t.src_p1}</p>
            <p className="gth-lead">{t.src_p2}</p>

            <p className="gth-src-title">{t.src_list_title}</p>
            <div className="gth-srcgrid">
              {t.sources.map(([name, desc]) => (
                <div key={name} className="gth-srccard">
                  <span className="gth-badge gth-badge-src">{lang === "es" ? "FUENTE IDENTIFICADA" : "IDENTIFIED SOURCE"}</span>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                </div>
              ))}
              <div className="gth-srccard gth-srccard--ai">
                <span className="gth-badge gth-badge-ai">{lang === "es" ? "ANÁLISIS ASISTIDO POR IA" : "AI-ASSISTED ANALYSIS"}</span>
                <h3>{t.src_ai_title}</h3>
                <p>{t.src_ai_p}</p>
              </div>
            </div>

            <p className="gth-note">{t.src_disclaimer}</p>
          </div>
        </section>

        {/* ── Misión ──────────────────────────── */}
        <section id="mision" className="gth-section">
          <div className="gth-narrow">
            <p className="gth-eyebrow">{t.mission_eyebrow}</p>
            <h2>{t.mission_h2}</h2>
            <p className="gth-mission-lead">{t.mission_lead}</p>
            <p>{t.mission_p1}</p>
            <p>{t.mission_p2}</p>
          </div>
        </section>

        {/* ── Visión ──────────────────────────── */}
        <section className="gth-section gth-alt">
          <div className="gth-narrow">
            <h2>{t.vision_h2}</h2>
            <p>{t.vision_p}</p>
          </div>
        </section>

        {/* ── Biblioteca ──────────────────────── */}
        <section className="gth-section">
          <div className="gth-narrow gth-lib">
            <p className="gth-eyebrow">{t.lib_eyebrow}</p>
            <h2>{t.lib_h2}</h2>
            <p>{t.lib_p}</p>
            <Link href="/biblioteca" className="gth-btn gth-btn-ghost">{t.lib_cta}</Link>
          </div>
        </section>

        {/* ── CTA acceso anticipado ───────────── */}
        <section className="gth-section gth-alt">
          <div className="gth-narrow gth-final">
            <p className="gth-eyebrow">{open ? t.final_eyebrow_open : t.final_eyebrow_closed}</p>
            <h2>{t.final_h2}</h2>
            <p>{open ? t.final_p_open : t.final_p_closed}</p>
            <Link href="/register" className="gth-btn gth-btn-gold">{open ? t.final_btn_open : t.final_btn_closed}</Link>
            <p className="gth-microcopy">{open ? t.final_micro_open : t.final_micro_closed}</p>
          </div>
        </section>

        {/* ── Cierre ──────────────────────────── */}
        <section className="gth-section gth-closing">
          <p>{t.closing_a}<br /><strong>{t.closing_b}</strong></p>
        </section>
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer className="gth-footer">
        <div className="gth-footer-top">
          <div className="gth-logo">
            <span className="gth-logo-mark">GTH</span>
            <span>
              <span className="gth-logo-name">Global Tariff Hub</span>
              <span className="gth-logo-tag">From Product to Trade Intelligence™</span>
            </span>
          </div>
          <nav className="gth-footer-links" aria-label={lang === "es" ? "Enlaces del pie" : "Footer links"}>
            {t.footer_links.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </div>
        <p className="gth-footer-copy">{t.footer_copy}</p>
        <p className="gth-footer-disclaimer">{t.footer_disclaimer}</p>
      </footer>
    </div>
  );
}

const CSS = `
.gth-home{background:${C.bg};color:${C.white};font-family:var(--font-inter),'Helvetica Neue',Arial,sans-serif;min-height:100vh;overflow-x:hidden}
.gth-home a{color:inherit;text-decoration:none}
.gth-home h1,.gth-home h2,.gth-home h3{margin:0;letter-spacing:-0.5px}
.gth-home p{margin:0}

.gth-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 48px;border-bottom:1px solid ${C.border};background:rgba(6,40,99,0.97);position:sticky;top:0;z-index:100;backdrop-filter:blur(14px);flex-wrap:wrap}
.gth-logo{display:flex;align-items:center;gap:10px}
.gth-logo-mark{width:36px;height:36px;flex-shrink:0;border-radius:9px;background:linear-gradient(135deg,${C.blue},#0D2247);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:${C.gold};border:1.5px solid ${C.gold}}
.gth-logo-name{display:block;font-weight:800;font-size:15px;line-height:1.1}
.gth-logo-tag{display:block;font-size:10px;color:${C.gold}bb;font-weight:500}
.gth-nav-links{display:flex;align-items:center;gap:24px;font-size:13px;font-weight:500}
.gth-nav-links a:hover{color:${C.gold}}
.gth-nav-actions{display:flex;align-items:center;gap:10px}
.gth-lang{display:flex;background:rgba(255,255,255,0.06);border-radius:20px;padding:3px;border:1px solid ${C.border}}
.gth-lang a{padding:3px 10px;border-radius:16px;font-size:11px;font-weight:700;color:${C.textMuted}}
.gth-lang a.on{background:${C.blue};color:${C.white}}
.gth-link-muted{font-size:13px;color:${C.textMuted}}
.gth-link-muted:hover{color:${C.white}}
.gth-btn{display:inline-block;border-radius:8px;font-weight:700;cursor:pointer;transition:opacity .15s}
.gth-btn:hover{opacity:.9}
.gth-btn-gold{font-size:12px;color:${C.bg};background:linear-gradient(135deg,${C.gold},#F9D96A);padding:8px 18px}
.gth-btn-primary{padding:15px 28px;font-size:14px;background:linear-gradient(135deg,${C.blue},#0D2247);color:${C.white};border:none}
.gth-btn-ghost{padding:15px 26px;font-size:14px;background:transparent;color:${C.blueBright};border:1.5px solid rgba(59,130,246,0.4)}
.gth-btn-gold-outline{color:${C.gold};border-color:${C.borderGold}}

.gth-eyebrow{font-size:11px;font-weight:800;color:${C.gold};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}

.gth-hero{max-width:1200px;margin:0 auto;padding:64px 48px 52px;display:grid;grid-template-columns:62fr 38fr;gap:52px;align-items:center}
.gth-h1{font-size:clamp(30px,4vw,52px);font-weight:800;line-height:1.08;margin-bottom:18px}
.gth-hero-sub{font-size:18px;color:${C.white};font-weight:600;line-height:1.55;margin-bottom:14px}
.gth-hero-support{font-size:14px;color:${C.textSec};line-height:1.7;margin-bottom:16px}
.gth-signature{font-size:12px;color:${C.gold}99;font-weight:600;font-style:italic;letter-spacing:.5px;margin-bottom:28px}
.gth-hero-ctas{display:flex;gap:12px;flex-wrap:wrap}
.gth-microcopy{font-size:12px;color:${C.textMuted};margin-top:14px}
.gth-hero-img{display:flex;align-items:center;justify-content:center}
.gth-hero-img img{width:100%;max-width:520px;height:auto;mix-blend-mode:screen;filter:drop-shadow(0 0 24px rgba(37,99,235,0.4)) brightness(1.05)}

.gth-steps{max-width:1200px;margin:0 auto;padding:0 48px 8px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.gth-step{background:${C.bgCard};border:1px solid ${C.border};border-radius:12px;padding:18px 16px}
.gth-step-num{font-size:10px;font-weight:800;color:${C.gold};letter-spacing:1.5px}
.gth-step p{font-size:12px;color:${C.textSec};font-weight:600;line-height:1.4;margin-top:6px}

.gth-section{padding:72px 48px;border-bottom:1px solid ${C.border}}
.gth-alt{background:linear-gradient(135deg,rgba(37,99,235,0.06),rgba(6,40,99,0.9))}
.gth-narrow{max-width:820px;margin:0 auto}
.gth-wide{max-width:1160px;margin:0 auto}
.gth-section h2{font-size:clamp(22px,3vw,32px);font-weight:800;margin-bottom:18px}
.gth-section p{font-size:16px;color:${C.textSec};line-height:1.8;margin-bottom:14px}
.gth-lead{max-width:720px}
.gth-why h2{font-size:clamp(22px,3vw,30px)}
.gth-why-key{color:${C.white};font-weight:600;border-left:3px solid ${C.borderGold};padding-left:16px;margin-top:8px}

.gth-qgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:32px 0 20px}
.gth-qcard{background:${C.bgCard};border:1px solid ${C.border};border-radius:12px;padding:22px}
.gth-qcard h3{font-size:15px;font-weight:700;color:${C.white};margin-bottom:10px;line-height:1.35}
.gth-qcard p{font-size:13px;line-height:1.7;margin:0}
.gth-note{font-size:12px;color:${C.textMuted};line-height:1.7;font-style:italic;max-width:820px;margin-top:8px}

.gth-product h2{font-size:clamp(20px,2.6vw,28px)}
.gth-product p{color:${C.white}}

.gth-modgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:32px 0 24px}
.gth-modcard{background:${C.bgCard};border:1px solid ${C.border};border-radius:16px;padding:26px 22px;display:flex;flex-direction:column;gap:10px;transition:transform .15s}
.gth-modcard:hover{transform:translateY(-3px)}
.gth-mod-q{font-size:13px;font-weight:700}
.gth-modcard h3{font-size:15px;font-weight:700;color:${C.white};line-height:1.35}
.gth-mod-copy{font-size:13px;color:${C.textSec};line-height:1.7;margin:0}
.gth-tags{display:flex;flex-wrap:wrap;gap:6px}
.gth-tags span{font-size:10px;border:1px solid;border-radius:20px;padding:3px 10px;font-weight:600}
.gth-mod-open{font-size:12px;font-weight:700;margin-top:auto;padding-top:6px}
.gth-center{text-align:center;margin-top:20px}

.gth-aud-primary{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:28px 0 16px}
.gth-aud-secondary{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}
.gth-aud-card{background:${C.bgCard};border:1px solid ${C.border};border-radius:14px;padding:20px 22px}
.gth-aud-card h3{font-size:14px;font-weight:700;color:${C.white};margin-bottom:6px}
.gth-aud-card p{font-size:13px;line-height:1.6;margin:0}
.gth-aud-card--primary{border-color:${C.borderGold};background:linear-gradient(135deg,rgba(244,197,66,0.08),${C.bgCard})}
.gth-aud-card--primary h3{font-size:17px;color:${C.gold}}
.gth-aud-card--primary p{font-size:14px;color:${C.textSec}}
.gth-aud-sub{font-size:12px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1px;margin:24px 0 4px}

.gth-src-title{font-size:12px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1px;margin:28px 0 4px}
.gth-srcgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:16px}
.gth-srccard{background:${C.bgCard};border:1px solid ${C.border};border-radius:12px;padding:18px 20px}
.gth-srccard h3{font-size:13px;font-weight:700;color:${C.white};margin:8px 0 6px}
.gth-srccard p{font-size:12px;line-height:1.6;margin:0}
.gth-srccard--ai{border-color:rgba(167,139,250,0.35)}
.gth-badge{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.8px;padding:3px 8px;border-radius:6px}
.gth-badge-src{background:rgba(34,197,94,0.14);color:#4ade80;border:1px solid rgba(34,197,94,0.3)}
.gth-badge-ai{background:rgba(167,139,250,0.14);color:#c4b5fd;border:1px solid rgba(167,139,250,0.3)}

.gth-mission-lead{font-size:19px;font-weight:700;color:${C.gold};line-height:1.45;margin-bottom:18px}

.gth-lib{text-align:center}
.gth-lib h2{margin-bottom:12px}
.gth-lib .gth-btn{margin-top:12px}

.gth-final{text-align:center}
.gth-final h2{margin-bottom:12px}
.gth-final .gth-btn{margin-top:10px}

.gth-closing{text-align:center;border-bottom:none}
.gth-closing p{font-size:clamp(18px,2.5vw,26px);font-weight:700;color:${C.textSec};line-height:1.6;max-width:720px;margin:0 auto}
.gth-closing strong{color:${C.white}}

.gth-footer{padding:32px 48px 40px;border-top:1px solid rgba(255,255,255,0.08)}
.gth-footer-top{max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px}
.gth-footer-links{display:flex;gap:22px;flex-wrap:wrap;font-size:12px;color:${C.textMuted}}
.gth-footer-links a:hover{color:${C.white}}
.gth-footer-copy{max-width:1160px;margin:20px auto 6px;font-size:11px;color:rgba(255,255,255,0.4)}
.gth-footer-disclaimer{max-width:1160px;margin:0 auto;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6}

@media (max-width:1024px){
  .gth-nav{padding:14px 24px}
  .gth-section{padding:56px 24px}
  .gth-hero{padding:48px 24px 40px}
}
@media (max-width:860px){
  .gth-nav-links{display:none}
  .gth-hero{grid-template-columns:1fr;gap:28px}
  .gth-hero-img{order:-1}
  .gth-hero-img img{max-width:360px}
  .gth-steps{grid-template-columns:1fr 1fr;padding:0 24px 8px}
  .gth-aud-primary{grid-template-columns:1fr}
  .gth-footer-top{flex-direction:column;align-items:flex-start}
}
@media (max-width:520px){
  .gth-nav{padding:12px 16px}
  .gth-section{padding:44px 16px}
  .gth-hero{padding:36px 16px 32px}
  .gth-steps{grid-template-columns:1fr}
  .gth-hero-ctas{flex-direction:column}
  .gth-hero-ctas .gth-btn{text-align:center}
}
@media (max-width:400px){
  .gth-eyebrow{letter-spacing:1px;line-height:1.4}
}
`;
