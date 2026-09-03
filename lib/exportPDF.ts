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

// Elimina caracteres no soportados por jsPDF (CJK, árabe, etc.)
function safe(text: string): string {
  return (text || "").replace(/[^\x00-\x7FÀ-ɏ -ÿ]/g, "");
}

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
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const lines = doc.splitTextToSize(text, 174);
  const rectH = lines.length * 5 + 4;
  doc.setFillColor(13, 27, 62);
  doc.rect(14, y - 5, 182, rectH, "F");
  setColor(doc, GOLD);
  doc.text(lines, 18, y);
  return y + rectH - 1;
}

function row(doc: jsPDF, label: string, value: string, y: number, valueColor?: readonly [number, number, number]) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, GRAY);
  doc.text(label, 18, y);
  const vc = valueColor || DARK;
  doc.setTextColor(vc[0], vc[1], vc[2]);
  doc.setFont("helvetica", "bold");
  // Wrap value text so it never overflows the right margin
  const valueLines = doc.splitTextToSize(value, 72);
  doc.text(valueLines, 120, y);
  const rowH = Math.max(9, valueLines.length * 5 + 4);
  doc.setDrawColor(220, 225, 235);
  doc.line(14, y + rowH - 4, 196, y + rowH - 4);
  return y + rowH;
}

// Strips trailing % to avoid %% when value already contains it
function fmtRate(val: any): string {
  if (val === undefined || val === null) return "—";
  const s = String(val).trim();
  return s.endsWith("%") ? s : `${s}%`;
}

const TARIFF_STATUS_ES: Record<string, string> = {
  determined: "Determinado", referential: "Referencial", not_determined: "No determinado",
};
const TARIFF_STATUS_EN: Record<string, string> = {
  determined: "Determined", referential: "Referential", not_determined: "Not determined",
};

/** Filas de un TariffDatum en el PDF: valor + estado + fuente + aviso de validación. */
function tariffDatumRows(
  doc: jsPDF,
  d: import("@/lib/tariffDatum").TariffDatum | null | undefined,
  y: number,
  es: boolean,
): number {
  const status = d?.status ?? "not_determined";
  const stLabel = (es ? TARIFF_STATUS_ES : TARIFF_STATUS_EN)[status] ?? status;
  y = row(doc, es ? "Tasa arancelaria" : "Tariff rate",
    d?.value != null ? `${fmtRate(d.value)} (${stLabel})` : (es ? `No determinado` : `Not determined`), y, RED);
  if (d?.source?.name && d.source.name !== "—") {
    y = row(doc, es ? "Fuente" : "Source", String(d.source.name) + (d.as_of?.value ? ` · ${d.as_of.value}` : ""), y);
  }
  if (d?.requires_validation) {
    y = row(doc, es ? "Validación" : "Validation",
      es ? "Requiere validación en el sistema oficial del país importador o con un despachante."
         : "Requires validation in the importing country's official system or with a customs broker.", y, GOLD);
  }
  return y;
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

  header(doc, es ? "Informe de Análisis — Preferencia Arancelaria por Origen" : "Analysis Report — Preferential Tariff by Origin", date);

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
  y = tariffDatumRows(doc, result.tariff?.general, y, es);
  if (result.tariff_not_determined) {
    y = row(doc, es ? "Comparativo" : "Comparison",
      es ? "No disponible: sin una tasa arancelaria no se puede comparar el escenario con/sin certificado."
         : "Unavailable: without a tariff rate the with/without-certificate scenario cannot be compared.", y, GOLD);
    doc.save(`GTH_Analisis_Preferencia_${tariffSystem}_${tariffCode || "consulta"}_${Date.now()}.pdf`);
    return;
  }
  y = row(doc, es ? "Tasa sin certificado" : "Rate without certificate", String(result.tariff_without?.rate ?? "—"), y, RED);
  y = row(doc, es ? "Tasa con certificado" : "Rate with certificate", String(result.tariff_with?.rate ?? "—"), y, GREEN);
  if (result.tariff_basis === "referential") {
    y = row(doc, es ? "Base del comparativo" : "Comparison basis",
      es ? "Estimación referencial — tasas a nivel HS6, no definitivas. Preferencia sujeta a reglas de origen y validación."
         : "Referential estimate — HS6-level rates, not definitive. Preference subject to rules of origin and validation.", y, GOLD as any);
  }
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
  doc.text(
    (es ? "Ahorro neto estimado" : "Estimated net savings") +
      (result.tariff_basis === "referential" ? (es ? " (referencial)" : " (referential)") : ""),
    20, y + 6,
  );
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
  doc.text(es ? "⚠  ANÁLISIS ORIENTATIVO" : "⚠  INDICATIVE ANALYSIS", 18, y + 5);
  doc.setFont("helvetica", "normal");
  const disc = es
    ? "Este documento es un análisis informativo de referencia. No constituye un certificado de origen válido ni asesoramiento legal o aduanero."
    : "This document is an informational reference analysis. It does not constitute a valid certificate of origin or legal/customs advice.";
  const discLines = doc.splitTextToSize(disc, 174);
  doc.text(discLines, 18, y + 10);

  footer(doc, lang);
  doc.save(`GTH_Analisis_Preferencia_${tariffSystem}_${tariffCode || "consulta"}_${Date.now()}.pdf`);
}

// ── Bloque 3 — Bloque de resultado del motor canónico de costos ──────────────
// Consumido por M3 (exportCIFPDF) y M4 (exportViabilityPDF). Estructura D9:
// precio declarado → base estimada para el arancel → arancel → estimación GTH
// → (aparte) otros costos declarados. No se usan rótulos de costo total ni de
//   operación aduanera completada; el resultado es una estimación de alcance GTH.
function costResultRows(
  doc: jsPDF,
  cost: any,
  opts: { incoterm: string; currency: string; fxRate: number | null; es: boolean; declaredValue: number },
  y: number,
): number {
  const { incoterm, currency, fxRate, es, declaredValue } = opts;
  const conv = (n: number) => (currency !== "USD" && fxRate ? n * fxRate : n);
  const fmt = (n: number) =>
    `${currency} ${conv(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  y = sectionTitle(doc, es ? "ESTIMACIÓN DENTRO DEL ALCANCE DE GTH" : "ESTIMATE WITHIN GTH'S SCOPE", y);
  y = row(doc, `${es ? "Precio comercial cotizado" : "Quoted commercial price"} (${incoterm})`, fmt(declaredValue), y);

  if (cost.already_in_price?.length) {
    y = row(doc, es ? "Ya en el precio (no se re-suma)" : "Already in price (not re-added)", cost.already_in_price.join(" · "), y);
  }
  for (const li of cost.added_to_base ?? []) {
    y = row(doc, `+ ${li.label_es}`, fmt(li.amount), y);
  }
  y = row(doc, es ? "Base estimada para el arancel" : "Estimated duty base", fmt(cost.base_known), y, BLUE);
  y = row(
    doc,
    es ? "Nota de base" : "Base note",
    es
      ? "La base definitiva aplicable puede variar según la normativa de la jurisdicción importadora y debe validarse cuando corresponda."
      : "The final applicable base may vary under the importing jurisdiction's rules and must be validated where applicable.",
    y,
    GOLD,
  );

  if (cost.missing_base_components?.length) {
    y = row(
      doc,
      es ? "No informado" : "Not informed",
      (es ? "Falta: " : "Missing: ") +
        cost.missing_base_components.join(", ") +
        (es ? ". La estimación puede variar al incorporarlo(s). No se asume ningún valor." : ". The estimate may change once added. No value is assumed."),
      y,
      GOLD,
    );
  }

  if (cost.completeness === "not_computable") {
    y = row(doc, es ? "Estado" : "Status", cost.note_es || (es ? "No se puede estimar el arancel." : "The tariff cannot be estimated."), y, GOLD);
    return y + 2;
  }

  y = row(doc, `${es ? "Arancel" : "Tariff"} (${cost.duty?.rate ?? "—"}% · ${es ? "referencial" : "referential"})`, fmt(cost.duty?.amount ?? 0), y, RED);
  y += 2;

  setFill(doc, DARK);
  doc.roundedRect(14, y, 182, 16, 3, 3, "F");
  setColor(doc, WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const label = (es ? "Estimación de la operación dentro del alcance de GTH" : "Operation estimate within GTH's scope") +
    (cost.completeness === "partial" ? (es ? " (provisional)" : " (provisional)") : "");
  doc.text(label.toUpperCase(), 18, y + 6);
  doc.setFontSize(13);
  doc.text(fmt(cost.operation_estimate ?? 0), 190, y + 11, { align: "right" });
  y += 20;

  if (cost.other_costs_declared?.length) {
    y = sectionTitle(doc, es ? "OTROS COSTOS DE LA OPERACIÓN QUE INFORMASTE" : "OTHER OPERATION COSTS YOU INFORMED", y);
    for (const li of cost.other_costs_declared) y = row(doc, li.label_es, fmt(li.amount), y);
    if (cost.total_with_other_costs != null) {
      y = row(doc, es ? "Total incluyendo lo que informaste" : "Total including what you informed", fmt(cost.total_with_other_costs), y, BLUE);
    }
  }
  return y + 2;
}

// ── MÓDULO 03 — Calculadora de costos de operación ──────────────────────────
export function exportCIFPDF(
  data: {
    cost: any;
    costPref?: any;
    incoterm: string;
    currency: string;
    fxRate: number | null;
    declaredValue: string;
    tariffCode: string;
    tariffSystem: string;
    origin: string;
    destination: string;
    withCert: boolean;
    prefRate: string;
    rateInfo?: any;
    notIncludedNotice: string;
  },
  params: { lang: string },
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { lang } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });
  const conv = (n: number) => (data.currency !== "USD" && data.fxRate ? n * data.fxRate : n);
  const fmtC = (n: number) => `${data.currency} ${conv(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  header(doc, es ? "Estimación de costo de operación" : "Operation cost estimate", date);
  let y = 38;

  y = sectionTitle(doc, es ? "DATOS DE LA OPERACIÓN" : "OPERATION DATA", y);
  y = row(doc, "Incoterm", data.incoterm, y);
  if (data.cost?.scope_note_es && es) y = row(doc, "", data.cost.scope_note_es, y);
  y = row(doc, es ? "País de origen" : "Country of origin", data.origin || "—", y);
  y = row(doc, es ? "País de destino" : "Country of destination", data.destination || "—", y);
  y = row(doc, `${es ? "Código" : "Code"} ${data.tariffSystem}`, data.tariffCode || "—", y);
  if (data.rateInfo?.description) y = row(doc, es ? "Producto" : "Product", data.rateInfo.description, y);
  y += 4;

  y = costResultRows(doc, data.cost, {
    incoterm: data.incoterm, currency: data.currency, fxRate: data.fxRate, es,
    declaredValue: parseFloat(data.declaredValue) || 0,
  }, y);

  if (data.withCert && data.costPref && data.costPref.operation_estimate != null && data.cost.operation_estimate != null) {
    const saving = data.cost.operation_estimate - data.costPref.operation_estimate;
    y = row(doc, `${es ? "Estimación con certificado preferencial" : "Estimate with preferential certificate"} (${data.prefRate}%)`, fmtC(data.costPref.operation_estimate), y, GREEN);
    if (saving > 0) y = row(doc, es ? "Ahorro estimado con certificado" : "Estimated saving with certificate", fmtC(saving), y, GOLD);
  }

  if (data.notIncludedNotice) {
    if (y > 255) { doc.addPage(); y = 20; }
    setColor(doc, GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const nl = doc.splitTextToSize(data.notIncludedNotice, 178);
    doc.text(nl, 14, y); y += nl.length * 4 + 4;
  }

  footer(doc, lang);
  doc.save(`GTH_Costo_Operacion_${data.incoterm}_${data.tariffCode || "consulta"}_${Date.now()}.pdf`);
}

// ── MÓDULO 01 — Búsqueda Arancelaria ─────────────────────────────────────────
export function exportSearchPDF(response: any, params: {
  origin: string; destination: string; system: string;
  query: string; lang: string; operation?: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { origin, destination, system, query, lang, operation } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });

  const opLabel = operation === "importacion" ? (es ? "Importación" : "Import")
    : operation === "exportacion" ? (es ? "Exportación" : "Export")
    : "";
  const reportTitle = opLabel
    ? `${es ? "Informe de" : "Report —"} ${opLabel} ${es ? "— Búsqueda Arancelaria" : "Tariff Search"}`
    : (es ? "Informe de Búsqueda Arancelaria" : "Tariff Search Report");

  header(doc, reportTitle, date);

  let y = 38;

  // Datos de la consulta
  y = sectionTitle(doc, es ? "DATOS DE LA CONSULTA" : "SEARCH DETAILS", y);
  if (opLabel) y = row(doc, es ? "Operación" : "Operation", opLabel, y, GOLD);
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
    // Salto de página si no hay espacio para el bloque mínimo
    if (y > 245) { doc.addPage(); y = 20; }

    const titleText = `${es ? "RESULTADO" : "RESULT"} ${idx + 1}${r.description ? ` — ${r.description}` : ""}`;
    y = sectionTitle(doc, titleText, y);

    // Códigos
    if (r.hs_code)   y = row(doc, "Código HS",   r.hs_code,   y, BLUE);
    if (r.ncm_code)  y = row(doc, "Código NCM",  r.ncm_code,  y, BLUE);
    if (r.taric_code) y = row(doc, "Código TARIC", r.taric_code, y, BLUE);
    if (r.chapter)   y = row(doc, es ? "Capítulo" : "Chapter", r.chapter, y);

    // Tasa arancelaria (Bloque 2) — estado + fuente + validación.
    y = tariffDatumRows(doc, r.tariff?.general, y, es);
    if (r.tariff?.preferential?.value != null) {
      y = row(doc, es ? "Tasa preferencial (referencial)" : "Preferential rate (referential)", fmtRate(r.tariff.preferential.value), y, GREEN);
    }
    if (r.trade_agreement && r.trade_agreement !== "Ninguno") y = row(doc, es ? "Acuerdo" : "Agreement", r.trade_agreement, y, GOLD);

    if (r.agreement_note) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(doc, GRAY);
      const lines = doc.splitTextToSize(r.agreement_note, 174);
      doc.text(lines, 18, y);
      y += lines.length * 4 + 4;
    }

    // Documentos exportación
    if (r.origin_documents?.length) {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(doc, GOLD);
      doc.text(es ? "Documentos exportación:" : "Export documents:", 18, y);
      y += 5;
      r.origin_documents.forEach((d: string) => {
        if (y > 268) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "normal");
        setColor(doc, GRAY);
        doc.setFontSize(7);
        const dLines = doc.splitTextToSize(`• ${safe(d)}`, 170);
        doc.text(dLines, 22, y);
        y += dLines.length * 4;
      });
      y += 3;
    }

    // Documentos importación
    if (r.destination_documents?.length) {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(doc, GOLD);
      doc.text(es ? "Documentos importación:" : "Import documents:", 18, y);
      y += 5;
      r.destination_documents.forEach((d: string) => {
        if (y > 268) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "normal");
        setColor(doc, GRAY);
        doc.setFontSize(7);
        const dLines = doc.splitTextToSize(`• ${safe(d)}`, 170);
        doc.text(dLines, 22, y);
        y += dLines.length * 4;
      });
      y += 3;
    }

    // Tributos en destino — 3 columnas en la misma línea: código | tasa | descripción
    if (r.taxes?.length) {
      if (y > 245) { doc.addPage(); y = 20; }
      y = sectionTitle(doc, es ? "ARANCELES EN DESTINO" : "DESTINATION TARIFFS", y);
      r.taxes.forEach((tax: any, ti: number) => {
        if (y > 265) { doc.addPage(); y = 20; }
        const isZero = String(tax.rate) === "0%";
        const codeText = safe(String(tax.code));
        const rateText = safe(String(tax.rate));
        const labelText = safe(tax.note ? `${tax.label} — ${tax.note}` : tax.label);

        // Calcular líneas PRIMERO para saber la altura real de la fila
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const codeLines = doc.splitTextToSize(codeText, 48);
        doc.setFont("helvetica", "normal");
        const labelLines = doc.splitTextToSize(labelText, 96);
        const rowH = Math.max(codeLines.length * 5.5, labelLines.length * 5, 10);
        const pad = 3;

        // Separadores verticales con altura correcta
        doc.setDrawColor(180, 200, 230);
        doc.line(68, y - pad, 68, y + rowH);
        doc.line(92, y - pad, 92, y + rowH);

        // Col 1 — Código (dorado, bold, 8pt)
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        setColor(doc, GOLD);
        doc.text(codeLines, 20, y);

        // Col 2 — Tasa (bold, coloreada, 10pt)
        doc.setFontSize(10);
        doc.setTextColor(isZero ? 150 : 210, isZero ? 150 : 50, isZero ? 150 : 50);
        doc.text(rateText, 72, y);

        // Col 3 — Descripción (normal, 8pt)
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        setColor(doc, [100, 120, 150]);
        doc.text(labelLines, 96, y);

        // Línea horizontal separadora
        doc.setDrawColor(210, 218, 235);
        doc.line(14, y + rowH, 196, y + rowH);
        y += rowH + 2;
      });
      y += 4;
    }

    // Notas — por qué este código arancelario
    if (r.notes) {
      if (y > 255) { doc.addPage(); y = 20; }
      // Fondo destacado
      const noteText = safe(r.notes);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      setColor(doc, [200, 210, 230]);
      const noteLines = doc.splitTextToSize(noteText, 166);
      const noteH = noteLines.length * 5.5 + 10;
      doc.setFillColor(13, 27, 62);
      doc.setDrawColor(201, 168, 76);
      doc.roundedRect(14, y - 4, 182, noteH, 3, 3, "FD");
      // Etiqueta
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(doc, GOLD);
      doc.text("¿Por qué este código?", 20, y + 2);
      // Texto
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      setColor(doc, [200, 210, 230]);
      doc.text(noteLines, 20, y + 9);
      y += noteH + 6;
    }

    y += 5;
  });

  footer(doc, lang);
  doc.save(`GTH_Busqueda_${system}_${Date.now()}.pdf`);
}

// ── MÓDULO 04 — Viabilidad de Importación ────────────────────────────────────
export function exportViabilityPDF(result: any, params: {
  supplierCountry: string; destination: string; tariffSystem: string;
  fobUnit: string; quantity: string; lang: string;
  currency?: string; fxRate?: number | null;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { supplierCountry, destination, tariffSystem, quantity, lang } = params;
  const es = lang === "es";
  const date = new Date().toLocaleDateString(es ? "es-AR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });
  const commercial = result.commercial || {};
  const currency = params.currency || commercial.currency || "USD";
  const fxRate = params.fxRate ?? null;

  header(doc, es ? "Análisis de Viabilidad de Importación" : "Import Viability Analysis", date);

  let y = 38;

  // Datos de la operación
  y = sectionTitle(doc, es ? "DATOS DE LA OPERACIÓN" : "OPERATION DATA", y);
  y = row(doc, es ? "País proveedor" : "Supplier country", supplierCountry, y);
  y = row(doc, es ? "País de destino" : "Destination country", destination, y);
  y = row(doc, es ? "Sistema arancelario" : "Tariff system", tariffSystem, y);
  y = row(doc, "Incoterm", commercial.incoterm || "—", y);
  y = row(doc, es ? "Precio unitario cotizado" : "Quoted unit price", `${currency} ${(commercial.unit_price != null && currency !== "USD" && fxRate ? commercial.unit_price * fxRate : commercial.unit_price) ?? "—"}`, y);
  y = row(doc, es ? "Cantidad" : "Quantity", String(commercial.quantity ?? quantity), y);
  y += 4;

  // Producto identificado
  y = sectionTitle(doc, es ? "PRODUCTO IDENTIFICADO" : "IDENTIFIED PRODUCT", y);
  y = row(doc, es ? "Nombre" : "Name", result.product?.product_name || result.product?.description || "—", y);
  if (result.product?.hs_code) y = row(doc, "Código HS", result.product.hs_code, y, BLUE);
  if (result.product?.ncm_code) y = row(doc, "Código NCM", result.product.ncm_code, y, BLUE);
  if (result.product?.taric_code && result.product.taric_code !== "null") y = row(doc, "Código TARIC", result.product.taric_code, y, BLUE);
  if (result.product?.chapter) y = row(doc, es ? "Capítulo" : "Chapter", result.product.chapter, y);

  // Arancel — resuelto por jurisdicción/nomenclatura/fuente (Bloque 2)
  y = tariffDatumRows(doc, result.product?.tariff, y, es);
  y += 4;

  // Motor canónico de costos (Bloque 3 — mismo bloque que M3)
  if (result.cost) {
    y = costResultRows(doc, result.cost, {
      incoterm: commercial.incoterm || "—",
      currency,
      fxRate,
      es,
      declaredValue: commercial.declared_value || 0,
    }, y);
  }

  // Nota de alcance — siempre visible.
  if (result.not_included_notice) {
    if (y > 255) { doc.addPage(); y = 20; }
    setColor(doc, GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const nl = doc.splitTextToSize(result.not_included_notice, 178);
    doc.text(nl, 14, y); y += nl.length * 4 + 4;
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
