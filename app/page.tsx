"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── Paleta V2 ─────────────────────────────────────── */
const C = {
  bg:       "#07152F",
  bgCard:   "#0B1E3D",
  bgCardHover: "#0D2247",
  blue:     "#2563EB",
  blueBright:"#3B82F6",
  gold:     "#F4C542",
  goldDark: "#D4A820",
  white:    "#FFFFFF",
  textSec:  "#B8C4D9",
  textMuted:"rgba(184,196,217,0.5)",
  border:   "rgba(59,130,246,0.25)",
  borderGold:"rgba(244,197,66,0.35)",
};

const FONT = "var(--font-inter),'Helvetica Neue',Arial,sans-serif";

/* ─── Contenido bilingüe ─────────────────────────────── */
const T = {
  es: {
    nav_tagline:  "Inteligencia para el Comercio Global",
    nav_links:    ["Características","Módulos","Fuentes de Datos","Precios","Nosotros","Recursos"],
    nav_login:    "Iniciar sesión",
    nav_cta:      "Probar ahora",
    eyebrow:      "INTELIGENCIA ARANCELARIA",
    h1a:          "Para Importadores",
    h1b:          "y Exportadores",
    sub:          "Decisiones más inteligentes. Comercio sin fronteras.",
    tagline:      "From Product to Trade Intelligence™",
    photo_title:  "Subí una foto de tu producto",
    photo_hl:     "foto",
    photo_desc:   "La IA analiza el producto y sugiere clasificaciones arancelarias para que tomes la decisión con información real.",
    checks:       ["HS Code Internacional","NCM Mercosur","TARIC Europa","Requisitos documentales","Impacto arancelario","Clasificaciones similares"],
    cta1:         "→  Comenzar análisis",
    cta2:         "▷  Ver cómo funciona",
    notify_ph:    "tu@email.com",
    notify_btn:   "Avisame cuando lance",
    notify_sub:   "Sin spam. Una sola notificación al lanzar.",
    notify_thanks:"¡Gracias! Te avisamos cuando lancemos.",
    offer_label:  "Oferta de lanzamiento",
    offer_detail: "Plan anual · 2 meses gratis",
    modules_title:"Todo lo que necesitás para tomar mejores decisiones",
    modules: [
      { icon:"📷", color:C.blueBright, colorBg:"rgba(59,130,246,0.12)", colorBorder:"rgba(59,130,246,0.3)",
        title:"Clasificación Inteligente de Productos",
        desc:"Buscá por foto, descripción o código. La IA analiza el producto y sugiere clasificaciones arancelarias." },
      { icon:"📄", color:C.gold,       colorBg:"rgba(244,197,66,0.10)", colorBorder:"rgba(244,197,66,0.3)",
        title:"Impacto del Certificado de Origen",
        desc:"Analizá beneficios arancelarios y ahorro potencial según acuerdos comerciales aplicables." },
      { icon:"🧮", color:"#22c55e",    colorBg:"rgba(34,197,94,0.10)",  colorBorder:"rgba(34,197,94,0.3)",
        title:"Calculadora CIF",
        desc:"Calculá automáticamente el costo total de importación incluyendo flete, seguro, aranceles e impuestos." },
      { icon:"🛡", color:"#a78bfa",    colorBg:"rgba(167,139,250,0.10)",colorBorder:"rgba(167,139,250,0.3)",
        title:"Viabilidad de Importación",
        desc:"Detectá restricciones, organismos intervinientes, requisitos especiales y riesgos regulatorios antes de operar." },
    ],
    coverage_title:"Cobertura y datos integrados",
    coverage:[
      { icon:"📦", label:"HS Codes\nInternacionales" },
      { icon:"🌎", label:"NCM\nMercosur" },
      { icon:"🇪🇺", label:"TARIC\nEuropa" },
      { icon:"📊", label:"Datos\nInternacionales" },
      { icon:"📋", label:"Reportes\nPDF exportables" },
    ],
    trust:[
      { icon:"🔒", label:"Fuentes de referencia\nutilizadas con atribución" },
      { icon:"🎯", label:"Análisis preciso\ncon IA avanzada" },
      { icon:"⚡", label:"Decisiones más rápidas\ny seguras" },
      { icon:"☁️", label:"Datos seguros\ny confidenciales" },
    ],
    footer_legal: "GTH proporciona herramientas de apoyo para análisis de comercio internacional. La clasificación arancelaria definitiva y los requisitos regulatorios deben ser verificados por profesionales competentes y/o autoridades aduaneras. Los resultados generados por IA son orientativos y no constituyen asesoramiento legal, tributario ni aduanero.",
    footer_copy:  "© 2025 Global Tariff Hub. Todos los derechos reservados.",
  },
  en: {
    nav_tagline:  "Intelligence for Global Trade",
    nav_links:    ["Features","Modules","Data Sources","Pricing","About","Resources"],
    nav_login:    "Sign in",
    nav_cta:      "Try now",
    eyebrow:      "TARIFF INTELLIGENCE",
    h1a:          "For Importers",
    h1b:          "and Exporters",
    sub:          "Smarter decisions. Borderless trade.",
    tagline:      "From Product to Trade Intelligence™",
    photo_title:  "Upload a photo of your product",
    photo_hl:     "photo",
    photo_desc:   "AI analyzes the product and suggests tariff classifications so you can decide with real information.",
    checks:       ["International HS Code","NCM Mercosur","TARIC Europe","Documentary requirements","Tariff impact","Similar classifications"],
    cta1:         "→  Start analysis",
    cta2:         "▷  See how it works",
    notify_ph:    "your@email.com",
    notify_btn:   "Notify me at launch",
    notify_sub:   "No spam. One notification when we launch.",
    notify_thanks:"Thanks! We'll notify you when we launch.",
    offer_label:  "Launch offer",
    offer_detail: "Annual plan · 2 months free",
    modules_title:"Everything you need to make better decisions",
    modules: [
      { icon:"📷", color:C.blueBright, colorBg:"rgba(59,130,246,0.12)", colorBorder:"rgba(59,130,246,0.3)",
        title:"Intelligent Product Classification",
        desc:"Search by photo, description or code. AI analyzes the product and suggests tariff classifications." },
      { icon:"📄", color:C.gold,       colorBg:"rgba(244,197,66,0.10)", colorBorder:"rgba(244,197,66,0.3)",
        title:"Certificate of Origin Impact",
        desc:"Analyze tariff benefits and potential savings based on applicable trade agreements." },
      { icon:"🧮", color:"#22c55e",    colorBg:"rgba(34,197,94,0.10)",  colorBorder:"rgba(34,197,94,0.3)",
        title:"CIF Calculator",
        desc:"Automatically calculate the total import cost including freight, insurance, tariffs and taxes." },
      { icon:"🛡", color:"#a78bfa",    colorBg:"rgba(167,139,250,0.10)",colorBorder:"rgba(167,139,250,0.3)",
        title:"Import Viability",
        desc:"Detect restrictions, regulatory bodies, special requirements and regulatory risks before operating." },
    ],
    coverage_title:"Coverage and integrated data",
    coverage:[
      { icon:"📦", label:"International\nHS Codes" },
      { icon:"🌎", label:"NCM\nMercosur" },
      { icon:"🇪🇺", label:"TARIC\nEurope" },
      { icon:"📊", label:"International\nData" },
      { icon:"📋", label:"PDF\nExportable Reports" },
    ],
    trust:[
      { icon:"🔒", label:"Reference sources\nwith attribution" },
      { icon:"🎯", label:"Precise analysis\nwith advanced AI" },
      { icon:"⚡", label:"Faster and safer\ndecisions" },
      { icon:"☁️", label:"Secure and\nconfidential data" },
    ],
    footer_legal: "GTH provides support tools for international trade analysis. Definitive tariff classification and regulatory requirements must be verified by qualified professionals and/or customs authorities. AI-generated results are indicative and do not constitute legal, tax or customs advice.",
    footer_copy:  "© 2025 Global Tariff Hub. All rights reserved.",
  },
};

export default function HomePage({ defaultLang = "es" }: { defaultLang?: "es" | "en" }) {
  const [lang, setLang]         = useState<"es"|"en">(defaultLang as "es"|"en");
  const [mounted, setMounted]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail]       = useState("");

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const t = T[lang];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await fetch("/api/subscribe",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,lang}) }); } catch {}
    setSubmitted(true); setShowForm(false);
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight:"100vh", color: C.white, fontFamily: FONT }}>

      {/* ── Oferta top bar ─────────────────────────── */}
      <div style={{ background:`linear-gradient(90deg,${C.bgCard},#0a1830,${C.bgCard})`, borderBottom:`1px solid ${C.borderGold}`, padding:"8px 24px", textAlign:"center" }}>
        <p style={{ fontSize:12, fontWeight:600, color:C.gold, letterSpacing:0.3 }}>
          ⚡ {t.offer_label} — {t.offer_detail}
          <Link href="/pricing" style={{ marginLeft:14, color:C.white, fontWeight:800, textDecoration:"underline" }}>
            {lang==="es"?"Ver oferta →":"See offer →"}
          </Link>
        </p>
      </div>

      {/* ── Navbar ─────────────────────────────────── */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 48px", borderBottom:`1px solid ${C.border}`, background:"rgba(7,21,47,0.95)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(16px)" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:9, background:`linear-gradient(135deg,${C.blue},#0D2247)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:C.gold, border:`1.5px solid ${C.gold}`, letterSpacing:0.5 }}>GTH</div>
          <div>
            <p style={{ fontWeight:800, fontSize:15, color:C.white, lineHeight:1.1, letterSpacing:-0.2 }}>Global Tariff Hub</p>
            <p style={{ fontSize:10, color:`${C.gold}BB`, fontWeight:500, letterSpacing:0.2 }}>{t.nav_tagline}</p>
          </div>
        </div>

        {/* Links centro */}
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          {t.nav_links.map((l,i) => (
            <a key={i} href={i===1?"#modulos":i===3?"/pricing":i===2?"#cobertura":"#"} style={{ color:C.textSec, textDecoration:"none", fontSize:13, fontWeight:500 }}
              onMouseEnter={e=>(e.currentTarget.style.color=C.white)}
              onMouseLeave={e=>(e.currentTarget.style.color=C.textSec)}>{l}</a>
          ))}
        </div>

        {/* Acciones derecha */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:20, padding:3, border:`1px solid ${C.border}` }}>
            {(["es","en"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{ padding:"3px 12px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:lang===l?C.blue:"transparent", color:lang===l?C.white:C.textMuted, letterSpacing:0.5 }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Link href="/login" style={{ fontSize:13, color:C.textSec, textDecoration:"none", fontWeight:500, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", display:"flex", alignItems:"center", gap:6 }}>
            👤 {t.nav_login}
          </Link>
          <button onClick={()=>setShowForm(true)} style={{ fontSize:13, fontWeight:700, color:C.bg, background:`linear-gradient(135deg,${C.gold},#F9D96A)`, border:"none", borderRadius:8, padding:"8px 20px", cursor:"pointer" }}>
            {t.nav_cta}
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"68px 48px 56px", display:"grid", gridTemplateColumns:"65fr 35fr", gap:56, alignItems:"center" }}>

        {/* Columna izquierda — 65% */}
        <div>
          {/* Eyebrow */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.gold, letterSpacing:2.5, textTransform:"uppercase" }}>{t.eyebrow}</span>
            <div style={{ height:2, width:36, background:C.gold, borderRadius:2 }} />
          </div>

          {/* H1 */}
          <h1 style={{ fontSize:"clamp(40px,5vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:-2, marginBottom:16, color:C.white }}>
            {t.h1a}<br/>{t.h1b}
          </h1>

          {/* Sub */}
          <p style={{ fontSize:18, color:C.textSec, marginBottom:10, fontWeight:400, lineHeight:1.5 }}>{t.sub}</p>
          <p style={{ fontSize:12, color:`${C.gold}99`, fontWeight:600, marginBottom:36, letterSpacing:0.5, fontStyle:"italic" }}>{t.tagline}</p>

          {/* Card foto — FOCO PRINCIPAL */}
          <div style={{ background:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:16, padding:"24px 28px", marginBottom:28, boxShadow:`0 0 32px rgba(37,99,235,0.12)` }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:18 }}>
              {/* Ícono cámara con marco estilo referencia */}
              <div style={{ flexShrink:0, width:60, height:60, borderRadius:12, background:"rgba(37,99,235,0.15)", border:`2px solid rgba(37,99,235,0.5)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, position:"relative" }}>
                📷
                <div style={{ position:"absolute", top:-4, left:-4, right:-4, bottom:-4, border:`1px solid rgba(37,99,235,0.25)`, borderRadius:16 }} />
              </div>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:C.white, lineHeight:1.25, marginBottom:6 }}>
                  {t.photo_title.split(t.photo_hl).map((part,i,arr)=>
                    i<arr.length-1
                      ? <span key={i}>{part}<span style={{color:C.gold}}>{t.photo_hl}</span></span>
                      : <span key={i}>{part}</span>
                  )}
                </p>
                <p style={{ fontSize:13, color:C.textSec, lineHeight:1.6 }}>{t.photo_desc}</p>
              </div>
            </div>
            {/* Checklist 3×2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px 8px" }}>
              {t.checks.map((c,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:18, height:18, borderRadius:5, background:`rgba(37,99,235,0.15)`, border:`1.5px solid ${C.blue}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:10, color:C.blueBright, fontWeight:800 }}>✓</span>
                  </div>
                  <span style={{ fontSize:12, color:C.textSec }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          {submitted ? (
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"14px 24px" }}>
              <span>✅</span><p style={{ fontSize:14, color:"#22c55e", fontWeight:600 }}>{t.notify_thanks}</p>
            </div>
          ) : showForm ? (
            <form onSubmit={handleSubscribe} style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.notify_ph} required autoFocus
                style={{ padding:"13px 18px", borderRadius:9, border:`1px solid ${C.border}`, background:C.bgCard, color:C.white, fontSize:14, flex:1, minWidth:200, outline:"none" }}/>
              <button type="submit" style={{ padding:"13px 24px", borderRadius:9, border:"none", background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:14, fontWeight:800, cursor:"pointer" }}>{t.notify_btn}</button>
            </form>
          ) : (
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={()=>setShowForm(true)} style={{ padding:"14px 28px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:15, fontWeight:800, cursor:"pointer", letterSpacing:0.1 }}>
                {t.cta1}
              </button>
              <button onClick={()=>document.getElementById("modulos")?.scrollIntoView({behavior:"smooth"})}
                style={{ padding:"14px 22px", borderRadius:10, border:`1.5px solid rgba(59,130,246,0.4)`, background:"transparent", color:C.blueBright, fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                {t.cta2}
              </button>
            </div>
          )}
          <p style={{ fontSize:11, color:C.textMuted, marginTop:12 }}>{t.notify_sub}</p>
        </div>

        {/* Columna derecha — 35% — Globo reducido */}
        <div style={{ display:"flex", flexDirection:"column", gap:16, alignItems:"center" }}>
          {/* Globo compacto */}
          <div style={{ width:220, height:220, borderRadius:"50%", background:"radial-gradient(ellipse at 38% 35%, rgba(37,99,235,0.3) 0%, rgba(11,30,61,0.8) 55%, rgba(7,21,47,0) 100%)", border:`1px solid rgba(37,99,235,0.2)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            {/* Órbitas */}
            <div style={{ position:"absolute", width:180, height:180, borderRadius:"50%", border:`1px solid rgba(37,99,235,0.18)` }} />
            <div style={{ position:"absolute", width:130, height:130, borderRadius:"50%", border:`1px solid rgba(37,99,235,0.25)` }} />
            {/* Puntos de conexión */}
            {[{t:"18%",l:"28%",c:C.gold},{t:"40%",l:"72%",c:C.blueBright},{t:"65%",l:"22%",c:"#22c55e"},{t:"72%",l:"60%",c:C.gold},{t:"30%",l:"50%",c:C.blueBright}].map((d,i)=>(
              <div key={i} style={{ position:"absolute", top:d.t, left:d.l, width:8, height:8, borderRadius:"50%", background:d.c, boxShadow:`0 0 10px ${d.c}` }} />
            ))}
            <span style={{ fontSize:56, filter:"drop-shadow(0 0 20px rgba(37,99,235,0.5))", zIndex:1 }}>🌐</span>
          </div>

          {/* Stats — datos reales */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%", maxWidth:240 }}>
            {[
              { n:"164",  label:lang==="es"?"Países OMC":"WTO Countries",   icon:"🌐" },
              { n:"3",    label:lang==="es"?"Sistemas\narancelarios":"Tariff\nsystems",   icon:"🗂" },
              { n:"4",    label:lang==="es"?"Módulos\nespecializados":"Specialized\nmodules", icon:"⚙️" },
              { n:"IA",   label:lang==="es"?"Foto →\nClasificación":"Photo →\nClassification", icon:"📷" },
            ].map((s,i)=>(
              <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 12px", textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:900, color:C.white, letterSpacing:-0.5, lineHeight:1 }}>{s.n}</p>
                <p style={{ fontSize:10, color:C.textSec, marginTop:6, lineHeight:1.4, whiteSpace:"pre-line" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos ────────────────────────────────── */}
      <section id="modulos" style={{ background:`linear-gradient(180deg,${C.bgCard}00,${C.bgCard}88)`, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"56px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:36, justifyContent:"center" }}>
            <div style={{ height:1, flex:1, background:C.border }} />
            <h2 style={{ fontSize:18, fontWeight:700, color:C.white, textAlign:"center", whiteSpace:"nowrap", letterSpacing:-0.3 }}>{t.modules_title}</h2>
            <div style={{ height:1, flex:1, background:C.border }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {t.modules.map((m,i)=>(
              <div key={i}
                style={{ background:C.bgCard, border:`1px solid ${m.colorBorder}`, borderRadius:16, padding:"24px 20px", display:"flex", flexDirection:"column", gap:14, cursor:"pointer", transition:"all 0.2s", boxShadow:`0 0 0 0 ${m.color}` }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.bgCardHover; e.currentTarget.style.boxShadow=`0 4px 24px ${m.color}22`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.bgCard; e.currentTarget.style.boxShadow="none"; }}
              >
                <div style={{ width:48, height:48, borderRadius:12, background:m.colorBg, border:`1px solid ${m.colorBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{m.icon}</div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:C.white, marginBottom:8, lineHeight:1.3 }}>{m.title}</h3>
                  <p style={{ fontSize:12, color:C.textSec, lineHeight:1.7 }}>{m.desc}</p>
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:m.colorBg, border:`1px solid ${m.colorBorder}`, display:"flex", alignItems:"center", justifyContent:"center", color:m.color, fontSize:13, fontWeight:800 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cobertura ──────────────────────────────── */}
      <section id="cobertura" style={{ padding:"0 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", background:C.bgCard, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 0 0", padding:"20px 32px", display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.textSec, flexShrink:0, minWidth:200 }}>{t.coverage_title}</p>
          <div style={{ display:"flex", flex:1, flexWrap:"wrap" }}>
            {t.coverage.map((item,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 20px", borderLeft:i>0?`1px solid ${C.border}`:"none" }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <p style={{ fontSize:11, color:C.textSec, lineHeight:1.4, whiteSpace:"pre-line" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────── */}
      <section style={{ padding:"0 48px 72px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", background:"rgba(7,21,47,0.9)", border:`1px solid rgba(255,255,255,0.05)`, borderTop:"none", borderRadius:"0 0 16px 16px", padding:"20px 32px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
          {t.trust.map((item,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 16px", borderLeft:i>0?`1px solid rgba(255,255,255,0.06)`:"none" }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
              <p style={{ fontSize:11, color:C.textMuted, lineHeight:1.5, whiteSpace:"pre-line" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA central ────────────────────────────── */}
      <section style={{ maxWidth:720, margin:"0 auto 80px", padding:"0 48px" }}>
        <div style={{ background:`linear-gradient(135deg,rgba(37,99,235,0.12),${C.bgCard})`, border:`1px solid ${C.border}`, borderRadius:20, padding:"52px 48px", textAlign:"center" }}>
          <p style={{ fontSize:11, color:C.gold, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>From Product to Trade Intelligence™</p>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:12, letterSpacing:-0.5 }}>
            {lang==="es"?"Empezá ahora — es gratis":"Start now — it's free"}
          </h2>
          <p style={{ fontSize:14, color:C.textSec, marginBottom:32, maxWidth:400, margin:"0 auto 32px", lineHeight:1.7 }}>
            {lang==="es"?"3 consultas gratis, sin tarjeta de crédito. Cuando escales, activás tu plan.":"3 free consultations, no credit card. When you scale, activate your plan."}
          </p>
          {submitted ? (
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"14px 24px" }}>
              <span>✅</span><p style={{ fontSize:14, color:"#22c55e", fontWeight:600 }}>{t.notify_thanks}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.notify_ph} required
                style={{ padding:"13px 20px", borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:14, width:260, outline:"none" }}/>
              <button type="submit" style={{ padding:"13px 28px", borderRadius:9, border:"none", background:`linear-gradient(135deg,${C.gold},#F9D96A)`, color:C.bg, fontSize:14, fontWeight:800, cursor:"pointer" }}>
                {t.notify_btn}
              </button>
            </form>
          )}
          <p style={{ fontSize:11, color:C.textMuted, marginTop:14 }}>{t.notify_sub}</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid rgba(255,255,255,0.06)`, padding:"32px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:7, background:`linear-gradient(135deg,${C.blue},#0D2247)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:C.gold, border:`1.5px solid ${C.gold}` }}>GTH</div>
            <div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:700 }}>Global Tariff Hub</p>
              <p style={{ fontSize:10, color:`${C.gold}66` }}>From Product to Trade Intelligence™</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[
              {href:"/pricing",label:"Pricing"},
              {href:"/login",label:t.nav_login},
              {href:lang==="es"?"/privacidad":"/privacy",label:lang==="es"?"Privacidad":"Privacy"},
              {href:"/terminos",label:lang==="es"?"Términos":"Terms"},
              {href:"/legales",label:lang==="es"?"Aviso Legal":"Legal Notice"},
            ].map(l=>(
              <Link key={l.href} href={l.href} style={{ fontSize:12, color:C.textMuted, textDecoration:"none", fontWeight:500 }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"20px auto 0", borderTop:`1px solid rgba(255,255,255,0.05)`, paddingTop:20 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginBottom:6 }}>{t.footer_copy}</p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.12)", lineHeight:1.6, maxWidth:900 }}>{t.footer_legal}</p>
        </div>
      </footer>
    </div>
  );
}
