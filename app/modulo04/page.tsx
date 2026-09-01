"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { SUPPORTED_COUNTRIES } from "@/lib/taxEngine";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { exportViabilityPDF } from "@/lib/exportPDF";
import { buildOpQuery } from "@/lib/opContext";

const ALL_COUNTRIES = [
  "China", "Estados Unidos", "Alemania", "Italia", "España", "Francia",
  "Japón", "Corea del Sur", "India", "Turquía", "Brasil", "México",
  "Argentina", "Chile", "Colombia", "Perú", "Uruguay", "Paraguay",
  "Reino Unido", "Canadá", "Australia", "Taiwán", "Vietnam", "Bangladesh",
];

const t = {
  es: {
    title: "Análisis de Viabilidad de Importación",
    subtitle: "Calculá el costo nacionalizado real y si el negocio es viable",
    step1: "1. Producto",
    step2: "2. Datos comerciales",
    step3: "3. Resultado",
    upload_photo: "Subir foto del producto",
    or_describe: "O describir el producto",
    describe_placeholder: "Ej: manta para colorear de tela fleece con marcadores...",
    hs_known: "¿Ya conocés el código arancelario?",
    hs_placeholder: "Ej: 6301.40",
    supplier_country: "País proveedor",
    destination: "País de importación",
    fob_unit: "Precio FOB por unidad (USD)",
    quantity: "Cantidad de unidades",
    freight_total: "Flete internacional total (USD)",
    freight_hint: "Si no lo sabés, usá USD 2-4 por kg como referencia",
    analyze: "Analizar viabilidad",
    analyzing: "Analizando...",
    product_identified: "Producto identificado",
    hs_code: "Código HS",
    tariff_rate: "Tasa arancelaria",
    requires_permits: "Requiere permisos",
    commercial_data: "Datos comerciales",
    fob_total: "FOB total",
    freight: "Flete",
    insurance: "Seguro (0.5%)",
    cif_value: "Valor CIF",
    tax_breakdown: "Desglose de tributos",
    total_taxes: "Total tributos",
    landed_cost: "Costo nacionalizado total",
    landed_unit: "Costo nacionalizado por unidad",
    tax_burden: "Carga tributaria sobre CIF",
    price_analysis: "Análisis de precio de venta",
    suggested_min: "Precio mínimo sugerido (×1.8)",
    suggested_ref: "Precio referencial (×2.5)",
    suggested_max: "Precio máximo estimado (×3.5)",
    import_note: "Recomendación de modalidad",
    disclaimer_title: "Datos de referencia",
    export_pdf: "Exportar informe PDF",
    back: "← Volver",
    error_dest: "Seleccioná el país de importación.",
    error_fob: "Ingresá el precio FOB por unidad.",
    error_product: "Subí una foto o describí el producto.",
    confidence: "Confianza IA",
    updated: "Tasas actualizadas al",
    no_permits: "Sin restricciones especiales identificadas",
  },
  en: {
    title: "Import Viability Analysis",
    subtitle: "Calculate the real landed cost and whether the business is viable",
    step1: "1. Product",
    step2: "2. Commercial data",
    step3: "3. Results",
    upload_photo: "Upload product photo",
    or_describe: "Or describe the product",
    describe_placeholder: "E.g.: fleece coloring blanket with fabric markers...",
    hs_known: "Do you already know the tariff code?",
    hs_placeholder: "E.g.: 6301.40",
    supplier_country: "Supplier country",
    destination: "Import country",
    fob_unit: "FOB price per unit (USD)",
    quantity: "Number of units",
    freight_total: "Total international freight (USD)",
    freight_hint: "If unknown, use USD 2-4 per kg as reference",
    analyze: "Analyze viability",
    analyzing: "Analyzing...",
    product_identified: "Product identified",
    hs_code: "HS Code",
    tariff_rate: "Tariff rate",
    requires_permits: "Requires permits",
    commercial_data: "Commercial data",
    fob_total: "Total FOB",
    freight: "Freight",
    insurance: "Insurance (0.5%)",
    cif_value: "CIF value",
    tax_breakdown: "Tax breakdown",
    total_taxes: "Total taxes",
    landed_cost: "Total landed cost",
    landed_unit: "Landed cost per unit",
    tax_burden: "Tax burden on CIF",
    price_analysis: "Selling price analysis",
    suggested_min: "Minimum suggested price (×1.8)",
    suggested_ref: "Reference price (×2.5)",
    suggested_max: "Maximum estimated price (×3.5)",
    import_note: "Import method recommendation",
    disclaimer_title: "Reference data",
    export_pdf: "Export PDF report",
    back: "← Back",
    error_dest: "Select the import country.",
    error_fob: "Enter the FOB price per unit.",
    error_product: "Upload a photo or describe the product.",
    confidence: "AI confidence",
    updated: "Rates updated on",
    no_permits: "No special restrictions identified",
  },
};

type Lang = "es" | "en";

const fmt = (n: number) => `USD ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Modulo04({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const c = t[lang];

  // Formulario
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tariffSystem, setTariffSystem] = useState("NCM");
  const [hsCode, setHsCode] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("China");
  const [destination, setDestination] = useState("");
  const [fobUnit, setFobUnit] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [freightTotal, setFreightTotal] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedTax, setExpandedTax] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    if (!destination) { setError(c.error_dest); return; }
    if (!fobUnit || parseFloat(fobUnit) <= 0) { setError(c.error_fob); return; }
    if (!image && !description && !hsCode) { setError(c.error_product); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      if (image) fd.append("image", image);
      fd.append("description", description);
      fd.append("tariff_system", tariffSystem);
      fd.append("hs_code", hsCode);
      fd.append("supplier_country", supplierCountry);
      fd.append("destination", destination);
      fd.append("fob_unit", fobUnit);
      fd.append("quantity", quantity);
      fd.append("freight_total", freightTotal || "0");
      fd.append("lang", lang);

      const res = await fetch("/api/viability", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        if (data.code === "UNAUTHENTICATED") { window.location.href = "/login"; return; }
        if (data.code === "NO_CREDITS") { window.location.href = "/pricing"; return; }
        setError(data.error); return;
      }
      setResult(data);
    } catch { setError(lang === "es" ? "Error al procesar. Intentá de nuevo." : "Processing error. Please try again."); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E", color: "#FFF", fontSize: 13 };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" };
  const cardStyle: React.CSSProperties = { background: "#0D1B3E", borderRadius: 14, padding: 22, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 16 };
  const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 14, borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#FFFFFF", fontFamily: "Arial, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/modulos" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{lang === "es" ? "◇ Todos los módulos" : "◇ All modules"}</Link>
          <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 3, border: "1px solid rgba(0,87,255,0.3)", display: "flex" }}>
            {(["ES","EN"] as const).map((l) => (
              <span key={l} onClick={() => setLang(l.toLowerCase() as Lang)} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", background: lang === l.toLowerCase() ? "#0057FF" : "transparent", color: lang === l.toLowerCase() ? "#FFF" : "rgba(255,255,255,0.4)" }}>{l}</span>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.1)", border: "1px solid #C9A84C", borderRadius: 20, padding: "4px 16px", fontSize: 11, fontWeight: 700, color: "#C9A84C", marginBottom: 12 }}>📦 Módulo 04</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{c.title}</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{c.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 24 }}>

          {/* COLUMNA IZQUIERDA — FORMULARIO */}
          <div>

            {/* PASO 1 — PRODUCTO */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{c.step1} — {lang === "es" ? "Producto a importar" : "Product to import"}</p>

              {/* Upload imagen */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: "2px dashed rgba(0,87,255,0.4)", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 16, background: imagePreview ? "transparent" : "rgba(0,87,255,0.04)", position: "relative", overflow: "hidden" }}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, maxWidth: "100%" }} />
                  : <>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>📸</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{c.upload_photo}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>JPG, PNG, WEBP</p>
                    </>
                }
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              </div>

              <label style={labelStyle}>{c.or_describe}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={c.describe_placeholder}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />

              {/* Selector de nomenclador */}
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>{lang === "es" ? "Sistema de nomenclatura arancelaria" : "Tariff nomenclature system"}</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["HS", "NCM", "TARIC"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTariffSystem(s)}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${tariffSystem === s ? "#0057FF" : "rgba(255,255,255,0.15)"}`, background: tariffSystem === s ? "rgba(0,87,255,0.25)" : "transparent", color: tariffSystem === s ? "#FFF" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >{s}</button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  {tariffSystem === "HS" && (lang === "es" ? "Sistema Armonizado — internacional, 6 dígitos" : "Harmonized System — international, 6 digits")}
                  {tariffSystem === "NCM" && (lang === "es" ? "Nomenclatura Común MERCOSUR — Argentina, Brasil, Uruguay, Paraguay, 8 dígitos" : "MERCOSUR Common Nomenclature — 8 digits")}
                  {tariffSystem === "TARIC" && (lang === "es" ? "Arancel Integrado Europeo — Unión Europea, 10 dígitos" : "EU Integrated Tariff — 10 digits")}
                </p>
              </div>

              <div>
                <label style={labelStyle}>{c.hs_known} ({lang === "es" ? "opcional — la IA lo detecta por foto o descripción" : "optional — AI detects it from photo or description"})</label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder={tariffSystem === "NCM" ? "ej: 63014000" : tariffSystem === "TARIC" ? "ej: 6301400010" : "ej: 630140"}
                  style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: 1 }}
                />
              </div>
            </div>

            {/* PASO 2 — DATOS COMERCIALES */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{c.step2}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>{c.supplier_country}</label>
                  <select value={supplierCountry} onChange={(e) => setSupplierCountry(e.target.value)} style={{ ...inputStyle }}>
                    {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{c.destination} *</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ ...inputStyle, borderColor: !destination ? "rgba(239,68,68,0.5)" : "rgba(0,87,255,0.3)" }}>
                    <option value="">{lang === "es" ? "— Seleccioná —" : "— Select —"}</option>
                    {SUPPORTED_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option disabled>──────────</option>
                    {["Ecuador","Venezuela","Bolivia","Costa Rica","Guatemala","Panamá","Otros"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>{c.fob_unit} *</label>
                  <input type="number" value={fobUnit} onChange={(e) => setFobUnit(e.target.value)} placeholder="8.00" style={{ ...inputStyle, borderColor: !fobUnit ? "rgba(239,68,68,0.5)" : "rgba(0,87,255,0.3)" }} />
                </div>
                <div>
                  <label style={labelStyle}>{c.quantity}</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{c.freight_total} (USD)</label>
                <input type="number" value={freightTotal} onChange={(e) => setFreightTotal(e.target.value)} placeholder="200" style={inputStyle} />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{c.freight_hint}</p>
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: "100%", padding: "16px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.3)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? `⏳ ${c.analyzing}` : `🔍 ${c.analyze}`}
            </button>
          </div>

          {/* COLUMNA DERECHA — RESULTADO */}
          {result && (
            <div>
              {/* Botón PDF */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  onClick={() => exportViabilityPDF(result, { supplierCountry, destination, tariffSystem, fobUnit, quantity, lang })}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  📄 {c.export_pdf}
                </button>
              </div>

              {/* Producto identificado */}
              <div style={cardStyle}>
                <p style={sectionTitle}>🤖 {c.product_identified}</p>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{result.product.product_name || result.product.description}</p>
                {result.product.description && result.product.product_name && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{result.product.description}</p>
                )}
                {/* Código principal destacado según sistema elegido */}
                {(() => {
                  const sys = result.product.tariff_system || tariffSystem;
                  const primaryCode = sys === "NCM" ? result.product.ncm_code
                    : sys === "TARIC" ? result.product.taric_code
                    : result.product.hs_code;
                  return primaryCode ? (
                    <div style={{ background: "rgba(0,87,255,0.12)", border: "2px solid rgba(0,87,255,0.5)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{lang === "es" ? "Posición arancelaria identificada" : "Identified tariff position"} — {sys}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: "#0057FF", fontFamily: "monospace", letterSpacing: 2 }}>{primaryCode}</p>
                      {result.product.chapter && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.product.chapter}</p>}
                    </div>
                  ) : null;
                })()}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  {result.product.hs_code && result.product.hs_code !== "N/A" && (
                    <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#6B9FFF", fontFamily: "monospace" }}>HS: {result.product.hs_code}</span>
                  )}
                  {result.product.ncm_code && (
                    <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#6B9FFF", fontFamily: "monospace" }}>NCM: {result.product.ncm_code}</span>
                  )}
                  {result.product.taric_code && result.product.taric_code !== "null" && (
                    <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#6B9FFF", fontFamily: "monospace" }}>TARIC: {result.product.taric_code}</span>
                  )}
                  {/* Tasa: mostrar tachada si hay excepción */}
                  {result.product.exception_applied ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "rgba(239,68,68,0.45)", textDecoration: "line-through" }}>{c.tariff_rate}: {result.product.standard_rate}%</span>
                      <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: "#22c55e" }}>✓ {result.product.effective_rate}%</span>
                    </div>
                  ) : (
                    <span style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{c.tariff_rate}: {result.product.tariff_rate}%</span>
                  )}
                  {result.product.confidence && (
                    <span style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 11, color: "#C9A84C" }}>{c.confidence}: {result.product.confidence}</span>
                  )}
                </div>

                {/* Banner de excepción aplicada */}
                {result.product.exception_applied && (
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", marginBottom: 4 }}>
                      ✅ {lang === "es" ? "EXCEPCIÓN APLICADA" : "EXCEPTION APPLIED"}
                      {result.product.exception_type && result.product.exception_type !== "null" && (
                        <span style={{ marginLeft: 8, background: "rgba(34,197,94,0.2)", borderRadius: 4, padding: "1px 7px", fontFamily: "monospace" }}>{result.product.exception_type}</span>
                      )}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{result.product.exception_applied}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                      {lang === "es"
                        ? `Tasa general ${result.product.standard_rate}% → tasa efectiva aplicada: ${result.product.effective_rate}%`
                        : `Standard rate ${result.product.standard_rate}% → effective rate applied: ${result.product.effective_rate}%`}
                    </p>
                  </div>
                )}
                {result.product.requires_permits?.length > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>⚠ {c.requires_permits}</p>
                    {result.product.requires_permits.map((p: string, i: number) => (
                      <p key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>• {p}</p>
                    ))}
                  </div>
                )}
                {(!result.product.requires_permits || result.product.requires_permits.length === 0) && (
                  <p style={{ fontSize: 12, color: "#22c55e" }}>✓ {c.no_permits}</p>
                )}
              </div>

              {/* Estructura de costos */}
              <div style={cardStyle}>
                <p style={sectionTitle}>💰 {c.commercial_data}</p>
                {[
                  [c.fob_total, fmt(result.commercial.fob_total), undefined],
                  [c.freight, fmt(result.commercial.freight_total), undefined],
                  [c.insurance, fmt(result.commercial.insurance), undefined],
                  [c.cif_value, fmt(result.commercial.cif), "#0057FF"],
                ].map(([label, val, color], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{label as string}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: (color as string) || "#FFF" }}>{val as string}</span>
                  </div>
                ))}
              </div>

              {/* Tributos */}
              <div style={cardStyle}>
                <p style={sectionTitle}>🏛 {c.tax_breakdown} — {result.taxes.country}</p>
                {result.product.exception_applied && (
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <p style={{ fontSize: 11, color: "rgba(34,197,94,0.9)", lineHeight: 1.4 }}>
                      <strong>{lang === "es" ? "Cálculo con tasa efectiva" : "Calculated at effective rate"}</strong>
                      {" · "}{lang === "es" ? "Arancel aplicado" : "Applied tariff"}: <strong style={{ fontFamily: "monospace" }}>{result.product.effective_rate}%</strong>
                      {" "}{lang === "es" ? "(excepción activa)" : "(active exception)"}
                    </p>
                  </div>
                )}
                {result.taxes.lines.map((line: any, i: number) => {
                  const isOpen = expandedTax === i;
                  return (
                    <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      {/* Fila principal — clickeable */}
                      <div
                        onClick={() => setExpandedTax(isOpen ? null : i)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", cursor: "pointer" }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                            {line.code && line.code !== "—" && (
                              <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0,87,255,0.2)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 4, padding: "1px 6px", color: "#6B9FFF", fontFamily: "monospace" }}>{line.code}</span>
                            )}
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{line.name}</p>
                          </div>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{lang === "es" ? "Base" : "Base"}: {line.base} · {line.rate}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{fmt(line.amount)}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                        </div>
                      </div>
                      {/* Panel expandible */}
                      {isOpen && (
                        <div style={{ background: "rgba(0,87,255,0.06)", borderRadius: 8, padding: "12px 14px", marginBottom: 10, borderLeft: "3px solid rgba(0,87,255,0.4)" }}>
                          {line.description && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#6B9FFF", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {lang === "es" ? "¿Qué es y cuándo aplica?" : "What is it and when does it apply?"}
                              </p>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{line.description}</p>
                            </div>
                          )}
                          {line.legal_basis && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#C9A84C", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {lang === "es" ? "Base legal" : "Legal basis"}
                              </p>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "monospace", lineHeight: 1.5 }}>{line.legal_basis}</p>
                            </div>
                          )}
                          {line.exceptions && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {lang === "es" ? "Excepciones y casos especiales" : "Exceptions & special cases"}
                              </p>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{line.exceptions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{c.total_taxes}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>{fmt(result.taxes.total_taxes)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.tax_burden}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{result.taxes.tax_burden_pct}%</span>
                  </div>
                </div>

                {/* Costo nacionalizado */}
                <div style={{ marginTop: 10, padding: "14px 16px", background: "linear-gradient(135deg, rgba(0,87,255,0.2), rgba(0,87,255,0.08))", borderRadius: 10, border: "1px solid rgba(0,87,255,0.4)" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{c.landed_cost}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#FFF" }}>{fmt(result.taxes.landed_cost)}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{c.landed_unit}: <strong style={{ color: "#0057FF" }}>{fmt(result.analysis.landed_unit)}</strong></p>
                </div>
              </div>

              {/* Análisis precio de venta */}
              <div style={cardStyle}>
                <p style={sectionTitle}>📈 {c.price_analysis}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: c.suggested_min, val: result.analysis.suggested_price_min, color: "#22c55e" },
                    { label: c.suggested_ref, val: result.analysis.suggested_price_unit, color: "#C9A84C" },
                    { label: c.suggested_max, val: result.analysis.suggested_price_max, color: "#0057FF" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 14, textAlign: "center", border: `1px solid ${item.color}30` }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.3 }}>{item.label}</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{fmt(item.val)}</p>
                    </div>
                  ))}
                </div>

                {/* Recomendación modalidad */}
                <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", marginBottom: 6 }}>💡 {c.import_note}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{result.taxes.import_method_note}</p>
                </div>

                {/* Fuente y actualización */}
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
                  {c.updated} {result.taxes.last_updated}
                </p>

                <LegalDisclaimer lang={lang as "es" | "en"} compact />
              </div>

              {/* Botones continuar */}
              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/modulo02${buildOpQuery({
                    tariff_code: result.product.hs_code || "",
                    system: "HS",
                    origin: supplierCountry,
                    destination,
                    fob_value: fobUnit,
                    quantity,
                    base_rate: result.product.standard_rate != null ? String(result.product.standard_rate) : "",
                    pref_rate: result.product.effective_rate != null && result.product.effective_rate !== result.product.standard_rate ? String(result.product.effective_rate) : "",
                  })}`}
                  style={{ flex: 1, padding: "12px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                  {lang === "es" ? "📄 M02 — ¿Podés pagar menos aranceles? →" : "📄 M02 — Can you pay lower tariffs? →"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>© 2026 Global Tariff Hub — {lang === "es" ? "Datos de referencia. No reemplaza consulta profesional." : "Reference data. Does not replace professional advice."}</p>
      </footer>
    </div>
  );
}
