// ─────────────────────────────────────────────────────────────────────────────
// GTH — Motor de Tributos de Importación
// Última actualización: Junio 2025
// IMPORTANTE: Tasas de referencia. Verificar con fuente oficial antes de operar.
// ─────────────────────────────────────────────────────────────────────────────

export interface TaxInput {
  cif: number;          // Valor CIF en USD
  tariff_rate: number;  // Tasa arancelaria específica del producto (%)
  destination: string;  // País de destino
}

export interface TaxLineItem {
  name: string;
  base: string;
  rate: string;
  amount: number;
}

export interface TaxResult {
  country: string;
  cif: number;
  lines: TaxLineItem[];
  total_taxes: number;
  landed_cost: number;         // CIF + todos los tributos
  tax_burden_pct: number;      // % de incremento sobre CIF
  import_method_note: string;  // Recomendación courier vs formal
  last_updated: string;
  disclaimer: string;
}

// ── ARGENTINA ──────────────────────────────────────────────────────────────
function calcArgentina(cif: number, tariff_rate: number): TaxResult {
  const DI = cif * (tariff_rate / 100);
  const TE = Math.min(cif * 0.03, 500);          // Tasa Estadística 3% — tope USD 500
  const baseIVA = cif + DI + TE;
  const IVA = baseIVA * 0.21;
  const IVA_AD = baseIVA * 0.20;
  const GANANCIAS = baseIVA * 0.06;
  const total = DI + TE + IVA + IVA_AD + GANANCIAS;

  return {
    country: "Argentina",
    cif,
    lines: [
      { name: "Derecho de Importación (DI)", base: "CIF", rate: `${tariff_rate}%`, amount: DI },
      { name: "Tasa Estadística", base: "CIF", rate: "3% (tope USD 500)", amount: TE },
      { name: "IVA Importación", base: "CIF + DI + TE", rate: "21%", amount: IVA },
      { name: "IVA Adicional", base: "CIF + DI + TE", rate: "20%", amount: IVA_AD },
      { name: "Percepción Ganancias", base: "CIF + DI + TE", rate: "6%", amount: GANANCIAS },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: cif < 200
      ? "Monto bajo CIF. Evaluar puerta a puerta (courier) — límite de franquicia USD 200 por envío personal."
      : "Despacho formal recomendado. Requiere despachante de aduana para valores CIF mayores a USD 200 comerciales.",
    last_updated: "2025-06-01",
    disclaimer: "Tasas vigentes a junio 2025. No incluye percepciones provinciales (IIBB). Verificar con AFIP y despachante.",
  };
}

// ── BRASIL ─────────────────────────────────────────────────────────────────
function calcBrasil(cif: number, tariff_rate: number): TaxResult {
  const II = cif * (tariff_rate / 100);
  const IPI_rate = 0.05; // promedio — varía por producto
  const IPI = (cif + II) * IPI_rate;
  const PIS = (cif + II + IPI) * 0.021;
  const COFINS = (cif + II + IPI) * 0.0965;
  // ICMS 18% SP — base de cálculo: se calcula "por dentro"
  const basePreICMS = cif + II + IPI + PIS + COFINS;
  const ICMS = basePreICMS / (1 - 0.18) * 0.18;
  const total = II + IPI + PIS + COFINS + ICMS;

  return {
    country: "Brasil",
    cif,
    lines: [
      { name: "II — Imposto de Importação", base: "CIF", rate: `${tariff_rate}%`, amount: II },
      { name: "IPI — Imposto sobre Produtos Industrializados", base: "CIF + II", rate: "5% (referencial)", amount: IPI },
      { name: "PIS", base: "CIF + II + IPI", rate: "2.1%", amount: PIS },
      { name: "COFINS", base: "CIF + II + IPI", rate: "9.65%", amount: COFINS },
      { name: "ICMS (SP — referencial)", base: "base por dentro", rate: "18%", amount: ICMS },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Importación formal requiere RADAR (habilitación Receita Federal). Considerar despachante aduaneiro.",
    last_updated: "2025-06-01",
    disclaimer: "ICMS varía por estado. IPI varía por NCM. Tasas referenciales — verificar en Receita Federal.",
  };
}

// ── URUGUAY ────────────────────────────────────────────────────────────────
function calcUruguay(cif: number, tariff_rate: number): TaxResult {
  const DGA = cif * (tariff_rate / 100);
  const IMESI_rate = 0.0;  // Varía — 0% para mayoría de productos
  const IMESI = cif * IMESI_rate;
  const baseIVA = cif + DGA + IMESI;
  const IVA = baseIVA * 0.22;
  const total = DGA + IMESI + IVA;

  return {
    country: "Uruguay",
    cif,
    lines: [
      { name: "Derecho de Aduana (DGA)", base: "CIF", rate: `${tariff_rate}%`, amount: DGA },
      { name: "IMESI", base: "CIF", rate: "0% (varía por producto)", amount: IMESI },
      { name: "IVA Importación", base: "CIF + DGA + IMESI", rate: "22%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Uruguay tiene régimen simplificado para importaciones hasta USD 200. Zona Franca puede ofrecer ventajas adicionales.",
    last_updated: "2025-06-01",
    disclaimer: "IMESI aplica a tabaco, alcohol, vehículos y otros específicos. Verificar en DNA Uruguay.",
  };
}

// ── PARAGUAY ───────────────────────────────────────────────────────────────
function calcParaguay(cif: number, tariff_rate: number): TaxResult {
  const Arancel = cif * (tariff_rate / 100);
  const baseIVA = cif + Arancel;
  const IVA = baseIVA * 0.10;
  const total = Arancel + IVA;

  return {
    country: "Paraguay",
    cif,
    lines: [
      { name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: Arancel },
      { name: "IVA Importación", base: "CIF + Arancel", rate: "10%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Paraguay tiene baja carga tributaria. Ciudad del Este es zona especial con regímenes diferenciados.",
    last_updated: "2025-06-01",
    disclaimer: "Verificar en Dirección Nacional de Aduanas Paraguay (DNA). IVA general 10%.",
  };
}

// ── CHILE ──────────────────────────────────────────────────────────────────
function calcChile(cif: number, tariff_rate: number): TaxResult {
  const Arancel = cif * (tariff_rate / 100);
  const baseIVA = cif + Arancel;
  const IVA = baseIVA * 0.19;
  const total = Arancel + IVA;

  return {
    country: "Chile",
    cif,
    lines: [
      { name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}% (general 6%)`, amount: Arancel },
      { name: "IVA Importación", base: "CIF + Arancel", rate: "19%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Chile tiene TLCs con muchos países — arancel puede ser 0% según origen. Verificar acuerdo vigente.",
    last_updated: "2025-06-01",
    disclaimer: "Chile tiene TLC con China, EE.UU., UE y otros. La tasa real puede ser 0%. Verificar en Aduana Chile.",
  };
}

// ── COLOMBIA ───────────────────────────────────────────────────────────────
function calcColombia(cif: number, tariff_rate: number): TaxResult {
  const Arancel = cif * (tariff_rate / 100);
  const AC = cif * 0.012;  // Arancel Consular
  const baseIVA = cif + Arancel + AC;
  const IVA = baseIVA * 0.19;
  const total = Arancel + AC + IVA;

  return {
    country: "Colombia",
    cif,
    lines: [
      { name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: Arancel },
      { name: "Arancel Consular", base: "CIF", rate: "1.2%", amount: AC },
      { name: "IVA Importación", base: "CIF + Aranceles", rate: "19%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta USD 200 ingresan sin arancel (franquicia courier). Importación formal requiere RUT importador.",
    last_updated: "2025-06-01",
    disclaimer: "Verificar en DIAN Colombia. Algunos productos tienen IVA diferencial (0%, 5% o 19%).",
  };
}

// ── MÉXICO ─────────────────────────────────────────────────────────────────
function calcMexico(cif: number, tariff_rate: number): TaxResult {
  const IGI = cif * (tariff_rate / 100);
  const DTA = Math.max(cif * 0.008, 294);  // DTA 8‰ mínimo ~USD 15
  const baseIVA = cif + IGI + DTA;
  const IVA = baseIVA * 0.16;
  const total = IGI + DTA + IVA;

  return {
    country: "México",
    cif,
    lines: [
      { name: "IGI — Impuesto General de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: IGI },
      { name: "DTA — Derecho de Trámite Aduanero", base: "CIF", rate: "0.8‰ (mín. MXN 294)", amount: DTA },
      { name: "IVA Importación", base: "CIF + IGI + DTA", rate: "16%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "México tiene TLCAN/T-MEC con EE.UU. y Canadá. TLC con UE. Verificar origen para tasa preferencial.",
    last_updated: "2025-06-01",
    disclaimer: "Verificar en SAT México. DTA en MXN — monto USD referencial. IEPS aplica a productos específicos.",
  };
}

// ── PERÚ ────────────────────────────────────────────────────────────────────
function calcPeru(cif: number, tariff_rate: number): TaxResult {
  const AdValorem = cif * (tariff_rate / 100);
  const IPM = cif * 0.02;
  const baseIGV = cif + AdValorem + IPM;
  const IGV = baseIGV * 0.16;
  const total = AdValorem + IPM + IGV;

  return {
    country: "Perú",
    cif,
    lines: [
      { name: "Ad Valorem", base: "CIF", rate: `${tariff_rate}%`, amount: AdValorem },
      { name: "IPM — Impuesto de Promoción Municipal", base: "CIF", rate: "2%", amount: IPM },
      { name: "IGV — Impuesto General a las Ventas", base: "CIF + AV + IPM", rate: "16%", amount: IGV },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta USD 200 libres de impuesto (modalidad courier). Perú tiene TLC con China desde 2010.",
    last_updated: "2025-06-01",
    disclaimer: "Verificar en SUNAT Perú. ISC aplica a productos específicos (alcohol, tabaco, vehículos).",
  };
}

// ── ESPAÑA / UE ─────────────────────────────────────────────────────────────
function calcEspana(cif: number, tariff_rate: number): TaxResult {
  const TARIC = cif * (tariff_rate / 100);
  const baseIVA = cif + TARIC;
  const IVA = baseIVA * 0.21;
  const total = TARIC + IVA;

  return {
    country: "España / UE",
    cif,
    lines: [
      { name: "Arancel TARIC", base: "CIF", rate: `${tariff_rate}%`, amount: TARIC },
      { name: "IVA Importación", base: "CIF + TARIC", rate: "21%", amount: IVA },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta EUR 150 libres de arancel desde 2021 (fin franquicia IVA). Todo paga IVA desde primer euro.",
    last_updated: "2025-06-01",
    disclaimer: "Tipo IVA puede ser 10% o 4% según producto. Verificar en TARIC Consulta (ec.europa.eu/taxation_customs).",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export const SUPPORTED_COUNTRIES = [
  "Argentina", "Brasil", "Uruguay", "Paraguay", "Chile",
  "Colombia", "México", "Perú", "España"
];

export function calculateTaxes(input: TaxInput): TaxResult {
  const { cif, tariff_rate, destination } = input;

  switch (destination) {
    case "Argentina": return calcArgentina(cif, tariff_rate);
    case "Brasil":    return calcBrasil(cif, tariff_rate);
    case "Uruguay":   return calcUruguay(cif, tariff_rate);
    case "Paraguay":  return calcParaguay(cif, tariff_rate);
    case "Chile":     return calcChile(cif, tariff_rate);
    case "Colombia":  return calcColombia(cif, tariff_rate);
    case "México":    return calcMexico(cif, tariff_rate);
    case "Perú":      return calcPeru(cif, tariff_rate);
    case "España":    return calcEspana(cif, tariff_rate);
    default:
      // Cálculo genérico para países sin motor propio
      const arancel = cif * (tariff_rate / 100);
      const iva = (cif + arancel) * 0.18;
      const total = arancel + iva;
      return {
        country: destination,
        cif,
        lines: [
          { name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: arancel },
          { name: "IVA estimado", base: "CIF + Arancel", rate: "18% (referencial)", amount: iva },
        ],
        total_taxes: total,
        landed_cost: cif + total,
        tax_burden_pct: Math.round((total / cif) * 100),
        import_method_note: "Consultar con despachante local para tributos exactos.",
        last_updated: "2025-06-01",
        disclaimer: "Cálculo referencial genérico. Verificar tributos exactos con autoridad aduanera del país de destino.",
      };
  }
}
