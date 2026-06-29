"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  bg:        "#07152F",
  bgCard:    "#0B1E3D",
  bgCardHover:"#0D2247",
  blue:      "#2563EB",
  blueBright:"#3B82F6",
  gold:      "#F4C542",
  white:     "#FFFFFF",
  textSec:   "#B8C4D9",
  textMuted: "rgba(184,196,217,0.5)",
  border:    "rgba(59,130,246,0.25)",
  borderGold:"rgba(244,197,66,0.35)",
};

const T = {
  es: {
    nav_tagline: "Comercio internacional ágil",
    nav_login:   "Iniciar sesión",
    nav_cta:     "Registrarse →",
    eyebrow:     "PRÓXIMAMENTE",
    h1a:         "Inteligencia comercial global",
    h1b:         "potenciada por inteligencia artificial.",
    sub:         "Entendé cualquier producto. Analizá cualquier mercado. Calculá cada decisión de importación o exportación.",
    sub2:        "Desde la clasificación arancelaria hasta los acuerdos comerciales, Global Tariff Hub transforma la complejidad del comercio internacional en inteligencia de negocios.",
    tagline:     "From Product to Trade Intelligence™",
    flow: [
      { step:"01", icon:"📷", label:"Sacá una foto del producto" },
      { step:"02", icon:"🤖", label:"La IA lo clasifica y arancela" },
      { step:"03", icon:"📊", label:"Analizá costos, acuerdos y requisitos" },
      { step:"04", icon:"✅", label:"Decidí con información real" },
    ],
    mission_title:  "Nuestra misión",
    mission_tag:    "Por qué existimos",
    mission_p1:     "Hacer accesible el comercio internacional mediante inteligencia artificial.",
    mission_p2:     "Creemos que el conocimiento necesario para importar y exportar debería estar al alcance de cualquier empresa, sin importar su tamaño o experiencia.",
    mission_p3:     "Global Tariff Hub transforma regulaciones complejas, clasificación arancelaria, reglas de origen y normativa aduanera en información clara, precisa y accionable.",
    mission_p4:     "Ayudamos a emprendedores, pymes y empresas a evaluar operaciones internacionales en minutos, comprender costos, tratados comerciales y riesgos, y tomar mejores decisiones con confianza.",
    mission_close:  "Transformamos la complejidad del comercio global en inteligencia accesible para todos.",
    vision_title:  "Nuestra visión",
    vision_tag:    "Hacia dónde vamos",
    vision_p1:     "Imaginamos un mundo donde cualquier empresa pueda vender o comprar en cualquier país con la misma facilidad con la que hoy busca información en Internet.",
    vision_p2:     "Aspiramos a construir la plataforma de inteligencia comercial más completa del mundo para operaciones internacionales.",
    problem_title: "¿Cómo funciona Global Tariff Hub?",
    problem_sub:   "Las startups, pymes y empresas medianas que quieren crecer no pueden pagar agentes de comercio exterior ni despachantes de aduana. Pero igual necesitan responder:",
    problems: [
      "¿Puedo importar este producto?",
      "¿Puedo exportarlo?",
      "¿Qué impuestos tendría?",
      "¿Necesito certificados?",
      "¿Existen restricciones?",
      "¿Cuál sería el costo total?",
      "¿Hay beneficios arancelarios disponibles?",
    ],
    problem_answer: "Cualquier organización puede explorar las oportunidades del comercio exterior — subiendo una foto y obteniendo un arancel orientativo al instante. Esa es la magia.",
    modules_title: "Cuatro módulos. Una sola plataforma.",
    modules: [
      { icon:"📷", color:C.blueBright, colorBg:"rgba(59,130,246,0.12)", colorBorder:"rgba(59,130,246,0.3)",
        title:"Clasificación Arancelaria de Productos con IA",
        question:"¿Qué impuestos paga este producto?",
        desc:"Sacá una foto o describí el producto. La IA te dice qué impuestos aplican, qué documentos necesitás y si hay algún beneficio que te permita pagar menos — sin necesitar saber nada de aduanas.",
        tags:["HS Code","NCM Mercosur","TARIC Europa","Acuerdos Comerciales"] },
      { icon:"📄", color:C.gold, colorBg:"rgba(244,197,66,0.10)", colorBorder:"rgba(244,197,66,0.3)",
        title:"Simulador con Certificado de Origen",
        question:"¿Podés pagar menos impuestos?",
        desc:"Entre muchos países existen acuerdos comerciales que reducen o eliminan los impuestos de importación. Te mostramos si tu operación califica, cuánto ahorrás en dólares y cómo tramitar el certificado que lo habilita.",
        tags:["MERCOSUR","TLC","SGP","Ahorro arancelario"] },
      { icon:"🧮", color:"#22c55e", colorBg:"rgba(34,197,94,0.10)", colorBorder:"rgba(34,197,94,0.3)",
        title:"Calculadora CIF",
        question:"¿Cuánto cuesta realmente traerlo?",
        desc:"El precio del proveedor es solo el comienzo. Calculá el costo total de traer el producto hasta tu depósito: flete, seguro, impuestos y todos los gastos intermedios. Ingresás el precio y el destino — obtenés el número final.",
        tags:["Incoterms","CIF","FOB","Costo nacionalizado"] },
      { icon:"🛡", color:"#a78bfa", colorBg:"rgba(167,139,250,0.10)", colorBorder:"rgba(167,139,250,0.3)",
        title:"Viabilidad de Importación",
        question:"¿Conviene el negocio?",
        desc:"Ingresás el precio del proveedor, la cantidad y el destino. La plataforma te dice el costo final, el precio mínimo de venta para no perder plata, y si hay restricciones o permisos especiales que necesitás gestionar.",
        tags:["Restricciones","Organismos","Precio sugerido","ROI"] },
    ],
    audience_title: "Diseñado para",
    audience: [
      { icon:"🚀", label:"Startups",                desc:"Validá si tu producto tiene viabilidad arancelaria antes de invertir." },
      { icon:"🏭", label:"Pymes",                   desc:"Tomá decisiones de importación y exportación sin depender de terceros." },
      { icon:"📈", label:"Empresas medianas",       desc:"Escalá tu operación de comercio exterior con inteligencia integrada." },
      { icon:"🛒", label:"Equipos de compras",      desc:"Evaluá la viabilidad arancelaria en segundos, antes de negociar." },
      { icon:"🌎", label:"Equipos de comercio exterior", desc:"Accedé a acuerdos, aranceles y documentación desde una sola plataforma." },
      { icon:"🤝", label:"Consultores y despachantes", desc:"Acelerá los análisis iniciales y ofrecé más valor a tus clientes." },
    ],
    cta_title:   "Registrate y reservá tu lugar",
    cta_sub:     "Al lanzar recibís 3 consultas gratis · Sin tarjeta de crédito · Sin compromiso",
    cta_btn:     "Crear cuenta →",
    login_msg:   "El acceso a la plataforma estará disponible próximamente.",
    sources_title:"Fuentes de referencia utilizadas",
    sources: [
      { icon:"🌐", name:"World Trade Organization", desc:"Aranceles MFN por código HS — 164 países miembro" },
      { icon:"📦", name:"MERCOSUR NCM",              desc:"Nomenclatura arancelaria oficial de referencia" },
      { icon:"🛡️", name:"European Union TARIC",      desc:"Base arancelaria de la Unión Europea" },
      { icon:"✦",  name:"AI Classification Engine",  desc:"Clasificación asistida por inteligencia artificial" },
    ],
    disclaimer: "GTH proporciona herramientas de apoyo para análisis de comercio internacional. La clasificación arancelaria definitiva y los requisitos regulatorios deben ser verificados por profesionales competentes. Los resultados generados por IA son orientativos y no constituyen asesoramiento legal, tributario ni aduanero.",
    footer_copy: "© 2025 Global Tariff Hub. Todos los derechos reservados.",
  },
  en: {
    nav_tagline: "Agile international trade",
    nav_login:   "Sign in",
    nav_cta:     "Register →",
    eyebrow:     "COMING SOON",
    h1a:         "AI-Powered Global",
    h1b:         "Trade Intelligence.",
    sub:         "Understand any product. Analyze any market. Calculate every import or export decision.",
    sub2:        "From tariff classification to trade agreements, Global Tariff Hub transforms international trade complexity into business intelligence.",
    tagline:     "From Product to Trade Intelligence™",
    flow: [
      { step:"01", icon:"📷", label:"Take a photo of the product" },
      { step:"02", icon:"🤖", label:"AI classifies and rates it" },
      { step:"03", icon:"📊", label:"Analyze costs, agreements & docs" },
      { step:"04", icon:"✅", label:"Decide with real information" },
    ],
    mission_title:  "Our mission",
    mission_tag:    "Why we exist",
    mission_p1:     "Making international trade accessible through artificial intelligence.",
    mission_p2:     "We believe the knowledge needed to import and export should be within reach of any company, regardless of size or experience.",
    mission_p3:     "Global Tariff Hub transforms complex regulations, tariff classification, rules of origin and customs rules into clear, precise and actionable information.",
    mission_p4:     "We help entrepreneurs, SMEs and companies evaluate international operations in minutes, understand costs, trade agreements and risks, and make better decisions with confidence.",
    mission_close:  "We transform the complexity of global trade into intelligence accessible to everyone.",
    vision_title:  "Our vision",
    vision_tag:    "Where we're headed",
    vision_p1:     "We imagine a world where any company can buy or sell in any country as easily as searching for information on the Internet today.",
    vision_p2:     "We aspire to build the world's most complete commercial intelligence platform for international operations.",
    problem_title: "How does Global Tariff Hub work?",
    problem_sub:   "Startups, SMEs and growing companies can't afford customs agents or trade consultants. But they still need to answer:",
    problems: [
      "Can I import this product?",
      "Can I export it?",
      "What taxes would apply?",
      "Do I need certificates?",
      "Are there any restrictions?",
      "What would the total cost be?",
      "Are there any tariff benefits available?",
    ],
    problem_answer: "Any organization can explore international trade opportunities — by uploading a photo and getting an indicative tariff rate instantly. That's the magic.",
    modules_title: "Four modules. One platform.",
    modules: [
      { icon:"📷", color:C.blueBright, colorBg:"rgba(59,130,246,0.12)", colorBorder:"rgba(59,130,246,0.3)",
        title:"Intelligent Product Classification",
        question:"What taxes does this product pay?",
        desc:"Take a photo or describe the product. AI tells you what taxes apply, what documents you need and whether any trade agreement lets you pay less — no customs knowledge required.",
        tags:["HS Code","NCM Mercosur","TARIC Europe","Trade Agreements"] },
      { icon:"📄", color:C.gold, colorBg:"rgba(244,197,66,0.10)", colorBorder:"rgba(244,197,66,0.3)",
        title:"Certificate of Origin Simulator",
        question:"Can you pay less in taxes?",
        desc:"Many countries have trade agreements that reduce or eliminate import taxes. We show you if your shipment qualifies, how much you save in dollars, and how to get the certificate that unlocks it.",
        tags:["MERCOSUR","FTA","GSP","Tariff savings"] },
      { icon:"🧮", color:"#22c55e", colorBg:"rgba(34,197,94,0.10)", colorBorder:"rgba(34,197,94,0.3)",
        title:"CIF Calculator",
        question:"What does it really cost to bring it in?",
        desc:"The supplier price is just the start. Calculate the full cost of getting the product to your warehouse: freight, insurance, taxes and all fees in between. Enter the price and destination — get the real number.",
        tags:["Incoterms","CIF","FOB","Landed cost"] },
      { icon:"🛡", color:"#a78bfa", colorBg:"rgba(167,139,250,0.10)", colorBorder:"rgba(167,139,250,0.3)",
        title:"Import Viability",
        question:"Is the business worth it?",
        desc:"Enter the supplier price, quantity and destination. The platform tells you the final cost, the minimum selling price to break even, and whether there are special permits or restrictions you need to handle.",
        tags:["Restrictions","Agencies","Suggested price","ROI"] },
    ],
    audience_title: "Designed for",
    audience: [
      { icon:"🚀", label:"Startups",           desc:"Validate tariff viability before investing in your product." },
      { icon:"🏭", label:"SMEs",               desc:"Make import/export decisions without relying on third parties." },
      { icon:"📈", label:"Mid-size companies", desc:"Scale your trade operations with integrated intelligence." },
      { icon:"🛒", label:"Purchasing teams",   desc:"Evaluate tariff viability in seconds, before negotiating." },
      { icon:"🌎", label:"Trade teams",        desc:"Access agreements, tariffs and documents from one platform." },
      { icon:"🤝", label:"Consultants & agents", desc:"Speed up initial analysis and deliver more value to clients." },
    ],
    cta_title:   "Register and reserve your spot",
    cta_sub:     "At launch you get 3 free consultations · No credit card · No commitment",
    cta_btn:     "Create account →",
    login_msg:   "Platform access will be available soon.",
    sources_title:"Reference sources used",
    sources: [
      { icon:"🌐", name:"World Trade Organization", desc:"Official tariff schedules and trade data" },
      { icon:"📦", name:"MERCOSUR NCM",              desc:"Official tariff nomenclature" },
      { icon:"🛡️", name:"European Union TARIC",      desc:"EU customs tariff database" },
      { icon:"✦",  name:"AI Classification Engine",  desc:"AI-assisted product classification" },
    ],
    disclaimer: "GTH provides support tools for international trade analysis. Definitive tariff classification and regulatory requirements must be verified by qualified professionals. AI-generated results are indicative and do not constitute legal, tax or customs advice.",
    footer_copy: "© 2025 Global Tariff Hub. All rights reserved.",
  },
};

/* ─── Hero illustration ─────────────────────────────── */
function GlobeIllustration() {
  return (
    <svg viewBox="0 0 420 460" style={{ width:"100%", maxWidth:420, filter:"drop-shadow(0 0 40px rgba(37,99,235,0.25))" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="globeGrad" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#0B1E3D" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#07152F" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
        </radialGradient>
        <clipPath id="globeClip"><circle cx="200" cy="175" r="145"/></clipPath>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="200" cy="175" r="175" fill="url(#globeGlow)"/>
      <circle cx="200" cy="175" r="145" fill="url(#globeGrad)" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.4"/>
      <g clipPath="url(#globeClip)" stroke="#3B82F6" strokeWidth="0.7" strokeOpacity="0.35" fill="none">
        <ellipse cx="200" cy="175" rx="145" ry="22"/>
        <ellipse cx="200" cy="175" rx="145" ry="55"/>
        <ellipse cx="200" cy="175" rx="145" ry="95"/>
        <ellipse cx="200" cy="175" rx="145" ry="130"/>
        <ellipse cx="200" cy="175" rx="145" ry="143"/>
        <ellipse cx="200" cy="175" rx="30"  ry="145"/>
        <ellipse cx="200" cy="175" rx="72"  ry="145"/>
        <ellipse cx="200" cy="175" rx="115" ry="145"/>
        <ellipse cx="200" cy="175" rx="140" ry="145"/>
        <line x1="55" y1="175" x2="345" y2="175" strokeOpacity="0.5" strokeWidth="1"/>
        <line x1="200" y1="30" x2="200" y2="320" strokeOpacity="0.5" strokeWidth="1"/>
      </g>
      <g filter="url(#glow)">
        <circle cx="155" cy="145" r="4" fill="#F4C542" opacity="0.9"/>
        <circle cx="255" cy="160" r="3" fill="#3B82F6" opacity="0.9"/>
        <circle cx="180" cy="205" r="3.5" fill="#F4C542" opacity="0.8"/>
        <circle cx="240" cy="195" r="3" fill="#22c55e" opacity="0.9"/>
        <circle cx="140" cy="190" r="2.5" fill="#3B82F6" opacity="0.7"/>
        <circle cx="265" cy="135" r="2.5" fill="#22c55e" opacity="0.7"/>
      </g>
      <g stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3,3" fill="none">
        <line x1="155" y1="145" x2="255" y2="160"/>
        <line x1="255" y1="160" x2="240" y2="195"/>
        <line x1="155" y1="145" x2="180" y2="205"/>
      </g>
      {/* Flecha azul */}
      <path d="M 290 70 Q 370 120 350 210" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <polygon points="345,222 355,202 362,216" fill="#3B82F6" opacity="0.8"/>
      {/* Flecha dorada */}
      <path d="M 110 290 Q 50 230 80 140" stroke="#F4C542" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <polygon points="76,128 72,148 87,142" fill="#F4C542" opacity="0.8"/>
      {/* Contenedor azul 3D */}
      <g transform="translate(268,285)">
        <rect x="0" y="18" width="90" height="58" rx="3" fill="#1d4ed8" stroke="#3B82F6" strokeWidth="1"/>
        <polygon points="0,18 18,4 108,4 90,18" fill="#2563EB" stroke="#3B82F6" strokeWidth="1"/>
        <polygon points="90,18 108,4 108,62 90,76" fill="#1e40af" stroke="#3B82F6" strokeWidth="1"/>
        <line x1="30" y1="18" x2="30" y2="76" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="60" y1="18" x2="60" y2="76" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="0" y1="38" x2="90" y2="38" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="0" y1="58" x2="90" y2="58" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.5"/>
        <polygon points="0,18 18,4 108,4 90,18" fill="white" fillOpacity="0.06"/>
      </g>
      {/* Caja marrón 3D */}
      <g transform="translate(58,318)">
        <rect x="0" y="14" width="68" height="46" rx="2" fill="#92400e" stroke="#B45309" strokeWidth="1"/>
        <polygon points="0,14 14,2 82,2 68,14" fill="#B45309" stroke="#D97706" strokeWidth="1"/>
        <polygon points="68,14 82,2 82,48 68,60" fill="#78350f" stroke="#B45309" strokeWidth="1"/>
        <line x1="34" y1="14" x2="34" y2="60" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.7"/>
        <line x1="0" y1="37" x2="68" y2="37" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.7"/>
      </g>
      {[[30,55],[380,85],[50,270],[390,290],[20,175],[400,175],[200,15],[310,35]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity={0.15+i*0.04}/>
      ))}
    </svg>
  );
}

export default function HomePage({ defaultLang = "es" }: { defaultLang?: "es"|"en" }) {
  const [lang, setLang]   = useState<"es"|"en">(defaultLang as "es"|"en");
  const [mounted, setMounted]     = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [loginHover, setLoginHover] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalDone, setModalDone]   = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);
  if (!mounted) return null;
  const t = T[lang];
  const px = isMobile ? "20px" : "48px"; // padding lateral global

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: modalEmail, lang }),
      });
    } catch {}
    setModalDone(true);
  };

  return (
    <div style={{ backgroundColor:C.bg, minHeight:"100vh", color:C.white, fontFamily:"var(--font-inter),'Helvetica Neue',Arial,sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────── */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:`14px ${px}`, borderBottom:`1px solid ${C.border}`, background:"rgba(7,21,47,0.97)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(16px)" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, flexShrink:0, borderRadius:9, background:`linear-gradient(135deg,${C.blue},#0D2247)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:C.gold, border:`1.5px solid ${C.gold}` }}>GTH</div>
          <div>
            <p style={{ fontWeight:800, fontSize:isMobile?13:15, color:C.white, lineHeight:1.1, letterSpacing:-0.2 }}>Global Tariff Hub</p>
            {!isMobile && <p style={{ fontSize:10, color:`${C.gold}BB`, fontWeight:500 }}>{t.nav_tagline}</p>}
          </div>
        </div>

        {/* Links — ocultos en mobile */}
        {!isMobile && (
          <div style={{ display:"flex", alignItems:"center", gap:28 }}>
            {[["#flujo","Cómo funciona"],["#modulos","Módulos"],["#para-quien","Para quién"],["#fuentes","Datos"],].map(([href,label])=>(
              <a key={href} href={href} style={{ color:C.textSec, textDecoration:"none", fontSize:13, fontWeight:500 }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.white)}
                onMouseLeave={e=>(e.currentTarget.style.color=C.textSec)}>{label}</a>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:20, padding:3, border:`1px solid ${C.border}` }}>
            {(["es","en"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{ padding:"3px 10px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:lang===l?C.blue:"transparent", color:lang===l?C.white:C.textMuted }}>{l.toUpperCase()}</button>
            ))}
          </div>

          {/* Login deshabilitado — oculto en mobile */}
          {!isMobile && (
            <div style={{ position:"relative" }}
              onMouseEnter={()=>setLoginHover(true)}
              onMouseLeave={()=>setLoginHover(false)}>
              <button style={{ fontSize:13, color:"rgba(184,196,217,0.3)", fontWeight:500, border:`1px solid rgba(59,130,246,0.1)`, borderRadius:8, padding:"7px 16px", background:"transparent", cursor:"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
                🔒 {t.nav_login}
              </button>
              {loginHover && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", whiteSpace:"nowrap", fontSize:12, color:C.textSec, zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                  🔒 {t.login_msg}
                </div>
              )}
            </div>
          )}

          <Link href="/register" style={{ fontSize:12, fontWeight:700, color:C.bg, background:`linear-gradient(135deg,${C.gold},#F9D96A)`, border:"none", borderRadius:8, padding:isMobile?"7px 14px":"8px 20px", textDecoration:"none" }}>
            {isMobile ? (lang==="es"?"Registrarse":"Register") : t.nav_cta}
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"48px 20px 40px":`68px ${px} 56px`, display:"grid", gridTemplateColumns:isMobile?"1fr":"65fr 35fr", gap:isMobile?32:56, alignItems:"center" }}>
        <div>
          {/* Eyebrow — botón clickeable que abre popup */}
          <button
            onClick={() => setShowModal(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(0,0,0,0.3)", border:`1px solid ${C.borderGold}`, borderRadius:20, padding:"6px 18px", marginBottom:24, cursor:"pointer", transition:"background 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(244,197,66,0.1)")}
            onMouseLeave={e=>(e.currentTarget.style.background="rgba(0,0,0,0.3)")}
          >
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 8px #22c55e" }}/>
            <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{t.eyebrow}</span>
            <span style={{ fontSize:11, color:C.textMuted, marginLeft:2 }}>→</span>
          </button>

          <h1 style={{ fontSize:"clamp(40px,5vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:-2, marginBottom:16 }}>
            <span style={{ color:C.white }}>{t.h1a}</span><br/>
            <span style={{ color:C.gold }}>{t.h1b}</span>
          </h1>
          <p style={{ fontSize:18, color:C.white, fontWeight:600, marginBottom:8, lineHeight:1.5 }}>{t.sub}</p>
          <p style={{ fontSize:14, color:C.textSec, marginBottom:32, lineHeight:1.7 }}>{(t as any).sub2}</p>
          <p style={{ fontSize:12, color:`${C.gold}99`, fontWeight:600, marginBottom:40, letterSpacing:0.5, fontStyle:"italic" }}>{t.tagline}</p>

          {/* Flujo 4 pasos */}
          <div id="flujo" style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:8, marginBottom:36 }}>
            {t.flow.map((f,i)=>(
              <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 12px", textAlign:"center", position:"relative" }}>
                {i < t.flow.length-1 && (
                  <div style={{ position:"absolute", right:-10, top:"50%", transform:"translateY(-50%)", color:C.gold, fontSize:14, fontWeight:800, zIndex:1 }}>›</div>
                )}
                <p style={{ fontSize:20, marginBottom:6 }}>{f.icon}</p>
                <p style={{ fontSize:9, fontWeight:800, color:C.gold, letterSpacing:1.5, marginBottom:4 }}>{f.step}</p>
                <p style={{ fontSize:11, color:C.textSec, fontWeight:600, lineHeight:1.3 }}>{f.label}</p>
              </div>
            ))}
          </div>

          {/* CTA hero — solo ver módulos */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <a href="#modulos" style={{ padding:"15px 28px", borderRadius:10, border:`1.5px solid rgba(59,130,246,0.4)`, background:"transparent", color:C.blueBright, fontSize:14, fontWeight:600, cursor:"pointer", textDecoration:"none" }}>
              {lang==="es"?"Ver módulos ↓":"See modules ↓"}
            </a>
            <a href="#para-quien" style={{ padding:"15px 28px", borderRadius:10, border:`1.5px solid rgba(244,197,66,0.3)`, background:"transparent", color:C.gold, fontSize:14, fontWeight:600, cursor:"pointer", textDecoration:"none" }}>
              {lang==="es"?"¿Para quién? ↓":"For who? ↓"}
            </a>
          </div>
        </div>

        {/* Columna derecha — imagen real sin fondo */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img
            src="/hero-globe.png"
            alt="Global trade intelligence — contenedor, globo digital y rutas comerciales"
            style={{ width:"100%", maxWidth:560, mixBlendMode:"screen", filter:"drop-shadow(0 0 24px rgba(37,99,235,0.4)) brightness(1.05)" }}
          />
        </div>
      </section>

      {/* ── Misión ─────────────────────────────────── */}
      <section style={{ padding:isMobile?`48px ${px}`:`72px ${px}`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:820, margin:"0 auto", textAlign:"center" }}>
          <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{t.mission_tag}</span>
          <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:800, marginTop:12, marginBottom:28, letterSpacing:-0.5 }}>{t.mission_title}</h2>
          <p style={{ fontSize:20, fontWeight:700, color:C.gold, marginBottom:24, lineHeight:1.4 }}>{t.mission_p1}</p>
          <p style={{ fontSize:16, color:C.textSec, marginBottom:16, lineHeight:1.8 }}>{t.mission_p2}</p>
          <p style={{ fontSize:16, color:C.textSec, marginBottom:16, lineHeight:1.8 }}>{t.mission_p3}</p>
          <p style={{ fontSize:16, color:C.textSec, marginBottom:32, lineHeight:1.8 }}>{t.mission_p4}</p>
          <div style={{ background:`linear-gradient(135deg,rgba(244,197,66,0.1),rgba(244,197,66,0.04))`, border:`1px solid ${C.borderGold}`, borderRadius:14, padding:"24px 32px" }}>
            <p style={{ fontSize:17, fontWeight:700, color:C.white, lineHeight:1.6 }}>{t.mission_close}</p>
          </div>
        </div>
      </section>

      {/* ── Visión ─────────────────────────────────── */}
      <section style={{ padding:isMobile?`48px ${px}`:`72px ${px}`, borderBottom:`1px solid ${C.border}`, background:`linear-gradient(135deg,rgba(37,99,235,0.05),rgba(7,21,47,0.8))` }}>
        <div style={{ maxWidth:820, margin:"0 auto", textAlign:"center" }}>
          <span style={{ fontSize:11, fontWeight:800, color:C.blueBright, letterSpacing:2.5, textTransform:"uppercase" }}>{t.vision_tag}</span>
          <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:800, marginTop:12, marginBottom:28, letterSpacing:-0.5 }}>{t.vision_title}</h2>
          <p style={{ fontSize:18, color:C.white, fontWeight:500, marginBottom:20, lineHeight:1.8 }}>{(t as any).vision_p1}</p>
          <p style={{ fontSize:16, color:C.textSec, lineHeight:1.8 }}>{(t as any).vision_p2}</p>
        </div>
      </section>

      {/* ── El problema que resolvemos ─────────────── */}
      <section style={{ background:`linear-gradient(135deg,rgba(37,99,235,0.06),rgba(11,30,61,0.8))`, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:isMobile?`48px ${px}`:`72px ${px}` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{lang === "es" ? "Cómo funciona" : "How it works"}</span>
            <h2 style={{ fontSize:"clamp(24px,3vw,36px)", fontWeight:800, marginTop:12, marginBottom:16, letterSpacing:-0.5 }}>{t.problem_title}</h2>
            <p style={{ fontSize:16, color:C.textSec, maxWidth:580, margin:"0 auto", lineHeight:1.7 }}>{t.problem_sub}</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12, marginBottom:40 }}>
            {t.problems.map((q,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`rgba(37,99,235,0.15)`, border:`1px solid ${C.blue}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:11, color:C.blueBright, fontWeight:800 }}>?</span>
                </div>
                <p style={{ fontSize:14, color:C.white, fontWeight:500 }}>{q}</p>
              </div>
            ))}
          </div>

          <div style={{ background:`linear-gradient(135deg,rgba(244,197,66,0.1),rgba(244,197,66,0.05))`, border:`1px solid ${C.borderGold}`, borderRadius:16, padding:"28px 36px", textAlign:"center" }}>
            <p style={{ fontSize:18, fontWeight:700, color:C.white, lineHeight:1.6 }}>
              <span style={{ color:C.gold }}>Global Tariff Hub</span> {t.problem_answer.replace("Global Tariff Hub ","")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Módulos ────────────────────────────────── */}
      <section id="modulos" style={{ padding:isMobile?`48px ${px}`:`72px ${px}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{lang==="es"?"Funcionalidades":"Features"}</span>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, marginTop:12, letterSpacing:-0.5 }}>{t.modules_title}</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
            {t.modules.map((m,i)=>(
              <div key={i} style={{ background:C.bgCard, border:`1px solid ${m.colorBorder}`, borderRadius:16, padding:"28px 24px", display:"flex", flexDirection:"column", gap:16, transition:"all 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.bgCardHover; e.currentTarget.style.boxShadow=`0 4px 32px ${m.color}22`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.bgCard; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ width:52, height:52, borderRadius:14, background:m.colorBg, border:`1.5px solid ${m.colorBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{m.icon}</div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:6, lineHeight:1.3 }}>{m.title}</h3>
                  {(m as any).question && (
                    <p style={{ fontSize:13, fontWeight:600, color:C.gold, marginBottom:8, lineHeight:1.4 }}>{(m as any).question}</p>
                  )}
                  <p style={{ fontSize:13, color:C.textSec, lineHeight:1.75, marginBottom:16 }}>{m.desc}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {m.tags.map((tag,j)=>(
                      <span key={j} style={{ fontSize:10, color:m.color, background:m.colorBg, border:`1px solid ${m.colorBorder}`, borderRadius:20, padding:"3px 10px", fontWeight:600 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diseñado para ──────────────────────────── */}
      <section id="para-quien" style={{ background:`linear-gradient(135deg,rgba(11,30,61,0.8),rgba(7,21,47,1))`, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:isMobile?`48px ${px}`:`72px ${px}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{lang==="es"?"Audiencia":"Audience"}</span>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, marginTop:12, letterSpacing:-0.5 }}>{t.audience_title}</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14 }}>
            {t.audience.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px 24px", transition:"border-color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=C.borderGold)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
                <span style={{ fontSize:28, flexShrink:0 }}>{a.icon}</span>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:6 }}>{a.label}</p>
                  <p style={{ fontSize:13, color:C.textSec, lineHeight:1.65 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fuentes ────────────────────────────────── */}
      <section id="fuentes" style={{ padding:isMobile?`40px ${px}`:`56px ${px}` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <p style={{ textAlign:"center", fontSize:11, color:C.textMuted, marginBottom:24, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>{t.sources_title}</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
            {t.sources.map((s,i)=>(
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:10, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 20px 18px" }}>
                <span style={{ fontSize:22, lineHeight:1 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)", marginBottom:4 }}>{s.name}</p>
                  <p style={{ fontSize:11, color:C.textMuted, lineHeight:1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop:24, fontSize:11, color:"rgba(255,255,255,0.25)", lineHeight:1.7, textAlign:"center", maxWidth:720, margin:"24px auto 0" }}>
            {lang === "es"
              ? "Global Tariff Hub combina bases de datos aduaneras oficiales con análisis asistido por inteligencia artificial. Las determinaciones arancelarias definitivas siempre deben verificarse ante la autoridad aduanera competente."
              : "Global Tariff Hub combines official customs databases with AI-assisted analysis. Final tariff determinations should always be verified against the competent customs authority."}
          </p>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────── */}
      <section style={{ maxWidth:720, margin:"0 auto 80px", padding:`0 ${px}` }}>
        <div style={{ background:`linear-gradient(135deg,rgba(37,99,235,0.14),${C.bgCard})`, border:`1px solid ${C.border}`, borderRadius:20, padding:"56px 48px", textAlign:"center" }}>
          <p style={{ fontSize:11, color:C.gold, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>From Product to Trade Intelligence™</p>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:12, letterSpacing:-0.5 }}>{t.cta_title}</h2>
          <p style={{ fontSize:14, color:C.textSec, marginBottom:36, maxWidth:400, margin:"0 auto 36px", lineHeight:1.7 }}>{t.cta_sub}</p>
          <Link href="/register" style={{ display:"inline-block", padding:"16px 40px", borderRadius:12, background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:16, fontWeight:800, textDecoration:"none", letterSpacing:0.1 }}>
            {t.cta_btn}
          </Link>
        </div>
      </section>

      {/* ── Cierre ─────────────────────────────────── */}
      <section style={{ padding:isMobile?`48px ${px}`:`64px ${px}`, borderTop:`1px solid ${C.border}`, textAlign:"center" }}>
        <p style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:700, color:C.textSec, lineHeight:1.6, maxWidth:700, margin:"0 auto" }}>
          {lang === "es"
            ? <>Nuestra misión no es calcular aranceles.<br/><span style={{ color:C.white }}>Nuestra misión es reducir la incertidumbre del comercio internacional.</span></>
            : <>Our mission is not to calculate tariffs.<br/><span style={{ color:C.white }}>Our mission is to reduce the uncertainty of international trade.</span></>}
        </p>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid rgba(255,255,255,0.06)`, padding:`32px ${px}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:7, background:`linear-gradient(135deg,${C.blue},#0D2247)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:C.gold, border:`1.5px solid ${C.gold}` }}>GTH</div>
            <div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", fontWeight:700 }}>Global Tariff Hub</p>
              <p style={{ fontSize:10, color:`${C.gold}55` }}>From Product to Trade Intelligence™</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[
              {href:"/register", label:lang==="es"?"Registrarse":"Register"},
              {href:"/pricing",  label:"Pricing"},
              {href:lang==="es"?"/privacidad":"/privacy", label:lang==="es"?"Privacidad":"Privacy"},
              {href:lang==="es"?"/terminos":"/terms", label:lang==="es"?"Términos":"Terms"},
              {href:"/legales",  label:lang==="es"?"Aviso Legal":"Legal Notice"},
            ].map(l=>(
              <Link key={l.href} href={l.href} style={{ fontSize:12, color:C.textMuted, textDecoration:"none", fontWeight:500 }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"20px auto 0", borderTop:`1px solid rgba(255,255,255,0.05)`, paddingTop:20 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginBottom:6 }}>{t.footer_copy}</p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.12)", lineHeight:1.6, maxWidth:900 }}>{t.disclaimer}</p>
        </div>
      </footer>
      {/* ── Modal email pre-lanzamiento ─────────────── */}
      {showModal && (
        <div
          onClick={() => { setShowModal(false); setModalDone(false); setModalEmail(""); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:20, padding:"44px 40px", maxWidth:460, width:"100%", position:"relative", boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Cerrar */}
            <button
              onClick={() => { setShowModal(false); setModalDone(false); setModalEmail(""); }}
              style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:"50%", width:32, height:32, cursor:"pointer", color:C.textSec, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}
            >×</button>

            {modalDone ? (
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:48, marginBottom:16 }}>✅</p>
                <h3 style={{ fontSize:22, fontWeight:800, marginBottom:10, color:C.white }}>
                  {lang==="es" ? "¡Listo, te anotamos!" : "You're on the list!"}
                </h3>
                <p style={{ fontSize:14, color:C.textSec, lineHeight:1.7, marginBottom:24 }}>
                  {lang==="es"
                    ? "Te avisamos por email cuando Global Tariff Hub abra al público. También tendrás acceso prioritario con 3 consultas gratis."
                    : "We'll email you when Global Tariff Hub opens to the public. You'll also get priority access with 3 free consultations."}
                </p>
                <button
                  onClick={() => { setShowModal(false); setModalDone(false); setModalEmail(""); }}
                  style={{ padding:"12px 28px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:14, fontWeight:800, cursor:"pointer" }}
                >
                  {lang==="es" ? "Cerrar" : "Close"}
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 10px #22c55e" }}/>
                  <span style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2, textTransform:"uppercase" }}>
                    {lang==="es" ? "Próximamente" : "Coming soon"}
                  </span>
                </div>

                <h3 style={{ fontSize:22, fontWeight:800, marginBottom:8, color:C.white, lineHeight:1.2 }}>
                  {lang==="es" ? "Anotate para acceso anticipado" : "Get early access"}
                </h3>
                <p style={{ fontSize:14, color:C.textSec, lineHeight:1.7, marginBottom:28 }}>
                  {lang==="es"
                    ? "Dejá tu email y te avisamos cuando lancemos. Vas a recibir acceso prioritario con 3 consultas gratis."
                    : "Leave your email and we'll notify you at launch. You'll get priority access with 3 free consultations."}
                </p>

                <form onSubmit={handleModalSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <input
                    type="email"
                    value={modalEmail}
                    onChange={e => setModalEmail(e.target.value)}
                    placeholder={lang==="es" ? "tu@email.com" : "your@email.com"}
                    required
                    autoFocus
                    style={{ padding:"14px 18px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.bg, color:C.white, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" }}
                    onFocus={e=>(e.currentTarget.style.borderColor=C.blueBright)}
                    onBlur={e=>(e.currentTarget.style.borderColor=C.border)}
                  />
                  <button
                    type="submit"
                    style={{ padding:"14px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:15, fontWeight:800, cursor:"pointer" }}
                  >
                    {lang==="es" ? "Avisame cuando lance →" : "Notify me at launch →"}
                  </button>
                </form>

                <p style={{ fontSize:11, color:C.textMuted, marginTop:14, textAlign:"center" }}>
                  {lang==="es" ? "Sin spam. Una sola notificación al lanzar." : "No spam. One email when we launch."}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
