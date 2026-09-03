"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SUPPORTED_COUNTRIES } from "@/lib/taxEngine";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { exportViabilityPDF } from "@/lib/exportPDF";
import { buildOpQuery, readOpContext } from "@/lib/opContext";
import { fetchWithDeadline, describeAIError, type AIErrorView } from "@/lib/aiClient";
import ApiErrorBox from "@/components/ApiErrorBox";
import TariffValue from "@/components/TariffValue";
import { SUPPORTED_INCOTERMS, INCOTERM_META, ASK_FOR_BASE, ALREADY_IN_PRICE, type Incoterm } from "@/lib/incoterms";
import { useFxCurrency, FX_CURRENCIES } from "@/lib/useFxCurrency";

const ALL_COUNTRIES = [
  "China", "Estados Unidos", "Alemania", "Italia", "España", "Francia",
  "Japón", "Corea del Sur", "India", "Turquía", "Brasil", "México",
  "Argentina", "Chile", "Colombia", "Perú", "Uruguay", "Paraguay",
  "Reino Unido", "Canadá", "Australia", "Taiwán", "Vietnam", "Bangladesh",
];

const OTHER_COST_KEYS = ["import_clearance", "dest_port", "dest_inland"] as const;
type OtherCostKey = (typeof OTHER_COST_KEYS)[number];

// Destinos curados del selector de M04. Un destino heredado de M01/M03 que no
// esté acá se agrega como opción extra para que el valor recibido se hidrate.
const DEST_EXTRA = ["Ecuador", "Venezuela", "Bolivia", "Costa Rica", "Guatemala", "Panamá", "Otros"];
const DEST_OPTIONS = [...SUPPORTED_COUNTRIES, ...DEST_EXTRA];

const t = {
  es: {
    title: "Viabilidad de Importación",
    subtitle: "¿Cómo se ven los números de la operación? Partimos del precio comercial cotizado y el Incoterm para estimar la operación dentro del alcance de GTH.",
    step1: "1. Producto",
    step2: "2. Datos comerciales",
    upload_photo: "Subir foto del producto",
    or_describe: "O describir el producto",
    describe_placeholder: "Ej: manta para colorear de tela fleece con marcadores...",
    hs_known: "¿Ya conocés el código arancelario?",
    supplier_country: "País proveedor",
    destination: "País de importación",
    incoterm_title: "Incoterm del precio cotizado",
    incoterm_pick: "Elegí el Incoterm correspondiente al precio informado.",
    seller_covers: "El vendedor cubre",
    buyer_covers: "El comprador cubre",
    unit_price: "Precio comercial cotizado por unidad",
    quantity: "Cantidad de unidades",
    currency: "Moneda",
    section_components: "Componentes a agregar según el Incoterm",
    pre_shipment: "Costos de pre-embarque",
    pre_shipment_help: "Costos hasta dejar la mercadería lista para el transporte internacional.",
    intl_freight: "Flete internacional total",
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
    analyze: "Analizar viabilidad",
    analyzing: "Analizando...",
    product_identified: "Producto identificado",
    tariff_rate: "Tasa arancelaria",
    requires_permits: "Requiere permisos",
    base_known: "Base estimada para el arancel",
    base_note: "La base definitiva aplicable puede variar según la normativa de la jurisdicción importadora y debe validarse cuando corresponda.",
    not_informed: "No informado",
    tariff_amount: "Arancel",
    op_estimate: "Estimación de la operación dentro del alcance de GTH",
    provisional: "provisional",
    unit_cost: "Costo por unidad",
    other_declared: "Otros costos de la operación que informaste",
    total_with_other: "Total incluyendo lo que informaste",
    total_with_other_sub: "estimación GTH + otros costos informados — se muestran por separado",
    export_pdf: "Exportar informe PDF",
    back: "← Volver",
    error_dest: "Seleccioná el país de importación.",
    error_fob: "Ingresá el precio comercial cotizado por unidad.",
    error_product: "Subí una foto o describí el producto.",
    error_incoterm: "Elegí el Incoterm correspondiente al precio informado.",
    no_permits: "Sin restricciones especiales identificadas",
    to_m2: "📄 M02 — ¿Podés pagar menos aranceles? →",
  },
  en: {
    title: "Import Viability",
    subtitle: "How do the operation's numbers look? We start from the quoted commercial price and the Incoterm to estimate the operation within GTH's scope.",
    step1: "1. Product",
    step2: "2. Commercial data",
    upload_photo: "Upload product photo",
    or_describe: "Or describe the product",
    describe_placeholder: "E.g.: fleece coloring blanket with fabric markers...",
    hs_known: "Do you already know the tariff code?",
    supplier_country: "Supplier country",
    destination: "Import country",
    incoterm_title: "Incoterm of the quoted price",
    incoterm_pick: "Choose the Incoterm that corresponds to the quoted price.",
    seller_covers: "Seller covers",
    buyer_covers: "Buyer covers",
    unit_price: "Quoted commercial price per unit",
    quantity: "Number of units",
    currency: "Currency",
    section_components: "Components to add for this Incoterm",
    pre_shipment: "Pre-shipment costs",
    pre_shipment_help: "Costs to get the goods ready for international transport.",
    intl_freight: "Total international freight",
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
    analyze: "Analyze viability",
    analyzing: "Analyzing...",
    product_identified: "Product identified",
    tariff_rate: "Tariff rate",
    requires_permits: "Requires permits",
    base_known: "Estimated duty base",
    base_note: "The final applicable base may vary under the importing jurisdiction's rules and must be validated where applicable.",
    not_informed: "Not informed",
    tariff_amount: "Tariff",
    op_estimate: "Operation estimate within GTH's scope",
    provisional: "provisional",
    unit_cost: "Cost per unit",
    other_declared: "Other operation costs you informed",
    total_with_other: "Total including what you informed",
    total_with_other_sub: "GTH estimate + other informed costs — shown separately",
    export_pdf: "Export PDF report",
    back: "← Back",
    error_dest: "Select the import country.",
    error_fob: "Enter the quoted commercial price per unit.",
    error_product: "Upload a photo or describe the product.",
    error_incoterm: "Choose the Incoterm that corresponds to the quoted price.",
    no_permits: "No special restrictions identified",
    to_m2: "📄 M02 — Can you pay lower tariffs? →",
  },
};

type Lang = "es" | "en";

function ModuloInner({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(defaultLang);
  const c = t[lang];
  const fx = useFxCurrency("USD");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tariffSystem, setTariffSystem] = useState("NCM");
  const [hsCode, setHsCode] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("China");
  const [destination, setDestination] = useState("");
  const [incoterm, setIncoterm] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [preShipment, setPreShipment] = useState("");
  const [intlFreight, setIntlFreight] = useState("");
  const [insuranceKind, setInsuranceKind] = useState<"amount" | "percent">("amount");
  const [insuranceValue, setInsuranceValue] = useState("");
  const [otherCosts, setOtherCosts] = useState<Record<OtherCostKey, string>>({
    import_clearance: "", dest_port: "", dest_inland: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState<AIErrorView | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = fx.fmt;
  const cur = fx.displayCurrency;

  // ── Prefill desde el contexto acumulativo de la operación ──
  useEffect(() => {
    const ctx = readOpContext(searchParams);
    if (ctx.tariff_code) setHsCode(ctx.tariff_code);
    if (ctx.system) setTariffSystem(ctx.system);
    if (ctx.origin) setSupplierCountry(ctx.origin);
    if (ctx.destination) setDestination(ctx.destination);
    if (ctx.fob_value) setUnitPrice(ctx.fob_value);
    if (ctx.quantity) setQuantity(ctx.quantity);
    if (ctx.incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(ctx.incoterm)) setIncoterm(ctx.incoterm);
    if (ctx.currency) fx.setCurrency(ctx.currency);
    if (ctx.intl_freight != null) setIntlFreight(ctx.intl_freight);
    if (ctx.pre_shipment != null) setPreShipment(ctx.pre_shipment);
    if (ctx.insurance_kind === "percent" || ctx.insurance_kind === "amount") setInsuranceKind(ctx.insurance_kind);
    if (ctx.insurance_value != null) setInsuranceValue(ctx.insurance_value);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setApiError(null);
    setResult(null);
    if (!destination) { setError(c.error_dest); return; }
    if (!unitPrice || parseFloat(unitPrice) <= 0) { setError(c.error_fob); return; }
    if (!image && !description && !hsCode) { setError(c.error_product); return; }
    if (!incoterm || !(SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm)) { setError(c.error_incoterm); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      if (image) fd.append("image", image);
      fd.append("description", description);
      fd.append("tariff_system", tariffSystem);
      fd.append("hs_code", hsCode);
      fd.append("supplier_country", supplierCountry);
      fd.append("destination", destination);
      fd.append("incoterm", incoterm);
      fd.append("currency", fx.currency);
      fd.append("unit_price", unitPrice);
      fd.append("quantity", quantity);
      fd.append("intl_freight", intlFreight);
      fd.append("pre_shipment", preShipment);
      fd.append("insurance_kind", insuranceKind);
      fd.append("insurance_value", insuranceValue);
      fd.append("other_costs", JSON.stringify([
        { label: c.oc_import_clearance, amount: otherCosts.import_clearance },
        { label: c.oc_dest_port, amount: otherCosts.dest_port },
        { label: c.oc_dest_inland, amount: otherCosts.dest_inland },
      ]));
      fd.append("lang", lang);

      const res = await fetchWithDeadline("/api/viability", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error) {
        if (data?.code === "MISSING_INCOTERM") { setError(c.error_incoterm); return; }
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

  const meta = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm) ? INCOTERM_META[incoterm as Incoterm] : null;
  const asked = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm) ? ASK_FOR_BASE[incoterm as Incoterm] : [];
  const alreadyInPrice = incoterm && (SUPPORTED_INCOTERMS as readonly string[]).includes(incoterm) ? ALREADY_IN_PRICE[incoterm as Incoterm] : [];

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0D1B3E", color: "#FFF", fontSize: 13 };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" };
  const cardStyle: React.CSSProperties = { background: "#0D1B3E", borderRadius: 14, padding: 22, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 16 };
  const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 14, borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: 6 };

  const cost = result?.cost;

  const opCtx = () => ({
    tariff_code: result?.product?.hs_code || hsCode || "",
    system: "HS",
    origin: supplierCountry,
    destination,
    fob_value: unitPrice,
    quantity,
    incoterm,
    currency: fx.currency,
    intl_freight: intlFreight,
    pre_shipment: preShipment,
    insurance_kind: insuranceKind,
    insurance_value: insuranceValue,
    base_rate: result?.product?.tariff?.status === "referential" && result.product.tariff.value != null ? String(result.product.tariff.value) : "",
    base_rate_status: result?.product?.tariff?.status ?? "not_determined",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#FFFFFF", fontFamily: "Arial, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/modulos" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{lang === "es" ? "◇ Todos los módulos" : "◇ All modules"}</Link>
          <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 3, border: "1px solid rgba(0,87,255,0.3)", display: "flex" }}>
            {(["ES", "EN"] as const).map((l) => (
              <span key={l} onClick={() => setLang(l.toLowerCase() as Lang)} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", background: lang === l.toLowerCase() ? "#0057FF" : "transparent", color: lang === l.toLowerCase() ? "#FFF" : "rgba(255,255,255,0.4)" }}>{l}</span>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
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
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(0,87,255,0.4)", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 16, background: imagePreview ? "transparent" : "rgba(0,87,255,0.04)", position: "relative", overflow: "hidden" }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, maxWidth: "100%" }} />
                  : <>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>📸</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{c.upload_photo}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>JPG, PNG, WEBP</p>
                    </>}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              </div>
              <label style={labelStyle}>{c.or_describe}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={c.describe_placeholder} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>{lang === "es" ? "Sistema de nomenclatura arancelaria" : "Tariff nomenclature system"}</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["HS", "NCM", "TARIC"].map((s) => (
                    <button key={s} onClick={() => setTariffSystem(s)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${tariffSystem === s ? "#0057FF" : "rgba(255,255,255,0.15)"}`, background: tariffSystem === s ? "rgba(0,87,255,0.25)" : "transparent", color: tariffSystem === s ? "#FFF" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>{c.hs_known} ({lang === "es" ? "opcional" : "optional"})</label>
                <input type="text" value={hsCode} onChange={(e) => setHsCode(e.target.value)} placeholder={tariffSystem === "NCM" ? "ej: 63014000" : tariffSystem === "TARIC" ? "ej: 6301400010" : "ej: 630140"} style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: 1 }} />
              </div>
            </div>

            {/* PASO 2 — DATOS COMERCIALES */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{c.step2}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>{c.supplier_country}</label>
                  <select value={supplierCountry} onChange={(e) => setSupplierCountry(e.target.value)} style={{ ...inputStyle }}>
                    {ALL_COUNTRIES.map(co => <option key={co} value={co}>{co}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{c.destination} *</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ ...inputStyle, borderColor: !destination ? "rgba(239,68,68,0.5)" : "rgba(0,87,255,0.3)" }}>
                    <option value="">{lang === "es" ? "— Seleccioná —" : "— Select —"}</option>
                    {/* Continuidad: si el destino llegó de M01/M03 y no está en la lista
                        curada, se incluye igual para que se hidrate el valor recibido. */}
                    {destination && !DEST_OPTIONS.includes(destination) && (
                      <option value={destination}>{destination}</option>
                    )}
                    {SUPPORTED_COUNTRIES.map(co => <option key={co} value={co}>{co}</option>)}
                    <option disabled>──────────</option>
                    {DEST_EXTRA.map(co => <option key={co} value={co}>{co}</option>)}
                  </select>
                </div>
              </div>

              {/* Incoterm — sin preselección */}
              <label style={labelStyle}>{c.incoterm_title} *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {SUPPORTED_INCOTERMS.map((code) => (
                  <button key={code} onClick={() => setIncoterm(code)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${incoterm === code ? "#0057FF" : "rgba(255,255,255,0.12)"}`, background: incoterm === code ? "rgba(0,87,255,0.25)" : "transparent", color: incoterm === code ? "#FFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{code}</button>
                ))}
              </div>
              {!meta && <p style={{ fontSize: 11.5, color: "#ef4444", fontWeight: 600, marginBottom: 12 }}>⚠ {c.incoterm_pick}</p>}
              {meta && (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{meta.code} — {lang === "es" ? meta.name_es : meta.name_en}</p>
                  <p style={{ fontSize: 11.5, color: "#22c55e", marginBottom: 3 }}>📤 {c.seller_covers}: {meta.seller_es}</p>
                  <p style={{ fontSize: 11.5, color: "#C9A84C" }}>📥 {c.buyer_covers}: {meta.buyer_es}</p>
                  {meta.scope_note_es && <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>ℹ {lang === "es" ? meta.scope_note_es : meta.scope_note_en}</p>}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>{c.unit_price} *</label>
                  <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="8.00" style={{ ...inputStyle, borderColor: !unitPrice ? "rgba(239,68,68,0.5)" : "rgba(0,87,255,0.3)" }} />
                </div>
                <div>
                  <label style={labelStyle}>{c.quantity}</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.currency}</label>
                  <select value={fx.currency} onChange={(e) => fx.setCurrency(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {FX_CURRENCIES.map((cu) => <option key={cu}>{cu}</option>)}
                  </select>
                </div>
              </div>

              {/* Componentes según Incoterm */}
              {meta && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{c.section_components}</p>
                  {alreadyInPrice.length > 0 && (
                    <p style={{ fontSize: 11, color: "#22c55e", marginBottom: 10, lineHeight: 1.5 }}>✓ {c.already_in_price}: {alreadyInPrice.join(" · ")}</p>
                  )}
                  {asked.length === 0 && <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>{c.nothing_to_add}</p>}
                  {asked.includes("pre_shipment") && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>{c.pre_shipment}</label>
                      <input type="number" value={preShipment} onChange={(e) => setPreShipment(e.target.value)} placeholder="" style={inputStyle} />
                      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{c.pre_shipment_help}</p>
                    </div>
                  )}
                  {asked.includes("international_freight") && (
                    <div style={{ marginBottom: 12 }}>
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
                            <button key={k} onClick={() => setInsuranceKind(k)} style={{ padding: "0 12px", border: "none", background: insuranceKind === k ? "rgba(0,87,255,0.35)" : "transparent", color: insuranceKind === k ? "#FFF" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{k === "amount" ? c.insurance_kind_amount : c.insurance_kind_percent}</button>
                          ))}
                        </div>
                        <input type="number" value={insuranceValue} onChange={(e) => setInsuranceValue(e.target.value)} placeholder="" step="0.1" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Otros costos de la operación */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{c.section_other}</p>
              <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{c.other_help}</p>
              {([
                ["import_clearance", c.oc_import_clearance],
                ["dest_port", c.oc_dest_port],
                ["dest_inland", c.oc_dest_inland],
              ] as [OtherCostKey, string][]).map(([k, label]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" value={otherCosts[k]} onChange={(e) => setOtherCosts((s) => ({ ...s, [k]: e.target.value }))} placeholder="" style={inputStyle} />
                </div>
              ))}
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>{error}</p>}
            {apiError && <ApiErrorBox view={apiError} lang={lang} onRetry={handleAnalyze} retrying={loading} />}

            <button onClick={handleAnalyze} disabled={loading} style={{ width: "100%", padding: "16px", borderRadius: 10, border: "none", background: loading ? "rgba(0,87,255,0.3)" : "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? `⏳ ${c.analyzing}` : `🔍 ${c.analyze}`}
            </button>
          </div>

          {/* COLUMNA DERECHA — RESULTADO */}
          {result && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={() => exportViabilityPDF(result, { supplierCountry, destination, tariffSystem, fobUnit: unitPrice, quantity, lang, currency: fx.currency, fxRate: fx.fxRate })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  📄 {c.export_pdf}
                </button>
              </div>

              {/* Producto identificado (Bloque 2 — intacto) */}
              <div style={cardStyle}>
                <p style={sectionTitle}>🤖 {c.product_identified}</p>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{result.product.product_name || result.product.description}</p>
                {result.product.description && result.product.product_name && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{result.product.description}</p>
                )}
                {(() => {
                  const sys = result.product.tariff_system || tariffSystem;
                  const primaryCode = sys === "NCM" ? result.product.ncm_code : sys === "TARIC" ? result.product.taric_code : result.product.hs_code;
                  return primaryCode ? (
                    <div style={{ background: "rgba(0,87,255,0.12)", border: "2px solid rgba(0,87,255,0.5)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{lang === "es" ? "Posición arancelaria identificada" : "Identified tariff position"} — {sys}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: "#0057FF", fontFamily: "monospace", letterSpacing: 2 }}>{primaryCode}</p>
                      {result.product.chapter && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{result.product.chapter}</p>}
                    </div>
                  ) : null;
                })()}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                  <TariffValue datum={result.product.tariff} lang={lang} label={c.tariff_rate} />
                </div>
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

              {/* Estimación — motor canónico (mismo bloque que M3) */}
              {cost && (
                <div style={cardStyle}>
                  <p style={sectionTitle}>📦 {lang === "es" ? "Estimación dentro del alcance de GTH" : "Estimate within GTH's scope"} · {result.commercial?.incoterm} · {cur}</p>
                  {cost.scope_note_es && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>ℹ {lang === "es" ? cost.scope_note_es : cost.scope_note_en}</p>}

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>{lang === "es" ? "Precio comercial cotizado" : "Quoted commercial price"} ({result.commercial?.incoterm})</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{fmt(result.commercial?.declared_value || 0)}</span>
                  </div>
                  {cost.already_in_price.length > 0 && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "4px 0 6px", lineHeight: 1.5 }}>
                      ✓ {lang === "es" ? "Ya en el precio" : "Already in price"}: {cost.already_in_price.join(" · ")} — {lang === "es" ? "no se vuelve a sumar" : "not added again"}.
                    </p>
                  )}
                  {cost.added_to_base.map((li: any) => (
                    <div key={li.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>+ {li.label_es}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(li.amount)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", marginTop: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{c.base_known}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0057FF" }}>{fmt(cost.base_known)}</span>
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 10, lineHeight: 1.5 }}>{c.base_note}</p>

                  {cost.missing_base_components.length > 0 && (
                    <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                      <p style={{ fontSize: 11, color: "#C9A84C", lineHeight: 1.5 }}>{c.not_informed}: {cost.missing_base_components.join(", ")}. {lang === "es" ? "La estimación puede variar al incorporarlo(s). No se asume ningún valor." : "The estimate may change once added. No value is assumed."}</p>
                    </div>
                  )}

                  {cost.completeness === "not_computable" ? (
                    <p style={{ fontSize: 12.5, color: "#e2e8f0", lineHeight: 1.6 }}>{cost.note_es}</p>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{c.tariff_amount} ({cost.duty.rate}% · {lang === "es" ? "referencial" : "referential"})</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{fmt(cost.duty.amount ?? 0)}</span>
                      </div>
                      <div style={{ marginTop: 12, padding: "14px 16px", background: "linear-gradient(135deg, rgba(0,87,255,0.2), rgba(0,87,255,0.08))", borderRadius: 10, border: "1px solid rgba(0,87,255,0.4)" }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{c.op_estimate}{cost.completeness === "partial" ? ` · ${c.provisional}` : ""}</p>
                        <p style={{ fontSize: 28, fontWeight: 800, color: cost.completeness === "partial" ? "#C9A84C" : "#FFF" }}>{fmt(cost.operation_estimate ?? 0)}</p>
                        {cost.per_unit != null && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{c.unit_cost}: {fmt(cost.per_unit)}</p>}
                      </div>
                      {cost.completeness === "partial" && <p style={{ fontSize: 11, color: "#C9A84C", marginTop: 8, lineHeight: 1.5 }}>{cost.note_es}</p>}
                    </>
                  )}

                  {cost.other_costs_declared.length > 0 && (
                    <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{c.other_declared}</p>
                      {cost.other_costs_declared.map((li: any) => (
                        <div key={li.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{li.label_es}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(li.amount)}</span>
                        </div>
                      ))}
                      {cost.total_with_other_costs != null && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{c.total_with_other}</span>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{fmt(cost.total_with_other_costs)}</span>
                          </div>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.total_with_other_sub}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: "#C9A84C", marginTop: 12, lineHeight: 1.55 }}>{result.not_included_notice}</p>
                  <LegalDisclaimer lang={lang as "es" | "en"} compact />
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/modulo02${buildOpQuery(opCtx())}`} style={{ flex: 1, padding: "12px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                  {c.to_m2}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>© 2025 Global Tariff Hub — {lang === "es" ? "Datos de referencia. No reemplaza consulta profesional." : "Reference data. Does not replace professional advice."}</p>
      </footer>
    </div>
  );
}

export default function Modulo04({ defaultLang = "es" }: { defaultLang?: Lang }) {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}><ModuloInner defaultLang={defaultLang} /></Suspense>;
}
