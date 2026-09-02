"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { exportCertificatePDF } from "@/lib/exportPDF";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { getTradeAgreement } from "@/lib/tradeAgreements";
import { buildOpQuery, readOpContext } from "@/lib/opContext";
import { fetchWithDeadline, describeAIError, type AIErrorView } from "@/lib/aiClient";
import ApiErrorBox from "@/components/ApiErrorBox";
import TariffValue from "@/components/TariffValue";

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
    title: "¿Podés pagar menos aranceles de importación?",
    subtitle: "Análisis de preferencia arancelaria por origen · Comparamos cuánto pagás con y sin certificado de origen, según el acuerdo comercial entre los países.",
    disclaimer_banner: "Herramienta de análisis previo. No emite certificados de origen ni documentos aduaneros; el resultado es orientativo y debe validarse con un despachante de aduana habilitado.",
    step1: "Paso 1 — Datos de la operación",
    origin: "País exportador",
    destination: "País importador",
    hs_code: "Código HS (opcional)",
    hs_placeholder: "Ej: 2204.21",
    fob_value: "Valor FOB (USD)",
    fob_placeholder: "Ej: 10000",
    quantity: "Cantidad",
    unit: "Unidad",
    agreement: "Acuerdo a evaluar",
    btn_simulate: "Analizar ahorro",
    btn_simulating: "Analizando...",
    select_country: "Seleccioná un país",
    result_title: "Resultado del análisis",
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
    all_modules: "◇ Todos los módulos",
    error: "Error en el análisis. Intentá de nuevo.",
    days_label: "días hábiles",
    // Pregunta previa
    precheck_title: "¿Tenés un certificado de origen para esta operación?",
    precheck_sub: "Nos ayuda a mostrarte el análisis más útil para tu caso.",
    precheck_yes: "Sí",
    precheck_no: "No",
    precheck_unknown: "No sé qué es esto",
    precheck_change: "Cambiar respuesta",
    precheck_answer_yes: "Ya tenés un certificado de origen",
    precheck_answer_no: "Todavía no tenés un certificado de origen",
    precheck_answer_unknown: "Querés entender qué es un certificado de origen",
    explain_title: "¿Qué es un certificado de origen?",
    explain_body: "Es un documento oficial que acredita en qué país fue fabricado un producto. Cuando existe un acuerdo comercial entre el país exportador y el importador, presentar este certificado en la aduana permite pagar un arancel reducido — muchas veces 0%. Lo emite una entidad habilitada (cámara de comercio, ministerio) en el país de origen. Esta herramienta te muestra cuánto podrías ahorrar y qué necesitás para tramitarlo — no lo emite.",
    // Convenio
    agreement_detected: "Acuerdo comercial detectado",
    agreement_none_title: "Sin acuerdo comercial vigente",
    agreement_none_msg: "No existe un acuerdo comercial vigente entre estos dos países para este producto. El arancel aplicable es el general.",
    general_tariff: "Arancel general aplicable",
  },
  en: {
    title: "Can you pay lower import tariffs?",
    subtitle: "Preferential tariff analysis by origin · We compare what you pay with and without a certificate of origin, based on the trade agreement between the countries.",
    disclaimer_banner: "Pre-operation analysis tool. It does not issue certificates of origin or customs documents; the result is indicative and must be verified with a licensed customs broker.",
    step1: "Step 1 — Operation data",
    origin: "Exporting country",
    destination: "Importing country",
    hs_code: "HS Code (optional)",
    hs_placeholder: "E.g: 2204.21",
    fob_value: "FOB Value (USD)",
    fob_placeholder: "E.g: 10000",
    quantity: "Quantity",
    unit: "Unit",
    agreement: "Agreement to assess",
    btn_simulate: "Analyze savings",
    btn_simulating: "Analyzing...",
    select_country: "Select a country",
    result_title: "Analysis result",
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
    all_modules: "◇ All modules",
    error: "Analysis error. Please try again.",
    days_label: "business days",
    // Pre-question
    precheck_title: "Do you have a certificate of origin for this operation?",
    precheck_sub: "It helps us show you the most useful analysis for your case.",
    precheck_yes: "Yes",
    precheck_no: "No",
    precheck_unknown: "I don't know what this is",
    precheck_change: "Change answer",
    precheck_answer_yes: "You already have a certificate of origin",
    precheck_answer_no: "You don't have a certificate of origin yet",
    precheck_answer_unknown: "You want to understand what a certificate of origin is",
    explain_title: "What is a certificate of origin?",
    explain_body: "It's an official document certifying the country where a product was manufactured. When a trade agreement exists between the exporting and importing countries, presenting this certificate at customs allows a reduced tariff — often 0%. It is issued by an authorized entity (chamber of commerce, ministry) in the country of origin. This tool shows how much you could save and what you need to obtain it — it does not issue it.",
    // Agreement
    agreement_detected: "Trade agreement detected",
    agreement_none_title: "No trade agreement in force",
    agreement_none_msg: "There is no trade agreement in force between these two countries for this product. The applicable tariff is the general one.",
    general_tariff: "Applicable general tariff",
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
  const [apiError, setApiError] = useState<AIErrorView | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState<any>(null);
  const [rateApiError, setRateApiError] = useState<AIErrorView | null>(null);
  // Pregunta previa: ¿tenés certificado de origen? (si | no | nose)
  const [hasCert, setHasCert] = useState<"si" | "no" | "nose" | null>(null);

  // ¿Existe acuerdo comercial vigente entre origen y destino?
  const convenio = useMemo(() => getTradeAgreement(origin, destination), [origin, destination]);

  // Países elegidos pero SIN acuerdo aplicable → no hay ahorro que analizar
  // (no se muestra el análisis ni se consume crédito). Depende del acuerdo,
  // no de si el usuario tiene certificado de origen.
  const noDeal = !!origin && !!destination && origin !== destination && !convenio;

  // Pre-fill desde el contexto de operación que llega de otro módulo
  useEffect(() => {
    const ctx = readOpContext(searchParams);
    if (ctx.tariff_code) setTariffCode(ctx.tariff_code);
    if (ctx.system) setTariffSystem(ctx.system);
    if (ctx.origin) setOrigin(ctx.origin);
    if (ctx.destination) setDestination(ctx.destination);
    if (ctx.fob_value) setFobValue(ctx.fob_value);
    if (ctx.quantity) setQuantity(ctx.quantity);
    if (ctx.base_rate || ctx.pref_rate) {
      setRateInfo({
        base_rate: ctx.base_rate ? Number(ctx.base_rate) : undefined,
        preferential_rate: ctx.pref_rate ? Number(ctx.pref_rate) : undefined,
        has_preferential: !!ctx.pref_rate,
        from_context: true,
      });
    }
  }, [searchParams]);

  const fetchTariffRate = async (code: string, sys: string, orig: string, dest: string) => {
    if (!code || !dest) return;
    setRateLoading(true);
    setRateInfo(null);
    setRateApiError(null);
    try {
      const res = await fetchWithDeadline("/api/tariff-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tariff_code: code, system: sys, origin: orig, destination: dest, lang }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error) {
        const view = describeAIError({ lang, status: res.status, payload: data });
        if (view.needsLogin) { window.location.href = "/login"; return; }
        setRateApiError(view);
        return;
      }
      setRateInfo(data);
      if (data.agreement && data.agreement !== "null") setAgreement(data.agreement);
    } catch (err) {
      setRateApiError(describeAIError({ lang, thrown: err }));
    } finally {
      setRateLoading(false);
    }
  };

  const c = t[lang];

  const handleSimulate = async () => {
    if (!origin || !destination || !fobValue) return;
    if (!convenio) return; // sin acuerdo no hay análisis de ahorro (defensa; el botón no se renderiza)
    setError("");
    setApiError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetchWithDeadline("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, hs_code: tariffCode, fob_value: parseFloat(fobValue), quantity: quantity || "1", unit, agreement, lang }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error) {
        const view = describeAIError({ lang, status: res.status, payload: data });
        if (view.needsLogin) { window.location.href = "/login"; return; }
        setApiError(view);
        return;
      }
      setResult(data);
    } catch (err) {
      setApiError(describeAIError({ lang, thrown: err }));
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
          <Link href="/modulos" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{c.all_modules}</Link>
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
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 14, marginBottom: 8 }}>{c.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 400, lineHeight: 1.6, maxWidth: 620, margin: "0 auto" }}>{c.subtitle}</p>
        </div>

        {/* Disclaimer banner — aviso legal en segundo plano */}
        <div style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 16px", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400, lineHeight: 1.6 }}>{c.disclaimer_banner}</p>
        </div>

        {/* Pregunta previa: ¿tenés certificado de origen? */}
        {hasCert === null ? (
          <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{c.precheck_title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{c.precheck_sub}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                { key: "si" as const, label: c.precheck_yes, icon: "✅" },
                { key: "no" as const, label: c.precheck_no, icon: "🚫" },
                { key: "nose" as const, label: c.precheck_unknown, icon: "❓" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setHasCert(opt.key)}
                  style={{ padding: "16px 14px", borderRadius: 12, border: "1px solid rgba(0,87,255,0.35)", background: "rgba(0,87,255,0.08)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "center", lineHeight: 1.4 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,87,255,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,87,255,0.08)"; }}
                >
                  <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Resumen de la respuesta previa */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {hasCert === "si" ? `✅ ${c.precheck_answer_yes}` : hasCert === "no" ? `🚫 ${c.precheck_answer_no}` : `❓ ${c.precheck_answer_unknown}`}
              </span>
              <button onClick={() => setHasCert(null)} style={{ background: "none", border: "none", color: "#6B9FFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{c.precheck_change}</button>
            </div>

            {/* Explicación para quien no sabe qué es */}
            {hasCert === "nose" && (
              <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C", marginBottom: 8 }}>{c.explain_title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{c.explain_body}</p>
              </div>
            )}

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

          {/* Verificación de acuerdo comercial vigente entre origen y destino */}
          {origin && destination && origin !== destination && (
            convenio ? (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 3 }}>✓ {c.agreement_detected}: {convenio.name}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{convenio.scope}</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>{c.agreement_none_title}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{c.agreement_none_msg}</p>
              </div>
            )
          )}

          {noDeal ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "20px 22px" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                {lang === "es"
                  ? "Sin un acuerdo aplicable no hay ahorro arancelario para analizar. Para estimar el costo total de la operación, usá el Módulo 03."
                  : "Without an applicable agreement there is no tariff saving to analyze. To estimate the full cost of the operation, use Module 03."}
              </p>
              {rateInfo?.tariff?.general && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                  <TariffValue datum={rateInfo.tariff.general} lang={lang} label={c.general_tariff} />
                </div>
              )}
              <Link
                href={`/modulo03${buildOpQuery({ origin, destination, tariff_code: tariffCode, system: tariffSystem, fob_value: fobValue, quantity, base_rate: rateInfo?.base_rate != null ? String(rateInfo.base_rate).replace("%", "") : "", base_rate_status: rateInfo?.base_rate_status ?? "" })}`}
                style={{ display: "inline-block", marginTop: 16, padding: "10px 18px", borderRadius: 8, background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", color: "#0057FF", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                📦 {lang === "es" ? "Ir al Módulo 03 →" : "Go to Module 03 →"}
              </Link>
            </div>
          ) : (
          <>
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
                {rateInfo.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{rateInfo.description}</p>}
                {rateInfo.tariff?.general && <TariffValue datum={rateInfo.tariff.general} lang={lang} label={lang === "es" ? "Tasa arancelaria" : "Tariff rate"} />}
                {rateInfo.tariff?.preferential && rateInfo.tariff.preferential.value != null && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <TariffValue datum={rateInfo.tariff.preferential} lang={lang} label={lang === "es" ? "Tasa preferencial" : "Preferential rate"} />
                  </div>
                )}
                {rateInfo.agreement && rateInfo.agreement !== "null" && <p style={{ fontSize: 12, color: "#C9A84C", marginTop: 8, marginBottom: 0 }}>📋 {rateInfo.agreement}</p>}
                {rateInfo.agreement_note && rateInfo.agreement_note !== "null" && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, marginBottom: 0 }}>{rateInfo.agreement_note}</p>
                )}
              </div>
            )}
            {rateApiError && (
              <ApiErrorBox
                view={rateApiError}
                lang={lang}
                onRetry={() => fetchTariffRate(tariffCode, tariffSystem, origin, destination)}
                retrying={rateLoading}
              />
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{c.agreement}</label>
            <select value={agreement} onChange={(e) => setAgreement(e.target.value)} style={selectStyle}>
              {AGREEMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          {apiError && <ApiErrorBox view={apiError} lang={lang} onRetry={handleSimulate} retrying={loading} />}

          <button onClick={handleSimulate} disabled={loading || !fobValue} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading || !fobValue ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, cursor: loading || !fobValue ? "not-allowed" : "pointer" }}>
            {loading ? c.btn_simulating : c.btn_simulate}
          </button>
          </>
          )}
        </div>

        {/* Resultados */}
        {result && (
          <div>
            {/* Verificación de acuerdo comercial */}
            {convenio ? (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 3 }}>✓ {c.agreement_detected}: {convenio.name}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{convenio.scope}</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.78)", marginBottom: 6 }}>{c.agreement_none_title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{c.agreement_none_msg}</p>
              </div>
            )}

            {/* Botón exportar PDF — sólo con comparativo completo */}
            {convenio && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => exportCertificatePDF(result, { origin, destination, tariffCode, tariffSystem, fobValue, lang })}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                📄 {lang === "es" ? "Exportar informe de análisis (PDF)" : "Export analysis report (PDF)"}
              </button>
            </div>
            )}

            {/* Resumen ahorro */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 28, border: "1px solid rgba(34,197,94,0.3)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{c.result_title}</h2>
              </div>

              {result.tariff?.general && (
                <div style={{ marginBottom: 18, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                  <TariffValue datum={result.tariff.general} lang={lang} label={c.general_tariff} />
                </div>
              )}

              {result.tariff_not_determined ? (
                <div style={{ background: "#0D1B3E", borderRadius: 12, padding: "20px", border: "1px solid rgba(148,163,184,0.4)" }}>
                  <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{result.message}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                    {lang === "es"
                      ? "Sin una tasa arancelaria no se puede comparar el escenario con y sin certificado. Verificá la posición en el sistema oficial del país importador o con un despachante."
                      : "Without a tariff rate the with/without-certificate scenario can't be compared. Verify the position in the importing country's official system or with a customs broker."}
                  </p>
                </div>
              ) : (result.tariff_with && result.savings) ? (
              <>
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
              </>
              ) : (
                <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 12, padding: "22px", border: "1px solid rgba(239,68,68,0.25)", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{c.general_tariff}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#ef4444" }}>USD {result.tariff_without?.amount?.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.tariff_without?.rate}</p>
                </div>
              )}
            </div>

            {/* Requisitos — sólo cuando hay acuerdo comercial */}
            {convenio && (
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
            )}

            {/* Acción CIF — arrastra el contexto de la operación */}
            <div style={{ textAlign: "center" }}>
              <Link
                href={`/modulo03${(() => {
                  const g = result?.tariff?.general ?? rateInfo?.tariff?.general;
                  const p = result?.tariff?.preferential ?? rateInfo?.tariff?.preferential;
                  return buildOpQuery({
                    origin, destination,
                    tariff_code: tariffCode, system: tariffSystem,
                    fob_value: fobValue, quantity,
                    base_rate: g && g.status === "referential" && g.value != null ? String(g.value) : "",
                    base_rate_status: g?.status ?? "not_determined",
                    pref_rate: p && p.value != null ? String(p.value) : "",
                    pref_rate_status: p ? p.status : "",
                  });
                })()}`}
                style={{ display: "inline-block", padding: "14px 28px", borderRadius: 10, background: "linear-gradient(135deg, #0057FF, #003DB3)", color: "#FFFFFF", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                {c.calc_cif}
              </Link>
            </div>

            <LegalDisclaimer lang={lang as "es" | "en"} compact />
          </div>
        )}
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>© 2025 Global Tariff Hub — Análisis de referencia. No emite documentos oficiales.</p>
      </footer>
    </div>
  );
}

export default function Modulo03({ defaultLang = "es" }: { defaultLang?: Lang }) {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}><Modulo03Inner defaultLang={defaultLang} /></Suspense>;
}
