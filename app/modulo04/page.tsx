"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const INCOTERMS = [
  { code: "EXW", name: "Ex Works", seller: "Solo pone la mercadería disponible en su local", buyer: "Todos los costos y riesgos desde el local del vendedor" },
  { code: "FOB", name: "Free On Board", seller: "Entrega en el puerto de origen, despachada para exportación", buyer: "Flete internacional, seguro y costos en destino" },
  { code: "CIF", name: "Cost, Insurance & Freight", seller: "Flete y seguro hasta puerto de destino", buyer: "Descarga, despacho de importación y costos internos en destino" },
  { code: "DAP", name: "Delivered At Place", seller: "Entrega en el lugar acordado en destino, sin desaduanar", buyer: "Derechos de importación y costos de despacho en destino" },
  { code: "DDP", name: "Delivered Duty Paid", seller: "Todo — entrega en destino con todos los costos pagados", buyer: "Solo recibir la mercadería" },
  { code: "FCA", name: "Free Carrier", seller: "Entrega al transportista designado por el comprador", buyer: "Transporte desde el punto de entrega acordado" },
  { code: "CPT", name: "Carriage Paid To", seller: "Transporte hasta destino acordado", buyer: "Seguro y riesgos desde que la mercadería se entrega al transportista" },
];

const CURRENCIES = ["USD", "EUR", "ARS", "BRL", "CLP"];

const t = {
  es: {
    title: "Calculadora CIF e Incoterms",
    subtitle: "Calculá el costo total de tu operación",
    incoterm_title: "Seleccioná el Incoterm",
    seller_covers: "El vendedor cubre",
    buyer_covers: "El comprador cubre",
    section_merch: "Mercadería",
    fob_value: "Valor FOB / Precio de venta",
    quantity: "Cantidad",
    unit_price: "Precio unitario",
    currency: "Moneda",
    section_logistics: "Logística internacional",
    freight: "Flete internacional",
    insurance: "Seguro internacional",
    insurance_pct: "% sobre valor FOB (usual: 0.5% - 1%)",
    section_origin: "Costos en origen",
    export_customs: "Despacho de exportación",
    port_origin: "Gastos portuarios origen",
    section_destination: "Costos en destino",
    tariff_rate: "Tasa arancelaria (%)",
    with_cert: "Con certificado preferencial",
    pref_rate: "Tasa preferencial (%)",
    import_customs: "Despacho de importación",
    port_dest: "Gastos portuarios destino",
    local_transport: "Transporte interno destino",
    section_result: "Resultado",
    total_cost: "Costo total CIF",
    total_without: "Sin certificado",
    total_with: "Con certificado",
    saving: "Ahorro con certificado",
    unit_cost: "Costo por unidad",
    breakdown: "Desglose de costos",
    merch_value: "Valor mercadería",
    logistics_total: "Logística",
    origin_total: "Costos origen",
    tariff_amount: "Arancel",
    dest_total: "Costos destino",
    btn_calc: "Calcular",
    back: "← Volver",
    sim_cert: "📄 Simular certificado →",
    disclaimer: "⚠ Cálculo de referencia. Los valores reales pueden variar según el transportista, aduana y tipo de cambio.",
  },
  en: {
    title: "CIF & Incoterms Calculator",
    subtitle: "Calculate the total cost of your operation",
    incoterm_title: "Select Incoterm",
    seller_covers: "Seller covers",
    buyer_covers: "Buyer covers",
    section_merch: "Merchandise",
    fob_value: "FOB Value / Selling price",
    quantity: "Quantity",
    unit_price: "Unit price",
    currency: "Currency",
    section_logistics: "International logistics",
    freight: "International freight",
    insurance: "International insurance",
    insurance_pct: "% of FOB value (typical: 0.5% - 1%)",
    section_origin: "Origin costs",
    export_customs: "Export customs clearance",
    port_origin: "Origin port charges",
    section_destination: "Destination costs",
    tariff_rate: "Tariff rate (%)",
    with_cert: "With preferential certificate",
    pref_rate: "Preferential rate (%)",
    import_customs: "Import customs clearance",
    port_dest: "Destination port charges",
    local_transport: "Local transport at destination",
    section_result: "Result",
    total_cost: "Total CIF cost",
    total_without: "Without certificate",
    total_with: "With certificate",
    saving: "Saving with certificate",
    unit_cost: "Cost per unit",
    breakdown: "Cost breakdown",
    merch_value: "Merchandise value",
    logistics_total: "Logistics",
    origin_total: "Origin costs",
    tariff_amount: "Tariff",
    dest_total: "Destination costs",
    btn_calc: "Calculate",
    back: "← Back",
    sim_cert: "📄 Simulate certificate →",
    disclaimer: "⚠ Reference calculation. Actual values may vary by carrier, customs and exchange rate.",
  },
};

type Lang = "es" | "en";

export default function Modulo04({ defaultLang = "es" }: { defaultLang?: Lang }) {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [incoterm, setIncoterm] = useState("FOB");
  const [currency, setCurrency] = useState("USD");
  const [fobValue, setFobValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [freight, setFreight] = useState("");
  const [insurancePct, setInsurancePct] = useState("0.8");
  const [exportCustoms, setExportCustoms] = useState("");
  const [portOrigin, setPortOrigin] = useState("");
  const [tariffRate, setTariffRate] = useState("");
  const [withCert, setWithCert] = useState(false);
  const [prefRate, setPrefRate] = useState("0");
  const [importCustoms, setImportCustoms] = useState("");
  const [portDest, setPortDest] = useState("");
  const [localTransport, setLocalTransport] = useState("");
  const [result, setResult] = useState<any>(null);
  const c = t[lang];

  const n = (v: string) => parseFloat(v) || 0;

  // Pre-fill from Module 01 params
  useEffect(() => {
    const hs = searchParams.get("hs_code");
    // hs_code is informational for the user — show it in the tariff rate field label if available
    // For now we store it so future versions can auto-lookup the rate
    if (hs) {
      // Could auto-fill tariff rate in a future version via API lookup
      // For now the user sees the code in the URL and fills manually
    }
  }, [searchParams]);

  useEffect(() => {
    const fob = n(fobValue);
    if (!fob) { setResult(null); return; }

    const qty = n(quantity) || 1;
    const ins = fob * (n(insurancePct) / 100);
    const frt = n(freight);
    const exCust = n(exportCustoms);
    const pOrig = n(portOrigin);
    const imCust = n(importCustoms);
    const pDest = n(portDest);
    const locTr = n(localTransport);

    const cifBase = fob + frt + ins;
    const tariffAmt = cifBase * (n(tariffRate) / 100);
    const prefAmt = cifBase * (n(prefRate) / 100);
    const destCosts = imCust + pDest + locTr;
    const origCosts = exCust + pOrig;

    const totalWithout = fob + frt + ins + origCosts + tariffAmt + destCosts;
    const totalWith = fob + frt + ins + origCosts + prefAmt + destCosts;
    const saving = totalWithout - totalWith;

    setResult({
      fob, freight: frt, insurance: ins, origCosts, tariffAmt, prefAmt,
      destCosts, totalWithout, totalWith, saving,
      unitWithout: totalWithout / qty, unitWith: totalWith / qty,
      cifBase,
    });
  }, [fobValue, quantity, freight, insurancePct, exportCustoms, portOrigin, tariffRate, prefRate, withCert, importCustoms, portDest, localTransport]);

  const selectedIncoterm = INCOTERMS.find(i => i.code === incoterm)!;

  const fmt = (v: number) => v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,87,255,0.3)", background: "#0A0A0F", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, display: "block" as const };
  const sectionStyle = { fontSize: 13, fontWeight: 700 as const, color: "#C9A84C", marginBottom: 14, marginTop: 4, borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: 6 };

  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/modulo01" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{c.back}</Link>
          <div style={{ display: "flex", background: "#0D1B3E", borderRadius: 20, padding: 3, border: "1px solid rgba(0,87,255,0.3)" }}>
            {(["es", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: lang === l ? "#0057FF" : "transparent", color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <span style={{ background: "rgba(0,87,255,0.15)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 20, padding: "5px 16px", color: "#0057FF", fontSize: 12, fontWeight: 600 }}>Módulo 04</span>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 14, marginBottom: 6 }}>{c.title}</h1>
          <p style={{ color: "#C9A84C", fontSize: 15, fontWeight: 600 }}>{c.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Columna izquierda — formulario */}
          <div>
            {/* Selector Incoterm */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 20 }}>
              <p style={sectionStyle}>{c.incoterm_title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {INCOTERMS.map((inc) => (
                  <button key={inc.code} onClick={() => setIncoterm(inc.code)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${incoterm === inc.code ? "#0057FF" : "rgba(255,255,255,0.1)"}`, background: incoterm === inc.code ? "rgba(0,87,255,0.25)" : "transparent", color: incoterm === inc.code ? "#FFFFFF" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {inc.code}
                  </button>
                ))}
              </div>
              {selectedIncoterm && (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#FFFFFF" }}>{selectedIncoterm.code} — {selectedIncoterm.name}</p>
                  <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 4 }}>📤 {c.seller_covers}: {selectedIncoterm.seller}</p>
                  <p style={{ fontSize: 12, color: "#C9A84C" }}>📥 {c.buyer_covers}: {selectedIncoterm.buyer}</p>
                </div>
              )}
            </div>

            {/* Campos */}
            <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 24, border: "1px solid rgba(0,87,255,0.2)" }}>

              <p style={sectionStyle}>{c.section_merch}</p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>{c.fob_value}</label>
                  <input type="number" value={fobValue} onChange={(e) => setFobValue(e.target.value)} placeholder="10000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.currency}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {CURRENCIES.map((cu) => <option key={cu}>{cu}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{c.quantity}</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" style={inputStyle} />
              </div>

              <p style={{ ...sectionStyle, marginTop: 20 }}>{c.section_logistics}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                <div>
                  <label style={labelStyle}>{c.freight}</label>
                  <input type="number" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="800" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.insurance} (%)</label>
                  <input type="number" value={insurancePct} onChange={(e) => setInsurancePct(e.target.value)} placeholder="0.8" step="0.1" style={inputStyle} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>{c.insurance_pct}</p>

              <p style={{ ...sectionStyle, marginTop: 4 }}>{c.section_origin}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>{c.export_customs}</label>
                  <input type="number" value={exportCustoms} onChange={(e) => setExportCustoms(e.target.value)} placeholder="200" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.port_origin}</label>
                  <input type="number" value={portOrigin} onChange={(e) => setPortOrigin(e.target.value)} placeholder="150" style={inputStyle} />
                </div>
              </div>

              <p style={{ ...sectionStyle, marginTop: 4 }}>{c.section_destination}</p>
              {searchParams.get("hs_code") && (
                <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(0,87,255,0.1)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 7 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{lang === "es" ? "Código desde búsqueda:" : "Code from search:"} </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0057FF" }}>{searchParams.get("hs_code")}</span>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{c.tariff_rate}</label>
                <input type="number" value={tariffRate} onChange={(e) => setTariffRate(e.target.value)} placeholder="14" style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", background: "rgba(34,197,94,0.07)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)", cursor: "pointer" }} onClick={() => setWithCert(!withCert)}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: withCert ? "#22c55e" : "transparent", border: `2px solid ${withCert ? "#22c55e" : "rgba(255,255,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {withCert && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: withCert ? "#22c55e" : "rgba(255,255,255,0.6)", fontWeight: 600 }}>{c.with_cert}</span>
              </div>
              {withCert && (
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{c.pref_rate}</label>
                  <input type="number" value={prefRate} onChange={(e) => setPrefRate(e.target.value)} placeholder="0" style={inputStyle} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>{c.import_customs}</label>
                  <input type="number" value={importCustoms} onChange={(e) => setImportCustoms(e.target.value)} placeholder="300" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{c.port_dest}</label>
                  <input type="number" value={portDest} onChange={(e) => setPortDest(e.target.value)} placeholder="200" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>{c.local_transport}</label>
                <input type="number" value={localTransport} onChange={(e) => setLocalTransport(e.target.value)} placeholder="150" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Columna derecha — resultado */}
          <div>
            {result && result.fob > 0 ? (
              <div style={{ position: "sticky", top: 24 }}>

                {/* Total principal */}
                <div style={{ background: "linear-gradient(135deg, #0D1B3E, #0A0A0F)", borderRadius: 16, padding: 24, border: "1px solid rgba(201,168,76,0.3)", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{c.total_cost} ({incoterm}) — {currency}</p>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{c.total_without}</p>
                    <p style={{ fontSize: 36, fontWeight: 800, color: n(tariffRate) > 0 ? "#ef4444" : "#FFFFFF" }}>{currency} {fmt(result.totalWithout)}</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{c.unit_cost}: {currency} {fmt(result.unitWithout)}</p>
                  </div>

                  {withCert && n(prefRate) < n(tariffRate) && (
                    <>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 4 }}>{c.total_with}</p>
                        <p style={{ fontSize: 36, fontWeight: 800, color: "#22c55e" }}>{currency} {fmt(result.totalWith)}</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{c.unit_cost}: {currency} {fmt(result.unitWith)}</p>
                      </div>
                      <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 10, padding: "14px", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{c.saving}</p>
                        <p style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>{currency} {fmt(result.saving)}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Desglose */}
                <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 20, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>{c.breakdown}</p>
                  {[
                    [c.merch_value, result.fob, "#FFFFFF"],
                    [c.freight, result.freight, "rgba(255,255,255,0.7)"],
                    [`${c.insurance} (${insurancePct}%)`, result.insurance, "rgba(255,255,255,0.7)"],
                    [c.origin_total, result.origCosts, "rgba(255,255,255,0.7)"],
                    [`${c.tariff_amount} (${tariffRate}%)`, result.tariffAmt, "#ef4444"],
                    ...(withCert && n(prefRate) < n(tariffRate) ? [[`${c.tariff_amount} preferencial (${prefRate}%)`, result.prefAmt, "#22c55e"]] : []),
                    [c.dest_total, result.destCosts, "rgba(255,255,255,0.7)"],
                  ].map(([label, value, color], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label as string}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: color as string }}>{currency} {fmt(value as number)}</span>
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <Link href="/modulo03" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}>
                  {c.sim_cert}
                </Link>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic", textAlign: "center" }}>{c.disclaimer}</p>
              </div>
            ) : (
              <div style={{ background: "#0D1B3E", borderRadius: 16, padding: 40, border: "1px solid rgba(0,87,255,0.1)", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Ingresá el valor FOB para ver el cálculo en tiempo real</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub — Cálculo de referencia. No reemplaza consulta profesional.</p>
      </footer>
    </div>
  );
}
