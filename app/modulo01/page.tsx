"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const t = {
  es: {
    title: "Buscador Arancelario",
    subtitle: "HS / NCM / TARIC",
    tab_image: "🤖 Buscar por imagen",
    tab_text: "🔍 Buscar por descripción",
    tab_code: "# Buscar por código",
    image_label: "Subí una foto del producto",
    image_drop: "Arrastrá una imagen o hacé clic para seleccionar",
    image_formats: "JPG, PNG o WEBP — máx. 5MB",
    desc_label: "Describí el producto",
    desc_placeholder: "Ej: vino tinto en botellas de 750ml, laptop usada, cuero curtido...",
    code_label: "Ingresá el código arancelario",
    code_placeholder: "Ej: 2204.21, 8471.30, 4107.11",
    btn_search: "Buscar",
    btn_searching: "Buscando...",
    result_title: "Resultados",
    result_chapter: "Capítulo",
    result_rate: "Arancel base",
    result_notes: "Notas",
    result_confidence: "Confianza",
    disclaimer: "⚠ Datos de referencia. Verificar con la fuente oficial antes de operar.",
    no_image: "Seleccioná una imagen primero",
    no_text: "Escribí una descripción primero",
    error: "Error al procesar la búsqueda. Intentá de nuevo.",
    back: "← Volver",
    confidence_alta: "Alta",
    confidence_media: "Media",
    confidence_baja: "Baja",
  },
  en: {
    title: "Tariff Search",
    subtitle: "HS / NCM / TARIC",
    tab_image: "🤖 Search by image",
    tab_text: "🔍 Search by description",
    tab_code: "# Search by code",
    image_label: "Upload a product photo",
    image_drop: "Drag an image or click to select",
    image_formats: "JPG, PNG or WEBP — max 5MB",
    desc_label: "Describe the product",
    desc_placeholder: "E.g: red wine 750ml bottles, used laptop, tanned leather...",
    code_label: "Enter the tariff code",
    code_placeholder: "E.g: 2204.21, 8471.30, 4107.11",
    btn_search: "Search",
    btn_searching: "Searching...",
    result_title: "Results",
    result_chapter: "Chapter",
    result_rate: "Base tariff",
    result_notes: "Notes",
    result_confidence: "Confidence",
    disclaimer: "⚠ Reference data. Verify with official source before operating.",
    no_image: "Select an image first",
    no_text: "Enter a description first",
    error: "Search error. Please try again.",
    back: "← Back",
    confidence_alta: "High",
    confidence_media: "Medium",
    confidence_baja: "Low",
  },
};

type Tab = "image" | "text" | "code";
type Lang = "es" | "en";

interface SearchResult {
  code: string;
  system: string;
  description: string;
  chapter: string;
  base_rate: string;
  notes: string;
  confidence: "alta" | "media" | "baja";
}

export default function Modulo01({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [tab, setTab] = useState<Tab>("image");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const c = t[lang];

  const confidenceColor: Record<string, string> = {
    alta: "#22c55e", media: "#f59e0b", baja: "#ef4444",
    High: "#22c55e", Medium: "#f59e0b", Low: "#ef4444",
  };

  const handleImage = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResults(null);
    setError("");
  };

  const handleSearch = async () => {
    setError("");
    setResults(null);

    if (tab === "image" && !image) { setError(c.no_image); return; }
    if ((tab === "text" || tab === "code") && !query.trim()) { setError(c.no_text); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      if (tab === "image" && image) fd.append("image", image);
      if (query) fd.append("query", query);
      fd.append("lang", lang);

      const res = await fetch("/api/search", { method: "POST", body: fd });
      const data = await res.json();

      if (data.error) { setError(data.error); return; }
      setResults(data.results);
      setDisclaimer(data.disclaimer);
    } catch {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "image", label: c.tab_image },
    { key: "text", label: c.tab_text },
    { key: "code", label: c.tab_code },
  ];

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
          {(["es", "en"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 20, padding: "5px 16px", color: "#0057FF", fontSize: 12, fontWeight: 600 }}>
            Módulo 01
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 6 }}>{c.title}</h1>
          <p style={{ color: "#C9A84C", fontSize: 16, fontWeight: 600 }}>{c.subtitle}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "#0D1B3E", borderRadius: 12, padding: 6, border: "1px solid rgba(0,87,255,0.2)" }}>
          {tabs.map((tb) => (
            <button key={tb.key} onClick={() => { setTab(tb.key); setResults(null); setError(""); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === tb.key ? "#0057FF" : "transparent", color: tab === tb.key ? "#FFFFFF" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* Search panel */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 32, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 24 }}>

          {/* Image tab */}
          {tab === "image" && (
            <div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>{c.image_label}</p>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImage(f); }}
                style={{ border: "2px dashed rgba(0,87,255,0.4)", borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", marginBottom: 16, background: imagePreview ? "transparent" : "rgba(0,87,255,0.05)", transition: "border-color 0.2s" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, maxWidth: "100%" }} />
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 4 }}>{c.image_drop}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{c.image_formats}</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.desc_placeholder} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Descripción opcional para mejorar la precisión</p>
            </div>
          )}

          {/* Text tab */}
          {tab === "text" && (
            <div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>{c.desc_label}</p>
              <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.desc_placeholder} rows={4} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Arial" }} />
            </div>
          )}

          {/* Code tab */}
          {tab === "code" && (
            <div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>{c.code_label}</p>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.code_placeholder} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 18, fontFamily: "monospace", outline: "none", boxSizing: "border-box", letterSpacing: 2 }} />
            </div>
          )}

          {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{error}</p>}

          <button onClick={handleSearch} disabled={loading} style={{ marginTop: 20, width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.4)" : "linear-gradient(135deg, #0057FF, #003DB3)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.5 }}>
            {loading ? c.btn_searching : c.btn_search}
          </button>
        </div>

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{c.result_title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {results.map((r, i) => (
                <div key={i} style={{ background: "#0D1B3E", borderRadius: 12, padding: 24, border: "1px solid rgba(201,168,76,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "#C9A84C", letterSpacing: 2 }}>{r.code}</span>
                      <span style={{ marginLeft: 10, background: "rgba(0,87,255,0.2)", color: "#0057FF", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, border: "1px solid rgba(0,87,255,0.4)" }}>{r.system}</span>
                    </div>
                    <span style={{ fontSize: 12, color: confidenceColor[r.confidence] || "#22c55e", fontWeight: 600 }}>
                      ● {c.result_confidence}: {lang === "es" ? (r.confidence === "alta" ? c.confidence_alta : r.confidence === "media" ? c.confidence_media : c.confidence_baja) : (r.confidence === "alta" ? "High" : r.confidence === "media" ? "Medium" : "Low")}
                    </span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{r.description}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{c.result_chapter}: {r.chapter}</p>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.result_rate}</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>{r.base_rate}</p>
                    </div>
                    {r.notes && (
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.result_notes}</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{r.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>{disclaimer}</p>
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub — Datos de referencia. No reemplaza consulta profesional.</p>
      </footer>
    </div>
  );
}
