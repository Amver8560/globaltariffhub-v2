import jsPDF from "jspdf";

const BLUE = [0, 87, 255] as const;
const DARK = [13, 27, 62] as const;
const GOLD = [201, 168, 76] as const;
const WHITE = [255, 255, 255] as const;
const GRAY = [120, 130, 150] as const;
const RED = [239, 68, 68] as const;
const GREEN = [34, 197, 94] as const;

type RGB = readonly [number, number, number];
function setColor(doc: jsPDF, color: RGB) { doc.setTextColor(color[0], color[1], color[2]); }
function setFill(doc: jsPDF, color: RGB) { doc.setFillColor(color[0], color[1], color[2]); }

function header(doc: jsPDF, title: string, subtitle: string) {
  // Fondo header
  setFill(doc, DARK);
  doc.rect(0, 0, 210, 28, "F");

  // Logo box
  setFill(doc, BLUE);
  doc.roundedRect(14, 7, 14, 14, 2, 2, "F");
  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("GTH", 21, 16, { align: "center" });

  // Nombre
  setColor(doc, WHITE);
  doc.setFontSize(13);
  doc.text("Global Tariff Hub", 32, 13);
  doc.setFontSize(8);
  setColor(doc, GRAY);
  doc.text("globaltariffhub.com", 32, 19);

  // Título del informe (derecha)
  setColor(doc, WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, 196, 12, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(doc, GRAY);
  doc.text(subtitle, 196, 19, { align: "right" });
}

function footer(doc: jsPDF, lang: string) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 210, 230);
    doc.line(14, 282, 196, 282);
    doc.setFontSize(7);
    setColor(doc, GRAY);
    const disclaimer = lang === "es"
      ? "Datos de referencia generados con IA. No reemplazan asesoramiento profesional de comercio exterior."
      : "Reference data generated with AI. Does not replace professional foreign trade advice.";
    doc.text(disclaimer, 14, 287);
    doc.text(`globaltariffhub.com  ·  ${i}/${pageCount}`, 196, 287, { align: "right" });
  }
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFillColor(13, 27, 62);
  doc.rect(14, y - 5, 182, 8, "F");
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(text, 18, y);
  return y + 8;
}

function row(doc: jsPDF, label: string, value: string, y: number, valueColor?: readonly [number, number, number]) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, GRAY);
  doc.text(label, 18, y);
  const vc = valueColor || DARK; doc.setTextColor(vc[0], vc[1], vc[2]);
  doc.setFont("helvetica", "bold");
  doc.text(value, 120, y);
  doc.setDrawColor(220, 225, 235);
  doc.line(14, y + 2, 196, y + 2);
  return y + 9;
}

// ── MÓDULO 02 — Simulación Certificado ───────────────────────────────────────
export function exportCertificatePDF(result: any, params: {
  origin: string; destination: string; tariffCode: string;
  tariffSystem: string; fobValue: string; lang: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { origin, destination, tariffCode, tariffSystem, fobValue, lang } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });

  header(doc, es ? "Informe de Simulación — Certificado de Origen" : "Simulation Report — Certificate of Origin", date);

  let y = 38;

  // Operación
  y = sectionTitle(doc, es ? "DATOS DE LA OPERACIÓN" : "OPERATION DATA", y);
  y = row(doc, es ? "País de origen" : "Country of origin", origin, y);
  y = row(doc, es ? "País de destino" : "Country of destination", destination, y);
  y = row(doc, `${es ? "Código" : "Code"} ${tariffSystem}`, tariffCode || "—", y);
  y = row(doc, `${es ? "Valor FOB" : "FOB Value"}`, `USD ${parseFloat(fobValue).toLocaleString()}`, y);
  y += 4;

  // Acuerdo
  y = sectionTitle(doc, es ? "ACUERDO COMERCIAL" : "TRADE AGREEMENT", y);
  y = row(doc, es ? "Acuerdo vigente" : "Applicable agreement", result.agreement?.name || "—", y);
  y = row(doc, es ? "Tasa sin certificado" : "Rate without certificate", String(result.tariff_without?.rate ?? "—"), y, RED);
  y = row(doc, es ? "Tasa con certificado" : "Rate with certificate", String(result.tariff_with?.rate ?? "—"), y, GREEN);
  y += 4;

  // Comparativa
  y = sectionTitle(doc, es ? "COMPARATIVA DE COSTOS" : "COST COMPARISON", y);
  y = row(doc, es ? "Arancel SIN certificado" : "Tariff WITHOUT certificate", `USD ${result.tariff_without?.amount?.toLocaleString() ?? "—"}`, y, RED);
  y = row(doc, es ? "Arancel CON certificado" : "Tariff WITH certificate", `USD ${result.tariff_with?.amount?.toLocaleString() ?? "—"}`, y, GREEN);
  y = row(doc, es ? "Costo certificado" : "Certificate cost", `USD ${result.certificate_cost?.amount?.toLocaleString() ?? "—"}`, y, GOLD as any);
  y += 2;

  // Ahorro highlight
  const netSaving = result.savings?.net ?? 0;
  doc.setFillColor(netSaving >= 0 ? 34 : 239, netSaving >= 0 ? 197 : 68, netSaving >= 0 ? 94 : 68);
  doc.roundedRect(14, y, 182, 14, 3, 3, "F");
  setColor(doc, WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(es ? "Ahorro neto estimado" : "Estimated net savings", 20, y + 6);
  doc.setFontSize(13);
  doc.text(`USD ${netSaving.toLocaleString()}`, 190, y + 9, { align: "right" });
  if (result.savings?.roi_percent) {
    doc.setFontSize(8);
    doc.text(`ROI ${result.savings.roi_percent}%`, 190, y + 3, { align: "right" });
  }
  y += 20;

  // Documentos requeridos
  if (result.requirements?.documents?.length) {
    y = sectionTitle(doc, es ? "DOCUMENTOS REQUERIDOS" : "REQUIRED DOCUMENTS", y);
    result.requirements.documents.forEach((d: any) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const docColor = d.mandatory ? RED : GRAY;
      doc.setTextColor(docColor[0], docColor[1], docColor[2]);
      const tag = d.mandatory ? (es ? "[OBLIGATORIO]" : "[MANDATORY]") : (es ? "[OPCIONAL]" : "[OPTIONAL]");
      doc.text(`${tag}  ${d.name}`, 18, y);
      y += 6;
      if (d.description) {
        setColor(doc, GRAY);
        doc.setFontSize(7);
        doc.text(d.description, 22, y);
        y += 5;
      }
    });
    y += 2;
  }

  // Regla de origen
  if (result.requirements?.origin_rule) {
    y = sectionTitle(doc, es ? "REGLA DE ORIGEN" : "ORIGIN RULE", y);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(doc, DARK);
    const lines = doc.splitTextToSize(result.requirements.origin_rule, 178);
    doc.text(lines, 18, y + 2);
    y += lines.length * 5 + 6;
  }

  // Disclaimer box
  doc.setFillColor(255, 235, 235);
  doc.roundedRect(14, y, 182, 16, 2, 2, "F");
  doc.setTextColor(180, 40, 40);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(es ? "⚠  SIMULACIÓN ÚNICAMENTE" : "⚠  SIMULATION ONLY", 18, y + 5);
  doc.setFont("helvetica", "normal");
  const disc = es
    ? "Este documento es una simulación informativa. No constituye un certificado de origen válido ni asesoramiento legal."
    : "This document is an informational simulation. It does not constitute a valid certificate of origin or legal advice.";
  const discLines = doc.splitTextToSize(disc, 174);
  doc.text(discLines, 18, y + 10);

  footer(doc, lang);
  doc.save(`GTH_Simulacion_Certificado_${tariffSystem}_${tariffCode || "consulta"}_${Date.now()}.pdf`);
}

// ── MÓDULO 03 — Calculadora CIF ──────────────────────────────────────────────
export function exportCIFPDF(result: any, params: {
  tariffCode: string; tariffSystem: string; origin: string; destination: string;
  incoterm: string; currency: string; fobValue: string;
  tariffRate: string; prefRate: string; withCert: boolean; lang: string;
  rateInfo?: any;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { tariffCode, tariffSystem, origin, destination, incoterm, currency,
    fobValue, tariffRate, prefRate, withCert, lang, rateInfo } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });
  const fmt = (n: number) => `${currency} ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  header(doc, es ? "Calculadora CIF e Incoterms" : "CIF & Incoterms Calculator", date);

  let y = 38;

  // Operación
  y = sectionTitle(doc, es ? "DATOS DE LA OPERACIÓN" : "OPERATION DATA", y);
  y = row(doc, "Incoterm", incoterm, y);
  y = row(doc, es ? "País de origen" : "Country of origin", origin || "—", y);
  y = row(doc, es ? "País de destino" : "Country of destination", destination || "—", y);
  y = row(doc, `${es ? "Código" : "Code"} ${tariffSystem}`, tariffCode || "—", y);
  if (rateInfo?.description) y = row(doc, es ? "Producto" : "Product", rateInfo.description, y);
  if (rateInfo?.agreement && rateInfo.agreement !== "null") y = row(doc, es ? "Acuerdo" : "Agreement", rateInfo.agreement, y);
  y += 4;

  // Desglose de costos
  y = sectionTitle(doc, es ? "DESGLOSE DE COSTOS" : "COST BREAKDOWN", y);
  const items = [
    [es ? "Valor FOB" : "FOB Value", result.fob],
    [es ? "Flete internacional" : "International freight", result.freight],
    [es ? "Seguro" : "Insurance", result.insurance],
    [es ? "Gastos origen" : "Origin costs", result.origCosts],
    [es ? `Arancel (${tariffRate}%)` : `Tariff (${tariffRate}%)`, result.tariffAmt],
    [es ? "Gastos destino" : "Destination costs", result.destCosts],
  ];
  items.forEach(([label, val]) => {
    if (val !== undefined && val !== null) {
      y = row(doc, String(label), fmt(val as number), y);
    }
  });
  y += 2;

  // Total highlight
  setFill(doc, DARK);
  doc.roundedRect(14, y, 182, 14, 3, 3, "F");
  setColor(doc, WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(es ? "COSTO TOTAL SIN CERTIFICADO" : "TOTAL COST WITHOUT CERTIFICATE", 20, y + 6);
  doc.setFontSize(13);
  doc.text(fmt(result.totalWithout), 190, y + 9, { align: "right" });
  y += 18;

  if (withCert && result.totalWith !== undefined) {
    setFill(doc, GREEN);
    doc.roundedRect(14, y, 182, 14, 3, 3, "F");
    setColor(doc, WHITE);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(es ? `COSTO CON CERTIFICADO (${prefRate}%)` : `COST WITH CERTIFICATE (${prefRate}%)`, 20, y + 6);
    doc.setFontSize(13);
    doc.text(fmt(result.totalWith), 190, y + 9, { align: "right" });
    y += 18;

    const saving = result.totalWithout - result.totalWith;
    if (saving > 0) {
      setFill(doc, GOLD);
      doc.roundedRect(14, y, 182, 10, 2, 2, "F");
      setColor(doc, DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(es ? `Ahorro estimado con certificado: ${fmt(saving)}` : `Estimated savings with certificate: ${fmt(saving)}`, 105, y + 6.5, { align: "center" });
      y += 14;
    }
  }

  footer(doc, lang);
  doc.save(`GTH_CIF_${incoterm}_${tariffCode || "consulta"}_${Date.now()}.pdf`);
}

// ── MÓDULO 01 — Búsqueda Arancelaria ─────────────────────────────────────────
export function exportSearchPDF(response: any, params: {
  origin: string; destination: string; system: string;
  query: string; lang: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { origin, destination, system, query, lang } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });

  header(doc, es ? "Informe de Búsqueda Arancelaria" : "Tariff Search Report", date);

  let y = 38;

  // Datos de la consulta
  y = sectionTitle(doc, es ? "DATOS DE LA CONSULTA" : "SEARCH DETAILS", y);
  y = row(doc, es ? "País de origen" : "Country of origin", origin || "—", y);
  y = row(doc, es ? "País de destino" : "Country of destination", destination || "—", y);
  y = row(doc, es ? "Sistema de nomenclatura" : "Nomenclature system", system, y);
  if (query) y = row(doc, es ? "Búsqueda realizada" : "Search query", query, y);
  if (response.route_info?.agreement && response.route_info.agreement !== "Ninguno") {
    y = row(doc, es ? "Acuerdo comercial" : "Trade agreement", response.route_info.agreement, y, GREEN);
  }
  y += 4;

  // Resultados
  response.results?.forEach((r: any, idx: number) => {
    if (y > 240) { doc.addPage(); y = 20; }

    y = sectionTitle(doc, `${es ? "RESULTADO" : "RESULT"} ${idx + 1}${r.description ? ` — ${r.description.substring(0, 50)}` : ""}`, y);

    // Códigos
    if (r.hs_code) y = row(doc, "Código HS", r.hs_code, y, BLUE);
    if (r.ncm_code) y = row(doc, "Código NCM", r.ncm_code, y, BLUE);
    if (r.taric_code) y = row(doc, "Código TARIC", r.taric_code, y, BLUE);
    if (r.chapter) y = row(doc, es ? "Capítulo" : "Chapter", r.chapter, y);

    // Tasas
    if (r.base_rate !== undefined) y = row(doc, es ? "Tasa base" : "Base rate", `${r.base_rate}%`, y, RED);
    if (r.preferential_rate !== undefined) y = row(doc, es ? "Tasa preferencial" : "Preferential rate", `${r.preferential_rate}%`, y, GREEN);
    if (r.trade_agreement) y = row(doc, es ? "Acuerdo" : "Agreement", r.trade_agreement, y, GOLD);
    if (r.agreement_note) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(doc, GRAY);
      const lines = doc.splitTextToSize(r.agreement_note, 178);
      doc.text(lines, 18, y);
      y += lines.length * 4 + 4;
    }

    // Documentos exportación
    if (r.origin_documents?.length) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(doc, GOLD);
      doc.text(es ? "Documentos exportación:" : "Export documents:", 18, y); y += 5;
      r.origin_documents.forEach((d: string) => {
        doc.setFont("helvetica", "normal");
        setColor(doc, GRAY);
        doc.setFontSize(7);
        doc.text(`• ${d}`, 22, y); y += 4;
      });
      y += 2;
    }

    // Documentos importación
    if (r.destination_documents?.length) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(doc, GOLD);
      doc.text(es ? "Documentos importación:" : "Import documents:", 18, y); y += 5;
      r.destination_documents.forEach((d: string) => {
        doc.setFont("helvetica", "normal");
        setColor(doc, GRAY);
        doc.setFontSize(7);
        doc.text(`• ${d}`, 22, y); y += 4;
      });
      y += 2;
    }

    // Notas
    if (r.notes) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      setColor(doc, GRAY);
      const noteLines = doc.splitTextToSize(r.notes, 178);
      doc.text(noteLines, 18, y);
      y += noteLines.length * 4 + 4;
    }

    y += 4;
  });

  footer(doc, lang);
  doc.save(`GTH_Busqueda_${system}_${Date.now()}.pdf`);
}

// ── MÓDULO 04 — Viabilidad de Importación ────────────────────────────────────
export function exportViabilityPDF(result: any, params: {
  supplierCountry: string; destination: string; tariffSystem: string;
  fobUnit: string; quantity: string; lang: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { supplierCountry, destination, tariffSystem, fobUnit, quantity, lang } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });
  const fmt = (n: number) => `USD ${n?.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}`;

  header(doc, es ? "Análisis de Viabilidad de Importación" : "Import Viability Analysis", date);

  let y = 38;

  // Datos de la operación
  y = sectionTitle(doc, es ? "DATOS DE LA OPERACIÓN" : "OPERATION DATA", y);
  y = row(doc, es ? "País proveedor" : "Supplier country", supplierCountry, y);
  y = row(doc, es ? "País de destino" : "Destination country", destination, y);
  y = row(doc, es ? "Sistema arancelario" : "Tariff system", tariffSystem, y);
  y = row(doc, es ? "Precio FOB unitario" : "FOB unit price", `USD ${fobUnit}`, y);
  y = row(doc, es ? "Cantidad" : "Quantity", quantity, y);
  y += 4;

  // Producto identificado
  y = sectionTitle(doc, es ? "PRODUCTO IDENTIFICADO" : "IDENTIFIED PRODUCT", y);
  y = row(doc, es ? "Nombre" : "Name", result.product?.product_name || result.product?.description || "—", y);
  if (result.product?.hs_code) y = row(doc, "Código HS", result.product.hs_code, y, BLUE);
  if (result.product?.ncm_code) y = row(doc, "Código NCM", result.product.ncm_code, y, BLUE);
  if (result.product?.taric_code && result.product.taric_code !== "null") y = row(doc, "Código TARIC", result.product.taric_code, y, BLUE);
  if (result.product?.chapter) y = row(doc, es ? "Capítulo" : "Chapter", result.product.chapter, y);

  // Arancel efectivo
  if (result.product?.exception_applied) {
    y = row(doc, es ? "Tasa general" : "Standard rate", `${result.product.standard_rate}%`, y, RED);
    y = row(doc, es ? "Tasa efectiva (excepción)" : "Effective rate (exception)", `${result.product.effective_rate}%`, y, GREEN);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    setColor(doc, GRAY);
    const excLines = doc.splitTextToSize(result.product.exception_applied, 178);
    doc.text(excLines, 18, y); y += excLines.length * 4 + 4;
  } else {
    y = row(doc, es ? "Tasa arancelaria" : "Tariff rate", `${result.product?.tariff_rate ?? "—"}%`, y, RED);
  }
  y += 4;

  // Estructura de costos
  y = sectionTitle(doc, es ? "ESTRUCTURA DE COSTOS" : "COST BREAKDOWN", y);
  y = row(doc, es ? "Valor FOB total" : "Total FOB value", fmt(result.commercial?.fob_total), y);
  y = row(doc, es ? "Flete internacional" : "International freight", fmt(result.commercial?.freight_total), y);
  y = row(doc, es ? "Seguro" : "Insurance", fmt(result.commercial?.insurance), y);
  y = row(doc, es ? "Valor CIF" : "CIF value", fmt(result.commercial?.cif), y, BLUE);
  y += 4;

  // Tributos
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, `${es ? "TRIBUTOS EN DESTINO" : "DESTINATION TAXES"} — ${result.taxes?.country || destination}`, y);
  result.taxes?.lines?.forEach((line: any) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(doc, GRAY);
    doc.text(`${line.name}  (${line.rate})`, 18, y);
    setColor(doc, [255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(line.amount), 190, y, { align: "right" });
    doc.setDrawColor(220, 225, 235);
    doc.line(14, y + 2, 196, y + 2);
    y += 9;
  });

  // Total tributos + costo nacionalizado
  y += 2;
  setFill(doc, RED);
  doc.roundedRect(14, y, 182, 10, 2, 2, "F");
  setColor(doc, WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(es ? `Total tributos (${result.taxes?.tax_burden_pct ?? "—"}% carga)` : `Total taxes (${result.taxes?.tax_burden_pct ?? "—"}% burden)`, 18, y + 6.5);
  doc.text(fmt(result.taxes?.total_taxes), 190, y + 6.5, { align: "right" });
  y += 14;

  setFill(doc, DARK);
  doc.roundedRect(14, y, 182, 14, 3, 3, "F");
  setColor(doc, WHITE);
  doc.setFontSize(9);
  doc.text(es ? "COSTO NACIONALIZADO TOTAL" : "TOTAL LANDED COST", 18, y + 6);
  doc.setFontSize(13);
  doc.text(fmt(result.taxes?.landed_cost), 190, y + 10, { align: "right" });
  y += 18;

  // Precio de venta sugerido
  if (y > 230) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, es ? "PRECIO DE VENTA SUGERIDO (por unidad)" : "SUGGESTED SELLING PRICE (per unit)", y);
  y = row(doc, es ? "Mínimo" : "Minimum", fmt(result.analysis?.suggested_price_min), y, GREEN);
  y = row(doc, es ? "Referencia" : "Reference", fmt(result.analysis?.suggested_price_unit), y, GOLD);
  y = row(doc, es ? "Máximo" : "Maximum", fmt(result.analysis?.suggested_price_max), y, BLUE);
  y = row(doc, es ? "Costo nacionalizado x unidad" : "Landed cost per unit", fmt(result.analysis?.landed_unit), y);
  y += 4;

  // Nota importación
  if (result.taxes?.import_method_note) {
    doc.setFillColor(201, 168, 76, 15 as any);
    doc.roundedRect(14, y, 182, 18, 2, 2, "F");
    setColor(doc, GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(es ? "💡 Recomendación" : "💡 Recommendation", 18, y + 5);
    doc.setFont("helvetica", "normal");
    setColor(doc, GRAY);
    const noteLines = doc.splitTextToSize(result.taxes.import_method_note, 174);
    doc.text(noteLines, 18, y + 11);
    y += 22;
  }

  // Permisos requeridos
  if (result.product?.requires_permits?.length > 0) {
    y = sectionTitle(doc, es ? "PERMISOS / LICENCIAS REQUERIDAS" : "REQUIRED PERMITS / LICENSES", y);
    result.product.requires_permits.forEach((p: string) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      setColor(doc, RED);
      doc.text(`⚠  ${p}`, 18, y); y += 6;
    });
  }

  footer(doc, lang);
  doc.save(`GTH_Viabilidad_${destination}_${Date.now()}.pdf`);
}
