"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { exportCertificatePDF } from "@/lib/exportPDF";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import TermsCheckbox from "@/components/TermsCheckbox";

const COUNTRIES = [
  "Argentina", "Brasil", "Uruguay", "Paraguay", "Chile", "Bolivia", "Perú",
  "Colombia", "Ecuador", "Venezuela", "México", "Estados Unidos", "Canadá",
  "España", "Alemania", "Francia", "Italia", "China", "Japón", "Corea del Sur",
  "India", "Australia", "Reino Unido"
];

const AGREEMENTS = ["MERCOSUR", "TLC", "SGP", "Automático"];
const UNITS = ["kg", "toneladas", "litros", "unidades", "m²", "cajas", "pallets"];

const t = {
  es: {
    title: "Simulación de Operaciones con Certificado de Origen",
    subtitle: "Calculá tu ahorro arancelario",
    disclaimer_banner: "⚠ Esta herramienta es una SIMULACIÓN. No emite certificados de origen ni documentos aduaneros.",
    step1: "Paso 1 — Datos de la operación",
    origin: "País exportador",
    destination: "País importador",
    hs_code: "Código HS (opcional)",
    hs_placeholder: "Ej: 2204.21",
    fob_value: "Valor FOB (USD)",
    fob_placeholder: "Ej: 10000",
    quantity: "Cantidad",
    unit: "Unidad",
    agreement: "Acuerdo a simular",
    btn_simulate: "Simular ahorro",
    btn_simulating: "Calculando...",
    select_country: "Seleccioná un país",
    result_title: "Resultado de la simulación",
    without_cert: "Sin certificado",
    with_cert: "Con certificado",
    cert_cost: "Costo del certificado",
    net_saving: "Ahorro neto",
    roi: "ROI",
    recommendation: "Recomendación",
    processing: "Tiempo de tramitación",
    validity: "Validez",
    days: "días",
    issuer: "Organismo emisor",
    where: "Dónde tramitarlo",
    requirements_title: "Requisitos del certificado",
    origin_rule: "Regla de origen",
    documents: "Documentos necesarios",
    mandatory: "Obligatorio",
    optional: "Opcional",
    calc_cif: "📦 M03 — Calculadora CIF →",
    back_search: "← Volver al buscador",
    error: "Error en la simulación. Intentá de nuevo.",
    days_label: "días hábiles",
  },
  en: {
    title: "Certificate of Origin Operations Simulation",
    subtitle: "Calculate your tariff savings",
    disclaimer_banner: "⚠ This tool is a SIMULATION only. It does not issue certificates of origin or customs documents.",
    step1: "Step 1 — Operation data",
    origin: "Exporting country",
    destination: "Importing country",
    hs_code: "HS Code (optional)",
    hs_placeholder: "E.g: 2204.21",
    fob_value: "FOB Value (USD)",
    fob_placeholder: "E.g: 10000",
    quantity: "Quantity",
    unit: "Unit",
    agreement: "Agreement to simulate",
    btn_simulate: "Simulate savings",
    btn_simulating: "Calculating...",
    select_country: "Select a country",
    result_title: "Simulation result",
    without_cert: "Without certificate",
    with_cert: "With certificate",
    cert_cost: "Certificate cost",
    net_saving: "Net saving",
    roi: "ROI",
    recommendation: "Recommendation",
    processing: "Processing time",
    validity: "Validity",
    days: "days",
    issuer: "Issuing entity",
    where: "Where to apply",
    requirements_title: "Certificate requirements",
    origin_rule: "Rule of origin",
    documents: "Required documents",
    mandatory: "Mandatory",
    optional: "Optional",
    calc_cif: "📦 M03 — CIF Calculator →",
    back_search: "← Back to search",
    error: "Simulation error. Please try again.",
    days_label: "business days",
  },
};

type Lang = "es" | "en";

function Modulo03Inner({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tariffCode, setTariffCode] = useState("");
  const [tariffSystem, setTariffSystem] = useState("HS");
  const [fobValue, setFobValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [agreement, setAgreement] = useState("Automático");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rateInfo, setRateInfo] = useState<any>(null);

  // Pre-fill from Module 01 params
  useEffect(() => {
    const code = searchParams.get("tariff_code");
    const sys = searchParams.get("system");
    const orig = searchParams.get("origin");
    const dest = searchParams.get("destination");
    if (code) setTariffCode(code);
    if (sys) setTariffSystem(sys);
    if (orig) setOrigin(orig);
    if (dest) setDestination(dest);
  }, [searchParams]);

  const fetchTariffRate = async (code: string, sys: string, orig: string, dest: string) => {
    if (!code || !dest) return;
    setRateLoading(true);
    setRateInfo(null);
    try {
      const res = await fetch("/api/tariff-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tariff_code: code, system: sys, origin: orig, destination: dest, lang }),
      });
      const data = await res.json();
      if (!data.error) {
        setRateInfo(data);
        if (data.agreement && data.agreement !== "null") setAgreement(data.agreement);
      }
    } catch { /* silent */ } finally {
      setRateLoading(false);
    }
  };

  const c = t[lang];

  const handleSimulate = async () => {
    if (!origin || !destination || !fobValue) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, hs_code: tariffCode, fob_value: parseFloat(fobValue), quantity: quantity || "1", unit, agreement, lang }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const selectStyle = { ...inputStyle, cursor: "pointer" };
  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" as const };

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/modulo01" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{c.back_search}</Link>
          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 20, padding: "5px 16px", color: "#22c55e", fontSize: 12, fontWeight: 600 }}>Módulo 02</span>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 14, marginBottom: 6 }}>{c.title}</h1>
          <p style={{ color: "#C9A84C", fontSize: 15, fontWeight: 600 }}>{c.subtitle}</p>
        </div>

        {/* Disclaimer banner */}
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 18px", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>{c.disclaimer_banner}</p>
        </div>

        {/* Tip standalone: mostrar solo si no hay params de M01 */}
        {!searchParams.get("tariff_code") && !searchParams.get("origin") && (
          <div style={{ background: "rgba(0,87,255,0.08)", border: "1px solid rgba(0,87,255,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginBottom: 3 }}>
                {lang === "es" ? "Podés usar este módulo en forma independiente" : "You can use this module independently"}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                {lang === "es"
                  ? "Completá los campos manualmente. Si necesitás buscar tu código arancelario primero, usá el Módulo 01."
                  : "Fill in the fields manually. If you need to look up your tariff code first, use Module 01."}
              </p>
            </div>
            <Link href="/modulo01" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(0,87,255,0.25)", border: "1px solid rgba(0,87,255,0.5)", color: "#6B9FFF", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              🔍 {lang === "es" ? "Buscar código →" : "Search code →"}
            </Link>
          </div>
        )}

        {/* Formulario */}
        <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "rgba(255,255,255,0.8)" }}>{c.step1}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{c.origin}</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={selectStyle}>
                <option value="">— Seleccioná país —</option>
                {COUNTRIES.map((co) => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{c.destination}</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} style={selectStyle}>
                <option value="">— Seleccioná país —</option>
                {COUNTRIES.map((co) => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{c.fob_value}</label>
              <input type="number" value={fobValue} onChange={(e) => setFobValue(e.target.value)} placeholder={c.fob_placeholder} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{c.quantity}</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ej: 1000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{c.unit}</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} style={selectStyle}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{lang === "es" ? "Código arancelario (HS / NCM / TARIC)" : "Tariff code (HS / NCM / TARIC)"}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {["HS", "NCM", "TARIC"].map((s) => (
                <button key={s} onClick={() => setTariffSystem(s)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${tariffSystem === s ? "#0057FF" : "rgba(255,255,255,0.15)"}`, background: tariffSystem === s ? "rgba(0,87,255,0.25)" : "transparent", color: tariffSystem === s ? "#FFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={tariffCode}
                onChange={(e) => setTariffCode(e.target.value)}
                placeholder={tariffSystem === "NCM" ? "ej: 6203.42.00" : tariffSystem === "TARIC" ? "ej: 6203420010" : "ej: 6203.42"}
                style={{ ...inputStyle, flex: 1, fontFamily: "monospace", letterSpacing: 1 }}
              />
              <button
                onClick={() => fetchTariffRate(tariffCode, tariffSystem, origin, destination)}
                disabled={rateLoading || !tariffCode}
                style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: rateLoading || !tariffCode ? "rgba(0,87,255,0.2)" : "rgba(0,87,255,0.8)", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: rateLoading || !tariffCode ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
              >
                {rateLoading ? "⏳" : lang === "es" ? "🔍 Buscar arancel" : "🔍 Look up tariff"}
              </button>
            </div>
            {rateInfo && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: "rgba(0,87,255,0.08)", border: "1px solid rgba(0,87,255,0.25)", borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{rateInfo.description}</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{lang === "es" ? "Tasa base:" : "Base rate:"} {rateInfo.base_rate}%</span>
                  {rateInfo.has_preferential && <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{lang === "es" ? "Preferencial:" : "Preferential:"} {rateInfo.preferential_rate}%</span>}
                  {rateInfo.agreement && rateInfo.agreement !== "null" && <span style={{ fontSize: 12, color: "#C9A84C" }}>📋 {rateInfo.agreement}</span>}
                </div>
                {rateInfo.agreement_note && rateInfo.agreement_note !== "null" && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{rateInfo.agreement_note}</p>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{c.agreement}</label>
            <select value={agreement} onChange={(e) => setAgreement(e.target.value)} style={selectStyle}>
              {AGREEMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} lang={lang} />

          <button onClick={handleSimulate} disabled={loading || !fobValue || !termsAccepted} style={{ marginTop: 12, width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading || !fobValue || !termsAccepted ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, cursor: loading || !fobValue || !termsAccepted ? "not-allowed" : "pointer" }}>
            {loading ? c.btn_simulating : c.btn_simulate}
          </button>
        </div>

        {/* Resultados */}
        {result && (
          <div>
            {/* Botón exportar PDF */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => exportCertificatePDF(result, { origin, destination, tariffCode, tariffSystem, fobValue, lang })}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                📄 {lang === "es" ? "Exportar informe de simulación PDF" : "Export simulation report PDF"}
              </button>
            </div>

            {/* Resumen ahorro */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(34,197,94,0.3)", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{c.result_title}</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 10, padding: "16px", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{c.without_cert}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>USD {result.tariff_without?.amount?.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.tariff_without?.rate}</p>
                </div>
                <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 10, padding: "16px", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{c.with_cert} — {result.agreement?.name}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>USD {result.tariff_with?.amount?.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.tariff_with?.rate}</p>
                </div>
                <div style={{ background: "rgba(201,168,76,0.1)", borderRadius: 10, padding: "16px", border: "1px solid rgba(201,168,76,0.3)", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{c.cert_cost}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#C9A84C" }}>USD {result.certificate_cost?.amount?.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.certificate_cost?.issuer}</p>
                </div>
              </div>

              {/* Ahorro neto destacado */}
              <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(0,87,255,0.15))", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{c.net_saving}</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#22c55e" }}>USD {result.savings?.net?.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{c.roi}</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#C9A84C" }}>{result.savings?.roi_percent}%</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#22c55e", marginTop: 12, fontWeight: 600 }}>✓ {result.savings?.recommendation}</p>
              </div>

              {/* Info del certificado */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  [c.processing, `${result.certificate_cost?.processing_days} ${c.days_label}`],
                  [c.validity, `${result.certificate_cost?.validity_days} ${c.days}`],
                  [c.issuer, result.certificate_cost?.issuer],
                ].map(([label, value], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{c.requirements_title}</h2>

              <div style={{ background: "rgba(201,168,76,0.08)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: "1px solid rgba(201,168,76,0.2)" }}>
                <p style={{ fontSize: 12, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>{c.origin_rule}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{result.requirements?.origin_rule}</p>
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>{c.documents}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {result.requirements?.documents?.map((doc: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `1px solid ${doc.mandatory ? "rgba(0,87,255,0.2)" : "rgba(255,255,255,0.07)"}` }}>
                    <span style={{ fontSize: 16, marginTop: 1 }}>{doc.mandatory ? "✅" : "📋"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{doc.name}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: doc.mandatory ? "rgba(0,87,255,0.2)" : "rgba(255,255,255,0.08)", color: doc.mandatory ? "#0057FF" : "rgba(255,255,255,0.4)" }}>
                          {doc.mandatory ? c.mandatory : c.optional}
                        </span>
                      </div>
                      {doc.notes && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{doc.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {result.requirements?.where_to_get && (
                <div style={{ background: "rgba(0,87,255,0.08)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(0,87,255,0.2)" }}>
                  <p style={{ fontSize: 12, color: "#0057FF", fontWeight: 700, marginBottom: 4 }}>{c.where}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{result.requirements?.issuing_entity}</p>
                </div>
              )}
            </div>

            {/* Acción CIF */}
            <div style={{ textAlign: "center" }}>
              <Link href="/modulo03" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 10, background: "linear-gradient(135deg, #0057FF, #003DB3)", color: "#FFFFFF", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                {c.calc_cif}
              </Link>
            </div>

            <LegalDisclaimer lang={lang as "es" | "en"} context="certificate" />
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub — Simulación de referencia. No emite documentos oficiales.</p>
      </footer>
    </div>
  );
}

export default function Modulo03({ defaultLang = "es" }: { defaultLang?: Lang }) {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}><Modulo03Inner defaultLang={defaultLang} /></Suspense>;
}
