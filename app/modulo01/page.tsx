"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { exportSearchPDF } from "@/lib/exportPDF";
import LegalDisclaimer from "@/components/LegalDisclaimer";

const COUNTRIES = [
  "Argentina", "Brasil", "Uruguay", "Paraguay", "Chile", "Bolivia", "Perú",
  "Colombia", "Ecuador", "Venezuela", "México", "Estados Unidos", "Canadá",
  "España", "Alemania", "Francia", "Italia", "China", "Japón", "Corea del Sur",
  "India", "Australia", "Reino Unido"
];

const SYSTEMS = ["HS", "NCM", "TARIC"];

const t = {
  es: {
    title: "Buscador Arancelario",
    subtitle: "HS · NCM · TARIC · Acuerdos Comerciales",
    origin: "País de origen",
    destination: "País de destino",
    select_country: "Seleccioná un país",
    nomenclature: "Sistema de nomenclatura",
    tab_image: "🤖 Por imagen",
    tab_text: "🔍 Por descripción",
    tab_code: "# Por código",
    image_label: "Subí una foto del producto",
    image_drop: "Arrastrá una imagen o hacé clic para seleccionar",
    image_formats: "JPG, PNG o WEBP — máx. 5MB",
    desc_placeholder: "Ej: vino tinto en botellas de 750ml, laptop usada, cuero curtido...",
    code_placeholder: "Ej: 2204.21, 8471.30, 4107.11",
    desc_optional: "Descripción opcional para mejorar la precisión",
    btn_search: "Buscar",
    btn_searching: "Buscando...",
    results: "Resultados",
    hs: "Código HS",
    ncm: "Código NCM",
    taric: "Código TARIC",
    chapter: "Capítulo",
    base_rate: "Arancel base",
    pref_rate: "Arancel preferencial",
    agreement: "Acuerdo comercial",
    origin_docs: "Documentos en origen",
    dest_docs: "Documentos en destino",
    notes: "Notas",
    confidence: "Confianza",
    conf_alta: "Alta", conf_media: "Media", conf_baja: "Baja",
    sim_cert: "📄 M02 — Simulador de Operaciones con Certificado →",
    calc_cif: "📦 M03 — Calculadora CIF →",
    disclaimer: "⚠ Datos de referencia. Verificar con la fuente oficial antes de operar.",
    error_image: "Seleccioná una imagen primero",
    error_text: "Escribí una descripción primero",
    error_general: "Error al procesar. Intentá de nuevo.",
  },
  en: {
    title: "Tariff Search",
    subtitle: "HS · NCM · TARIC · Trade Agreements",
    origin: "Country of origin",
    destination: "Destination country",
    select_country: "Select a country",
    nomenclature: "Nomenclature system",
    tab_image: "🤖 By image",
    tab_text: "🔍 By description",
    tab_code: "# By code",
    image_label: "Upload a product photo",
    image_drop: "Drag an image or click to select",
    image_formats: "JPG, PNG or WEBP — max 5MB",
    desc_placeholder: "E.g: red wine 750ml, used laptop, tanned leather...",
    code_placeholder: "E.g: 2204.21, 8471.30, 4107.11",
    desc_optional: "Optional description to improve accuracy",
    btn_search: "Search",
    btn_searching: "Searching...",
    results: "Results",
    hs: "HS Code",
    ncm: "NCM Code",
    taric: "TARIC Code",
    chapter: "Chapter",
    base_rate: "Base tariff",
    pref_rate: "Preferential tariff",
    agreement: "Trade agreement",
    origin_docs: "Documents at origin",
    dest_docs: "Documents at destination",
    notes: "Notes",
    confidence: "Confidence",
    conf_alta: "High", conf_media: "Medium", conf_baja: "Low",
    sim_cert: "📄 M02 — Certificate of Origin Operations Simulator →",
    calc_cif: "📦 M03 — CIF Calculator →",
    disclaimer: "⚠ Reference data. Verify with official source before operating.",
    error_image: "Select an image first",
    error_text: "Enter a description first",
    error_general: "Processing error. Please try again.",
  },
};

type Tab = "image" | "text" | "code";
type Lang = "es" | "en";

interface SearchResult {
  hs_code: string;
  ncm_code: string;
  taric_code: string;
  description: string;
  chapter: string;
  base_rate: string;
  preferential_rate: string;
  trade_agreement: string;
  agreement_note: string;
  origin_documents: string[];
  destination_documents: string[];
  notes: string;
  confidence: "alta" | "media" | "baja";
}

interface SearchResponse {
  results: SearchResult[];
  route_info?: { origin: string; destination: string; agreement: string; agreement_active: boolean };
  disclaimer: string;
}

export default function Modulo01({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [tab, setTab] = useState<Tab>("image");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [system, setSystem] = useState("HS");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const c = t[lang];

  const confColor = { alta: "#22c55e", media: "#f59e0b", baja: "#ef4444" };

  const handleImage = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResponse(null);
    setError("");
  };

  const swapCountries = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = async () => {
    setError("");
    setResponse(null);
    setExpanded(null);
    if (!origin || !destination) { setError(lang === "es" ? "Seleccioná el país de origen y destino antes de buscar." : "Please select origin and destination country before searching."); return; }
    if (tab === "image" && !image) { setError(c.error_image); return; }
    if ((tab === "text" || tab === "code") && !query.trim()) { setError(c.error_text); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      if (tab === "image" && image) fd.append("image", image);
      if (query) fd.append("query", query);
      fd.append("lang", lang);
      fd.append("origin", origin);
      fd.append("destination", destination);
      fd.append("system", system);
      const res = await fetch("/api/search", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        if (data.code === "UNAUTHENTICATED") { window.location.href = "/login"; return; }
        if (data.code === "NO_CREDITS") { window.location.href = "/pricing"; return; }
        setError(data.error); return;
      }
      setResponse(data);
    } catch {
      setError(c.error_general);
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F",
    color: "#FFFFFF", fontSize: 14, outline: "none", cursor: "pointer",
  };

  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" as const };

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
          {(["es", "en"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 20, padding: "5px 16px", color: "#0057FF", fontSize: 12, fontWeight: 600 }}>Módulo 01</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 14, marginBottom: 6 }}>{c.title}</h1>
          <p style={{ color: "#C9A84C", fontSize: 15, fontWeight: 600 }}>{c.subtitle}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { icon: "🔍", label: lang === "es" ? "Clasificación por imagen, descripción o código" : "Classification by image, description or code" },
              { icon: "🤝", label: lang === "es" ? "Acuerdos comerciales entre países" : "Trade agreements between countries" },
              { icon: "📋", label: lang === "es" ? "Documentación requerida en origen y destino" : "Required docs at origin and destination" },
              { icon: "💰", label: lang === "es" ? "Arancel base y tasa preferencial" : "Base tariff and preferential rate" },
            ].map((f, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* País origen / destino / nomenclatura */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end", marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>{c.origin}</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={selectStyle}>
                <option value="">{c.select_country}</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={swapCountries} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#0057FF", cursor: "pointer", fontSize: 18, marginBottom: 0 }}>⇄</button>
            <div>
              <label style={labelStyle}>{c.destination}</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} style={selectStyle}>
                <option value="">{c.select_country}</option>
                {COUNTRIES.map((co) => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </div>

          {/* Switch nomenclatura */}
          <div>
            <label style={labelStyle}>{c.nomenclature}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {SYSTEMS.map((s) => (
                <button key={s} onClick={() => setSystem(s)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${system === s ? "#0057FF" : "rgba(255,255,255,0.1)"}`, background: system === s ? "rgba(0,87,255,0.2)" : "transparent", color: system === s ? "#FFFFFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs búsqueda */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "#0D1B3E", borderRadius: 12, padding: 6, border: "1px solid rgba(0,87,255,0.2)" }}>
          {([["image", c.tab_image], ["text", c.tab_text], ["code", c.tab_code]] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setResponse(null); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === key ? "#0057FF" : "transparent", color: tab === key ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{label}</button>
          ))}
        </div>

        {/* Panel búsqueda */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 24 }}>

          {tab === "image" && (
            <div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>{c.image_label}</p>
              <div onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImage(f); }}
                style={{ border: "2px dashed rgba(0,87,255,0.4)", borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 14, background: "rgba(0,87,255,0.03)" }}>
                {imagePreview ? <img src={imagePreview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, maxWidth: "100%" }} /> : (
                  <><div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 4 }}>{c.image_drop}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{c.image_formats}</p></>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.desc_placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{c.desc_optional}</p>
            </div>
          )}

          {tab === "text" && (
            <div>
              <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.desc_placeholder} rows={4} style={{ width: "100%", padding: "14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Arial" }} />
            </div>
          )}

          {tab === "code" && (
            <div>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.code_placeholder} style={{ width: "100%", padding: "14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 20, fontFamily: "monospace", outline: "none", boxSizing: "border-box", letterSpacing: 2 }} />
            </div>
          )}

          {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{error}</p>}

          <button onClick={handleSearch} disabled={loading || !origin || !destination} style={{ marginTop: 18, width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading || !origin || !destination ? "rgba(0,87,255,0.3)" : "linear-gradient(135deg, #0057FF, #003DB3)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, cursor: loading || !origin || !destination ? "not-allowed" : "pointer" }}>
            {loading ? c.btn_searching : c.btn_search}
          </button>
        </div>

        {/* Resultados */}
        {response && response.results?.length > 0 && (
          <div>
            {/* Botón exportar PDF */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => exportSearchPDF(response, { origin, destination, system, query, lang })}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                📄 {lang === "es" ? "Exportar informe PDF" : "Export PDF report"}
              </button>
            </div>

            {/* Info de ruta */}
            {response.route_info?.agreement && response.route_info.agreement !== "Ninguno" && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🤝</span>
                <span style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>{response.route_info.origin} → {response.route_info.destination}: {response.route_info.agreement}</span>
              </div>
            )}

            {/* Aviso actualización de fuentes */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13 }}>🔄</span>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                {lang === "es"
                  ? "Fuentes de referencia: WTO API · TARIC-EU (actualización mensual) · Siscomex/NCM · Resultados IA orientativos — verificar con profesional habilitado"
                  : "Reference sources: WTO API · TARIC-EU (monthly update) · Siscomex/NCM · AI results are indicative — verify with a qualified professional"}
              </p>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{c.results}</h2>

            {response.results.map((r, i) => (
              <div key={i} style={{ background: "#0D1B3E", borderRadius: 14, border: "1px solid rgba(201,168,76,0.25)", marginBottom: 16, overflow: "hidden" }}>

                {/* Header resultado */}
                <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ padding: "20px 24px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: "#C9A84C", letterSpacing: 2 }}>
                        {system === "NCM" ? r.ncm_code : system === "TARIC" ? r.taric_code : r.hs_code}
                      </span>
                      <span style={{ marginLeft: 10, background: "rgba(0,87,255,0.2)", color: "#0057FF", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, border: "1px solid rgba(0,87,255,0.4)" }}>{system}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: confColor[r.confidence] || "#22c55e", fontWeight: 600 }}>● {c.confidence}: {r.confidence === "alta" ? c.conf_alta : r.confidence === "media" ? c.conf_media : c.conf_baja}</span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>{expanded === i ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginTop: 10, marginBottom: 6 }}>{r.description}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.chapter}: {r.chapter}</p>

                  {/* Aranceles */}
                  <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 16px" }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.base_rate}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>{r.base_rate}</p>
                    </div>
                    {r.preferential_rate && r.preferential_rate !== r.base_rate && (
                      <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 8, padding: "10px 16px", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.pref_rate} — {r.trade_agreement}</p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>{r.preferential_rate}</p>
                      </div>
                    )}
                  </div>
                  {r.agreement_note && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8, fontStyle: "italic" }}>{r.agreement_note}</p>}
                </div>

                {/* Detalle expandido */}
                {expanded === i && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px" }}>

                    {/* Todos los códigos */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                      {[["HS", r.hs_code], ["NCM", r.ncm_code], ["TARIC", r.taric_code]].map(([sys, code]) => (
                        <div key={sys} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 14px" }}>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{sys}</p>
                          <p style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>{code}</p>
                        </div>
                      ))}
                    </div>

                    {/* Documentos */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div style={{ background: "rgba(0,87,255,0.07)", borderRadius: 10, padding: "16px" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#0057FF", marginBottom: 10 }}>📤 {c.origin_docs}</p>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {r.origin_documents?.map((doc, j) => (
                            <li key={j} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8 }}>
                              <span style={{ color: "#0057FF" }}>•</span>{doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ background: "rgba(201,168,76,0.07)", borderRadius: 10, padding: "16px" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", marginBottom: 10 }}>📥 {c.dest_docs}</p>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {r.destination_documents?.map((doc, j) => (
                            <li key={j} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8 }}>
                              <span style={{ color: "#C9A84C" }}>•</span>{doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {r.notes && (
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.notes}</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{r.notes}</p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    {!origin || !destination ? (
                      <p style={{ fontSize: 12, color: "#C9A84C", fontStyle: "italic" }}>
                        {lang === "es" ? "⚠️ Seleccioná país de origen y destino para continuar." : "⚠️ Select origin and destination country to continue."}
                      </p>
                    ) : (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link
                          href={`/modulo02?tariff_code=${encodeURIComponent(system === "NCM" ? r.ncm_code || r.hs_code || "" : system === "TARIC" ? r.taric_code || r.hs_code || "" : r.hs_code || "")}&system=${encodeURIComponent(system)}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                          style={{ padding: "10px 18px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          📄 {c.sim_cert}
                        </Link>
                        <Link
                          href={`/modulo03?tariff_code=${encodeURIComponent(system === "NCM" ? r.ncm_code || r.hs_code || "" : system === "TARIC" ? r.taric_code || r.hs_code || "" : r.hs_code || "")}&system=${encodeURIComponent(system)}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                          style={{ padding: "10px 18px", borderRadius: 8, background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", color: "#0057FF", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          📦 {c.calc_cif}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <LegalDisclaimer
              lang={lang as "es" | "en"}
              context="search"
              wtoSource={response.results?.some((r: any) => r.wto_source)}
              ncmSource={response.results?.some((r: any) => r.ncm_description_official)}
              taricSource={response.results?.some((r: any) => r.taric_duty)}
            />
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub — Datos de referencia. No reemplaza consulta profesional.</p>
      </footer>
    </div>
  );
}
