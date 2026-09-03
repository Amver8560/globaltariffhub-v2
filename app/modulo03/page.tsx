"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { exportCIFPDF } from "@/lib/exportPDF";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { buildOpQuery, readOpContext } from "@/lib/opContext";
import { fetchWithDeadline, describeAIError, type AIErrorView } from "@/lib/aiClient";
import ApiErrorBox from "@/components/ApiErrorBox";
import TariffValue from "@/components/TariffValue";
import {
  SUPPORTED_INCOTERMS,
  INCOTERM_META,
  ASK_FOR_BASE,
  ALREADY_IN_PRICE,
  type Incoterm,
} from "@/lib/incoterms";
import {
  computeLandedCost,
  toMoney,
  toInsurance,
  type CostInput,
  type CostResult,
  type OtherCost,
} from "@/lib/landedCost";
import { useFxCurrency, FX_CURRENCIES } from "@/lib/useFxCurrency";

const NOT_INCLUDED_NOTICE_ES =
  "Esta estimación no incluye impuestos internos ni otras cargas que puedan corresponder según la jurisdicción y las características de la operación.";
const NOT_INCLUDED_NOTICE_EN =
  "This estimate does not include internal taxes or other charges that may apply depending on the jurisdiction and the characteristics of the operation.";

const OTHER_COST_KEYS = ["import_clearance", "dest_port", "dest_inland"] as const;
type OtherCostKey = (typeof OTHER_COST_KEYS)[number];

const t = {
  es: {
    title: "Calculadora de costos de operación",
    subtitle:
      "¿Cuánto podría costar traerlo? Partimos del precio comercial cotizado y el Incoterm para estimar la base del arancel y la operación, dentro del alcance de GTH.",
    incoterm_title: "Incoterm del precio cotizado",
    incoterm_pick: "Elegí el Incoterm correspondiente al precio informado.",
    incoterm_help: "Determina qué costos ya están contenidos en el precio y cuáles hay que agregar.",
    seller_covers: "El vendedor cubre",
    buyer_covers: "El comprador cubre",
    section_price: "Precio comercial cotizado",
    declared_value: "Precio cotizado",
    quantity: "Cantidad",
    currency: "Moneda",
    section_components: "Componentes a agregar según el Incoterm",
    pre_shipment: "Costos de pre-embarque",
    pre_shipment_help: "Costos hasta dejar la mercadería lista para el transporte internacional.",
    intl_freight: "Flete internacional",
    insurance: "Seguro internacional",
    insurance_kind_amount: "Monto",
    insurance_kind_percent: "%",
    already_in_price: "Ya incluido en el precio según el Incoterm — no se vuelve a sumar",
    nothing_to_add: "Con este Incoterm no hay componentes que agregar a la base.",
    section_other: "Otros costos de la operación (opcional)",
    other_help: "Se muestran aparte. No entran a la base ni al arancel. Sólo se suman los que informes.",
    oc_import_clearance: "Despacho de importación",
    oc_dest_port: "Gastos portuarios en destino",
    oc_dest_inland: "Transporte interno en destino",
    section_tariff: "Arancel",
    tariff_rate: "Tasa arancelaria (%)",
    with_cert: "Con certificado preferencial",
    pref_rate: "Tasa preferencial (%)",
    section_result: "Resultado",
    base_known: "Base estimada para el arancel",
    base_note: "La base definitiva aplicable puede variar según la normativa de la jurisdicción importadora y debe validarse cuando corresponda.",
    not_informed: "No informado",
    tariff_amount: "Arancel",
    op_estimate: "Estimación de la operación dentro del alcance de GTH",
    provisional: "provisional",
    unit_cost: "Costo por unidad",
    with_cert_estimate: "Con certificado preferencial",
    saving: "Ahorro estimado con certificado",
    other_declared: "Otros costos de la operación que informaste",
    total_with_other: "Total incluyendo lo que informaste",
    total_with_other_sub: "estimación GTH + otros costos informados — se muestran por separado",
    btn_pdf: "Exportar informe PDF",
    back: "← Volver",
    to_m2: "📄 M02 — ¿Podés pagar menos aranceles? →",
    to_m4: "📦 M04 — Viabilidad de la importación →",
    disclaimer: "⚠ Cálculo de referencia. Los valores reales pueden variar según el transportista, aduana y tipo de cambio.",
    empty: "Elegí el Incoterm e ingresá el precio cotizado para ver la estimación.",
  },
  en: {
    title: "Operation cost calculator",
    subtitle:
      "What could it cost to bring it in? We start from the quoted commercial price and the Incoterm to estimate the duty base and the operation, within GTH's scope.",
    incoterm_title: "Incoterm of the quoted price",
    incoterm_pick: "Choose the Incoterm that corresponds to the quoted price.",
    incoterm_help: "It determines which costs are already contained in the price and which must be added.",
    seller_covers: "Seller covers",
    buyer_covers: "Buyer covers",
    section_price: "Quoted commercial price",
    declared_value: "Quoted price",
    quantity: "Quantity",
    currency: "Currency",
    section_components: "Components to add for this Incoterm",
    pre_shipment: "Pre-shipment costs",
    pre_shipment_help: "Costs to get the goods ready for international transport.",
    intl_freight: "International freight",
    insurance: "International insurance",
    insurance_kind_amount: "Amount",
    insurance_kind_percent: "%",
    already_in_price: "Already in the price for this Incoterm — not added again",
    nothing_to_add: "With this Incoterm there are no components to add to the base.",
    section_other: "Other operation costs (optional)",
    other_help: "Shown separately. They don't enter the base or the duty. Only the ones you inform are added.",
    oc_import_clearance: "Import customs clearance",
    oc_dest_port: "Destination port charges",
    oc_dest_inland: "Inland transport at destination",
    section_tariff: "Tariff",
    tariff_rate: "Tariff rate (%)",
    with_cert: "With preferential certificate",
    pref_rate: "Preferential rate (%)",
    section_result: "Result",
    base_known: "Estimated duty base",
    base_note: "The final applicable base may vary under the importing jurisdiction's rules and must be validated where applicable.",
    not_informed: "Not informed",
    tariff_amount: "Tariff",
    op_estimate: "Operation estimate within GTH's scope",
    provisional: "provisional",
    unit_cost: "Cost per unit",
    with_cert_estimate: "With preferential certificate",
    saving: "Estimated saving with certificate",
    other_declared: "Other operation costs you informed",
    total_with_other: "Total including what you informed",
    total_with_other_sub: "GTH estimate + other informed costs — shown separately",
    btn_pdf: "Export PDF report",
    back: "← Back",
    to_m2: "📄 M02 — Can you pay lower tariffs? →",
    to_m4: "📦 M04 — Import viability →",
    disclaimer: "⚠ Reference calculation. Actual values may vary by carrier, customs and exchange rate.",
    empty: "Choose the Incoterm and enter the quoted price to see the estimate.",
  },
};

type Lang = "es" | "en";

function ModuloInner({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(defaultLang);
  const c = t[lang];

  // ── Tariff lookup (Bloque 2 — intacto) ──
  const [tariffCode, setTariffCode] = useState("");
  const [tariffSystem, setTariffSystem] = useState("HS");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState<any>(null);
  const [rateError, setRateError] = useState("");
  const [rateApiError, setRateApiError] = useState<AIErrorView | null>(null);
  const [tariffNotDetermined, setTariffNotDetermined] = useState(false);
  const [rateReferential, setRateReferential] = useState(false);
  // Bloque 3 · continuidad: TariffDatum recibido de M01/M02. Si llega, se reutiliza
  // tal cual y NO se vuelve a consultar las fuentes.
  const [receivedDatum, setReceivedDatum] = useState<any>(null);
  const [receivedPrefDatum, setReceivedPrefDatum] = useState<any>(null);
  const cameWithDatum = !!searchParams.get("tariff_datum");
  const [tariffRate, setTariffRate] = useState("");
  const [withCert, setWithCert] = useState(false);
  const [prefRate, setPrefRate] = useState("0");

  // ── Bloque 3 — condiciones comerciales y componentes ──
  const [incoterm, setIncoterm] = useState<string>("");
  const fx = useFxCurrency(searchParams.get("currency") || "");
  const [declaredValue, setDeclaredValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [preShipment, setPreShipment] = useState("");
  const [intlFreight, setIntlFreight] = useState("");
  const [insuranceKind, setInsuranceKind] = useState<"amount" | "percent">("amount");
  const [insuranceValue, setInsuranceValue] = useState("");
  const [otherCosts, setOtherCosts] = useState<Record<OtherCostKey, string>>({
    import_clearance: "",
    dest_port: "",
    dest_inland: "",
  });

  const [result, setResult] = useState<CostResult | null>(null);
  const [resultPref, setResultPref] = useState<CostResult | null>(null);

  const n = (v: string) => parseFloat(v) || 0;

  // ── Prefill desde el contexto acumulativo de la operación ──
  useEffect(() => {
    const ctx = readOpContext(searchParams);
    if (ctx.tariff_code) setTariffCode(ctx.tariff_code);
    if (ctx.system) setTariffSystem(ctx.system);
    if (ctx.origin) setOrigin(ctx.origin);
    if (ctx.destination) setDestination(ctx.destination);
    if (ctx.fob_value) setDeclaredValue(ctx.fob_value);
    if (ctx.quantity) setQuantity(ctx.quantity);
    if (ctx.incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(ctx.incoterm)) setIncoterm(ctx.incoterm);
    if (ctx.currency) fx.setCurrency(ctx.currency);
    if (ctx.intl_freight != null) setIntlFreight(ctx.intl_freight);
    if (ctx.pre_shipment != null) setPreShipment(ctx.pre_shipment);
    if (ctx.insurance_kind === "percent" || ctx.insurance_kind === "amount") setInsuranceKind(ctx.insurance_kind);
    if (ctx.insurance_value != null) setInsuranceValue(ctx.insurance_value);

    // Bloque 3 · continuidad: el TariffDatum resuelto en M01/M02 viaja completo.
    // Se reutiliza tal cual (value, status, source, as_of, nivel). NO se re-consulta.
    let usedDatum = false;
    if (ctx.tariff_datum) {
      try {
        const d = JSON.parse(ctx.tariff_datum);
        if (d && typeof d === "object") {
          setReceivedDatum(d);
          usedDatum = true;
          if (d.status === "not_determined" || d.value == null) {
            setTariffRate("");
            setTariffNotDetermined(true);
            setRateReferential(false);
          } else {
            setTariffRate(String(d.value));
            setTariffNotDetermined(false);
            setRateReferential(d.status === "referential");
          }
        }
      } catch { /* datum mal formado: se ignora y se cae a la lógica normal */ }
    }
    if (ctx.pref_tariff_datum) {
      try {
        const dp = JSON.parse(ctx.pref_tariff_datum);
        if (dp && typeof dp === "object" && dp.value != null) {
          setReceivedPrefDatum(dp);
          setPrefRate(String(dp.value));
          setWithCert(true);
        }
      } catch { /* ignora */ }
    }

    // Compatibilidad: si no vino el datum completo, usar los campos sueltos.
    if (!usedDatum && ctx.base_rate && ctx.base_rate_status !== "not_determined") {
      setTariffRate(ctx.base_rate);
      setRateReferential(ctx.base_rate_status === "referential");
    }
    if (!ctx.pref_tariff_datum && ctx.pref_rate && ctx.pref_rate_status !== "not_determined") {
      setPrefRate(ctx.pref_rate);
      setWithCert(true);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-fetch de tasa SÓLO si NO llegó un TariffDatum en la URL ──
  // Una operación, un TariffDatum: si el recorrido ya trae uno válido, no se
  // vuelve a ejecutar resolveTariff() al entrar.
  useEffect(() => {
    if (searchParams.get("tariff_datum")) return;
    const code = searchParams.get("tariff_code");
    const sys = searchParams.get("system") || "HS";
    const orig = searchParams.get("origin");
    const dest = searchParams.get("destination");
    if (code && dest) fetchTariffRate(code, sys, orig || "", dest);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTariffRate = async (code: string, sys: string, orig: string, dest: string) => {
    if (!code) return;
    if (!dest) { setRateError(lang === "es" ? "Seleccioná el país de destino." : "Select destination country."); return; }
    setRateError("");
    setRateApiError(null);
    setRateLoading(true);
    setRateInfo(null);
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
      if (typeof data.base_rate === "string" && data.base_rate) {
        setTariffRate(data.base_rate.replace("%", "").trim());
        setTariffNotDetermined(false);
        setRateReferential(data.base_rate_status === "referential");
      } else {
        setTariffRate("");
        setTariffNotDetermined(true);
        setRateReferential(false);
      }
      if (typeof data.preferential_rate === "string" && data.preferential_rate) {
        setPrefRate(data.preferential_rate.replace("%", "").trim());
        setWithCert(true);
      }
    } catch (err) {
      setRateApiError(describeAIError({ lang, thrown: err }));
    } finally {
      setRateLoading(false);
    }
  };

  // ── Motor canónico de costos ──
  const otherCostsArr: OtherCost[] = useMemo(
    () => [
      { label: c.oc_import_clearance, amount: toMoney(otherCosts.import_clearance) },
      { label: c.oc_dest_port, amount: toMoney(otherCosts.dest_port) },
      { label: c.oc_dest_inland, amount: toMoney(otherCosts.dest_inland) },
    ],
    [otherCosts, c],
  );

  useEffect(() => {
    if (!incoterm || !(SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm)) {
      setResult(null);
      setResultPref(null);
      return;
    }
    const dv = n(declaredValue);
    const rate = tariffRate.trim() === "" ? null : n(tariffRate);
    const dutyStatus: "referential" | "not_determined" =
      tariffNotDetermined || rate === null ? "not_determined" : "referential";

    const buildInput = (r: number | null): CostInput => ({
      declared_value: dv,
      incoterm: incoterm as Incoterm,
      pre_shipment: toMoney(preShipment),
      international_freight: toMoney(intlFreight),
      insurance: toInsurance(insuranceKind, insuranceValue),
      other_costs: otherCostsArr,
      duty: { status: dutyStatus, rate: r },
      quantity: toMoney(quantity),
    });

    setResult(computeLandedCost(buildInput(dutyStatus === "not_determined" ? null : rate)));

    if (withCert && prefRate.trim() !== "" && n(prefRate) >= 0 && dutyStatus === "referential") {
      setResultPref(computeLandedCost(buildInput(n(prefRate))));
    } else {
      setResultPref(null);
    }
  }, [
    incoterm, declaredValue, quantity, preShipment, intlFreight, insuranceKind, insuranceValue,
    tariffRate, tariffNotDetermined, withCert, prefRate, otherCostsArr,
  ]);

  const meta = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm)
    ? INCOTERM_META[incoterm as Incoterm]
    : null;
  const asked = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm)
    ? ASK_FOR_BASE[incoterm as Incoterm]
    : [];
  const alreadyInPrice = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm)
    ? ALREADY_IN_PRICE[incoterm as Incoterm]
    : [];

  const cur = fx.displayCurrency;
  const fmt = fx.fmt;

  const opCtx = () => ({
    origin, destination, tariff_code: tariffCode, system: tariffSystem,
    fob_value: declaredValue, quantity,
    incoterm, currency: fx.currency,
    intl_freight: intlFreight, pre_shipment: preShipment,
    insurance_kind: insuranceKind, insurance_value: insuranceValue,
    base_rate: tariffNotDetermined ? "" : tariffRate,
    base_rate_status: tariffNotDetermined ? "not_determined" : (rateReferential ? "referential" : ""),
    pref_rate: withCert && !tariffNotDetermined ? prefRate : "",
    // Continuidad: se reenvía el TariffDatum recibido/obtenido para el arancel,
    // así el módulo siguiente no vuelve a consultar las fuentes.
    tariff_datum: receivedDatum ? JSON.stringify(receivedDatum) : (rateInfo?.tariff?.general ? JSON.stringify(rateInfo.tariff.general) : ""),
    pref_tariff_datum: receivedPrefDatum ? JSON.stringify(receivedPrefDatum) : (rateInfo?.tariff?.preferential ? JSON.stringify(rateInfo.tariff.preferential) : ""),
  });

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, display: "block" as const };
  const sectionStyle = { fontSize: 13, fontWeight: 700 as const, color: "#C9A84C", marginBottom: 14, marginTop: 4, borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: 6 };
  const showsIncoterm = !!meta;

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/modulos" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{lang === "es" ? "◇ Todos los módulos" : "◇ All modules"}</Link>
          <Link href="/modulo01" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{c.back}</Link>
          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 20, padding: "5px 16px", color: "#0057FF", fontSize: 12, fontWeight: 600 }}>Módulo 03</span>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 14, marginBottom: 6 }}>{c.title}</h1>
          <p style={{ color: "#C9A84C", fontSize: 15, fontWeight: 600, maxWidth: 640, margin: "0 auto" }}>{c.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── Columna izquierda — formulario ── */}
          <div>
            {/* Búsqueda por código arancelario (Bloque 2 — intacto) */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 20, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
              <p style={sectionStyle}>{lang === "es" ? "🔍 Código arancelario" : "🔍 Tariff Code"}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {["HS", "NCM", "TARIC"].map((s) => (
                  <button key={s} onClick={() => setTariffSystem(s)} style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${tariffSystem === s ? "#0057FF" : "rgba(255,255,255,0.15)"}`, background: tariffSystem === s ? "rgba(0,87,255,0.25)" : "transparent", color: tariffSystem === s ? "#FFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={tariffCode}
                  onChange={(e) => setTariffCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchTariffRate(tariffCode, tariffSystem, origin, destination)}
                  placeholder={tariffSystem === "NCM" ? "ej: 63014000" : tariffSystem === "TARIC" ? "ej: 6301400010" : "ej: 630140"}
                  style={{ ...inputStyle, flex: 1, fontFamily: "monospace", letterSpacing: 1 }}
                />
                <button
                  onClick={() => fetchTariffRate(tariffCode, tariffSystem, origin, destination)}
                  disabled={rateLoading || !tariffCode}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: rateLoading || !tariffCode ? "rgba(0,87,255,0.2)" : "rgba(0,87,255,0.85)", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: rateLoading || !tariffCode ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                >
                  {rateLoading ? "⏳ Buscando..." : lang === "es" ? "🔍 Buscar arancel" : "🔍 Look up tariff"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>{lang === "es" ? "País de origen" : "Origin country"}</label>
                  <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ ...inputStyle }}>
                    <option value="">{lang === "es" ? "— Origen —" : "— Origin —"}</option>
                    {["Argentina","Brasil","Uruguay","Paraguay","Chile","Bolivia","Perú","Colombia","Ecuador","México","Estados Unidos","Canadá","España","Alemania","Francia","Italia","China","Japón","Corea del Sur","India","Australia","Reino Unido"].map(co => <option key={co} value={co}>{co}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>{lang === "es" ? "País de destino *" : "Destination country *"}</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ ...inputStyle, borderColor: !destination ? "rgba(239,68,68,0.4)" : "rgba(0,87,255,0.3)" }}>
                    <option value="">{lang === "es" ? "— Destino —" : "— Destination —"}</option>
                    {["Argentina","Brasil","Uruguay","Paraguay","Chile","Bolivia","Perú","Colombia","Ecuador","México","Estados Unidos","Canadá","España","Alemania","Francia","Italia","China","Japón","Corea del Sur","India","Australia","Reino Unido"].map(co => <option key={co} value={co}>{co}</option>)}
                  </select>
                </div>
              </div>

              {rateError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>⚠ {rateError}</p>}
              {rateApiError && (
                <ApiErrorBox view={rateApiError} lang={lang} onRetry={() => fetchTariffRate(tariffCode, tariffSystem, origin, destination)} retrying={rateLoading} />
              )}
              {rateLoading && (
                <div style={{ padding: "10px 14px", background: "rgba(0,87,255,0.06)", borderRadius: 8, marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>⏳ {lang === "es" ? "Consultando arancel con IA…" : "Looking up tariff with AI…"}</p>
                </div>
              )}
              {rateInfo && (
                <div style={{ marginTop: 10, padding: "14px 16px", background: "rgba(0,87,255,0.08)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 10 }}>
                  {rateInfo.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{rateInfo.description}</p>}
                  <TariffValue datum={rateInfo.tariff?.general} lang={lang} label={lang === "es" ? "Tasa arancelaria" : "Tariff rate"} />
                  {rateInfo.tariff?.preferential && rateInfo.tariff.preferential.value != null && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <TariffValue datum={rateInfo.tariff.preferential} lang={lang} label={lang === "es" ? "Tasa preferencial" : "Preferential rate"} />
                    </div>
                  )}
                  {rateInfo.notes && rateInfo.notes !== "null" && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, marginBottom: 0 }}>{rateInfo.notes}</p>}
                </div>
              )}
              {/* Bloque 3 · continuidad: se muestra el MISMO TariffDatum que vio el usuario en M01. */}
              {!rateInfo && receivedDatum && (
                <div style={{ marginTop: 10, padding: "14px 16px", background: "rgba(0,87,255,0.08)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 10 }}>
                  <TariffValue datum={receivedDatum} lang={lang} label={lang === "es" ? "Tasa arancelaria (traída de la búsqueda)" : "Tariff rate (from the search)"} />
                  {receivedPrefDatum && receivedPrefDatum.value != null && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <TariffValue datum={receivedPrefDatum} lang={lang} label={lang === "es" ? "Tasa preferencial" : "Preferential rate"} />
                    </div>
                  )}
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 8, marginBottom: 0 }}>
                    {lang === "es"
                      ? "Es el dato de la operación en curso. No se volvió a consultar. Podés ajustar la tasa abajo si corresponde."
                      : "This is the current operation's datum. It was not re-queried. You can adjust the rate below if needed."}
                  </p>
                </div>
              )}
            </div>

            {/* Incoterm — sin preselección. Indicación neutral al entrar; error sólo al intentar calcular. */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: `1px solid ${!incoterm && n(declaredValue) > 0 ? "rgba(239,68,68,0.35)" : "rgba(0,87,255,0.2)"}`, marginBottom: 20 }}>
              <p style={sectionStyle}>{c.incoterm_title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {SUPPORTED_INCOTERMS.map((code) => (
                  <button key={code} onClick={() => setIncoterm(code)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${incoterm === code ? "#0057FF" : "rgba(255,255,255,0.1)"}`, background: incoterm === code ? "rgba(0,87,255,0.25)" : "transparent", color: incoterm === code ? "#FFFFFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {code}
                  </button>
                ))}
              </div>
              {!meta && (
                n(declaredValue) > 0
                  ? <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠ {c.incoterm_pick}</p>
                  : <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{c.incoterm_help}</p>
              )}
              {meta && (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#FFFFFF" }}>{meta.code} — {lang === "es" ? meta.name_es : meta.name_en}</p>
                  <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 4 }}>📤 {c.seller_covers}: {meta.seller_es}</p>
                  <p style={{ fontSize: 12, color: "#C9A84C", marginBottom: meta.scope_note_es ? 4 : 0 }}>📥 {c.buyer_covers}: {meta.buyer_es}</p>
                  {meta.scope_note_es && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>ℹ {lang === "es" ? meta.scope_note_es : meta.scope_note_en}</p>
                  )}
                </div>
              )}
            </div>

            {/* Precio + moneda + cantidad */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
              <p style={sectionStyle}>{c.section_price}</p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>{c.declared_value}{meta ? ` (${meta.code})` : ""}</label>
                  <input type="number" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} placeholder="10000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.currency}</label>
                  <select value={fx.currency} onChange={(e) => fx.setCurrency(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {FX_CURRENCIES.map((cu) => <option key={cu}>{cu}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{c.quantity}</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" style={inputStyle} />
              </div>
            </div>

            {/* Componentes según Incoterm */}
            {showsIncoterm && (
              <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
                <p style={sectionStyle}>{c.section_components}</p>

                {alreadyInPrice.length > 0 && (
                  <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
                    <p style={{ fontSize: 11.5, color: "#22c55e", lineHeight: 1.5 }}>✓ {c.already_in_price}: {alreadyInPrice.join(" · ")}</p>
                  </div>
                )}

                {asked.length === 0 && (
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>{c.nothing_to_add}</p>
                )}

                {asked.includes("pre_shipment") && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{c.pre_shipment}</label>
                    <input type="number" value={preShipment} onChange={(e) => setPreShipment(e.target.value)} placeholder="" style={inputStyle} />
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{c.pre_shipment_help}</p>
                  </div>
                )}

                {asked.includes("international_freight") && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{c.intl_freight}</label>
                    <input type="number" value={intlFreight} onChange={(e) => setIntlFreight(e.target.value)} placeholder="" style={inputStyle} />
                  </div>
                )}

                {asked.includes("insurance") && (
                  <div style={{ marginBottom: 4 }}>
                    <label style={labelStyle}>{c.insurance}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,87,255,0.3)" }}>
                        {(["amount", "percent"] as const).map((k) => (
                          <button key={k} onClick={() => setInsuranceKind(k)} style={{ padding: "0 12px", border: "none", background: insuranceKind === k ? "rgba(0,87,255,0.35)" : "transparent", color: insuranceKind === k ? "#FFF" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {k === "amount" ? c.insurance_kind_amount : c.insurance_kind_percent}
                          </button>
                        ))}
                      </div>
                      <input type="number" value={insuranceValue} onChange={(e) => setInsuranceValue(e.target.value)} placeholder="" step="0.1" style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Arancel (manual / traído) */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
              <p style={sectionStyle}>{c.section_tariff}</p>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{c.tariff_rate}</label>
                <input type="number" value={tariffRate} onChange={(e) => { setTariffRate(e.target.value); setTariffNotDetermined(false); setRateReferential(false); }} placeholder="—" style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(34,197,94,0.07)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)", cursor: "pointer" }} onClick={() => setWithCert(!withCert)}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: withCert ? "#22c55e" : "transparent", border: `2px solid ${withCert ? "#22c55e" : "rgba(255,255,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {withCert && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: withCert ? "#22c55e" : "rgba(255,255,255,0.6)", fontWeight: 600 }}>{c.with_cert}</span>
              </div>
              {withCert && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>{c.pref_rate}</label>
                  <input type="number" value={prefRate} onChange={(e) => setPrefRate(e.target.value)} placeholder="0" style={inputStyle} />
                </div>
              )}
            </div>

            {/* Otros costos de la operación (opcional) */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)" }}>
              <p style={sectionStyle}>{c.section_other}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>{c.other_help}</p>
              {([
                ["import_clearance", c.oc_import_clearance],
                ["dest_port", c.oc_dest_port],
                ["dest_inland", c.oc_dest_inland],
              ] as [OtherCostKey, string][]).map(([k, label]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" value={otherCosts[k]} onChange={(e) => setOtherCosts((s) => ({ ...s, [k]: e.target.value }))} placeholder="" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Columna derecha — resultado ── */}
          <div>
            {result && meta && n(declaredValue) > 0 ? (
              <div style={{ position: "sticky", top: 24 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <button
                    onClick={() => exportCIFPDF({ cost: result, costPref: resultPref, incoterm, currency: fx.currency, fxRate: fx.fxRate, declaredValue, tariffCode, tariffSystem, origin, destination, withCert, prefRate, rateInfo, notIncludedNotice: lang === "es" ? NOT_INCLUDED_NOTICE_ES : NOT_INCLUDED_NOTICE_EN }, { lang })}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    📄 {c.btn_pdf}
                  </button>
                </div>

                <div style={{ background: "linear-gradient(135deg, #0D1B3E, #0A0A0F)", borderRadius: 16, padding: 24, border: "1px solid rgba(201,168,76,0.3)", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                    {c.section_result} · {meta.code} — {cur}
                  </p>
                  {result.scope_note_es && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>ℹ {lang === "es" ? result.scope_note_es : result.scope_note_en}</p>
                  )}
                  {fx.currency !== "USD" && (
                    fx.fxRate ? (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, lineHeight: 1.6 }}>
                        {lang === "es" ? "Cotización utilizada: " : "Rate used: "}1 USD = {fx.fxRate.toLocaleString("es-AR", { maximumFractionDigits: 4 })} {fx.currency}
                        {" · "}{lang === "es" ? "Fuente" : "Source"}: ExchangeRate-API{fx.fxMeta?.date ? ` · ${fx.fxMeta.date}` : ""}
                      </p>
                    ) : (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{lang === "es" ? "No se pudo obtener el tipo de cambio — montos en USD." : "Exchange rate unavailable — amounts in USD."}</p>
                    )
                  )}

                  {/* Ya incluido en el precio */}
                  {result.already_in_price.length > 0 && (
                    <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 10, lineHeight: 1.5 }}>
                      ✓ {lang === "es" ? "Ya en el precio según" : "Already in the price for"} {meta.code}: {result.already_in_price.join(" · ")} — {lang === "es" ? "no se vuelve a sumar" : "not added again"}.
                    </p>
                  )}

                  {/* Componentes agregados a la base */}
                  {result.added_to_base.map((li) => (
                    <div key={li.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>+ {li.label_es}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{cur} {fmt(li.amount)}</span>
                    </div>
                  ))}

                  {/* Base estimada para el arancel */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{c.base_known}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0057FF" }}>{cur} {fmt(result.base_known)}</span>
                  </div>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginBottom: 12, lineHeight: 1.5 }}>{c.base_note}</p>

                  {/* Faltantes */}
                  {result.missing_base_components.length > 0 && (
                    <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                      <p style={{ fontSize: 11.5, color: "#C9A84C", lineHeight: 1.5 }}>
                        {c.not_informed}: {result.missing_base_components.join(", ")}. {lang === "es" ? "La estimación puede variar al incorporarlo(s). No se asume ningún valor." : "The estimate may change once added. No value is assumed."}
                      </p>
                    </div>
                  )}

                  {/* Arancel + estimación */}
                  {result.completeness === "not_computable" ? (
                    <p style={{ fontSize: 12.5, color: "#e2e8f0", lineHeight: 1.6 }}>{result.note_es}</p>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{c.tariff_amount} ({result.duty.rate}% · {lang === "es" ? "referencial" : "referential"})</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{cur} {fmt(result.duty.amount ?? 0)}</span>
                      </div>
                      <div style={{ marginTop: 12, padding: "14px 16px", background: "linear-gradient(135deg, rgba(0,87,255,0.2), rgba(0,87,255,0.08))", borderRadius: 10, border: "1px solid rgba(0,87,255,0.4)" }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>
                          {c.op_estimate}{result.completeness === "partial" ? ` · ${c.provisional}` : ""}
                        </p>
                        <p style={{ fontSize: 28, fontWeight: 800, color: result.completeness === "partial" ? "#C9A84C" : "#FFF" }}>{cur} {fmt(result.operation_estimate ?? 0)}</p>
                        {result.per_unit != null && (
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{c.unit_cost}: {cur} {fmt(result.per_unit)}</p>
                        )}
                      </div>
                      {result.completeness === "partial" && (
                        <p style={{ fontSize: 11, color: "#C9A84C", marginTop: 8, lineHeight: 1.5 }}>{result.note_es}</p>
                      )}

                      {/* Preferencial */}
                      {resultPref && resultPref.operation_estimate != null && n(prefRate) < n(tariffRate) && (
                        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, color: "#22c55e" }}>{c.with_cert_estimate} ({prefRate}%)</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#22c55e" }}>{cur} {fmt(resultPref.operation_estimate)}</span>
                          </div>
                          <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 8, padding: "10px 12px", marginTop: 8, textAlign: "center" }}>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{c.saving}</p>
                            <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>{cur} {fmt((result.operation_estimate ?? 0) - resultPref.operation_estimate)}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Otros costos declarados — aparte */}
                  {result.other_costs_declared.length > 0 && (
                    <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{c.other_declared}</p>
                      {result.other_costs_declared.map((li) => (
                        <div key={li.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{li.label_es}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{cur} {fmt(li.amount)}</span>
                        </div>
                      ))}
                      {result.total_with_other_costs != null && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{c.total_with_other}</span>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{cur} {fmt(result.total_with_other_costs)}</span>
                          </div>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.total_with_other_sub}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: "#C9A84C", marginTop: 14, lineHeight: 1.55 }}>{lang === "es" ? NOT_INCLUDED_NOTICE_ES : NOT_INCLUDED_NOTICE_EN}</p>
                </div>

                {/* Navegación */}
                <Link href={`/modulo04${buildOpQuery(opCtx())}`} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.3)", color: "#6B9FFF", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}>
                  {c.to_m4}
                </Link>
                <Link href={`/modulo02${buildOpQuery(opCtx())}`} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}>
                  {c.to_m2}
                </Link>

                <LegalDisclaimer lang={lang as "es" | "en"} compact />
              </div>
            ) : (
              <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 40, border: "1px solid rgba(0,87,255,0.1)", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 16 }}>{c.empty}</p>
                {!tariffCode && !receivedDatum && (
                  <>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 }}>
                      {lang === "es"
                        ? "¿No tenés el código arancelario ni el arancel? Conviene empezar por el producto en el Módulo 01: clasifica y trae el dato hasta acá."
                        : "Don't have the tariff code or the rate? Start from the product in Module 01: it classifies and carries the datum here."}
                    </p>
                    <Link href="/modulo01" style={{ display: "inline-block", padding: "10px 18px", borderRadius: 8, background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.35)", color: "#6B9FFF", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                      {lang === "es" ? "🔍 Empezar en Módulo 01" : "🔍 Start in Module 01"}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>© 2025 Global Tariff Hub — {lang === "es" ? "Cálculo de referencia. No reemplaza consulta profesional." : "Reference calculation. Does not replace professional advice."}</p>
      </footer>
    </div>
  );
}

export default function Modulo03({ defaultLang = "es" }: { defaultLang?: Lang }) {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}><ModuloInner defaultLang={defaultLang} /></Suspense>;
}
