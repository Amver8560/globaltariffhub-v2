// ─────────────────────────────────────────────────────────────────────────────
// GTH — Motor de Tributos de Importación
// Última actualización: Junio 2025
// IMPORTANTE: Tasas de referencia. Verificar con fuente oficial antes de operar.
// ─────────────────────────────────────────────────────────────────────────────

export interface TaxInput {
  cif: number;              // Valor CIF en USD
  tariff_rate: number;      // Tasa arancelaria específica del producto (%)
  destination: string;      // País de destino
  iva_rate?: number;        // Tasa IVA en % (Argentina: 21 general, 10.5 reducida). Default: 21
  impuesto_interno_rate?: number; // Impuesto Interno % si aplica (celulares, bebidas, etc.). Default: 0
}

export interface TaxLineItem {
  code: string;        // Sigla corta: DI, TE, IVA, etc.
  name: string;        // Nombre completo
  base: string;        // Base de cálculo
  rate: string;        // Tasa aplicada
  amount: number;      // Monto en USD
  legal_basis: string; // Norma legal
  description: string; // Qué es y cuándo aplica
  exceptions?: string; // Excepciones o casos especiales
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
function calcArgentina(
  cif: number,
  tariff_rate: number,
  iva_rate: number = 21,
  impuesto_interno_rate: number = 0
): TaxResult {
  const DI = cif * (tariff_rate / 100);
  const TE = Math.min(cif * 0.03, 500);
  const II = impuesto_interno_rate > 0 ? cif * (impuesto_interno_rate / 100) : 0;
  const baseIVA = cif + DI + TE + II;
  const IVA = baseIVA * (iva_rate / 100);
  const IVA_AD = baseIVA * 0.10;   // 10% responsables inscriptos (20% no inscriptos)
  const GANANCIAS = baseIVA * 0.06;
  const IIBB = baseIVA * 0.025;    // 2,5% Ingresos Brutos (promedio ARCA — varía por provincia)
  const total = DI + TE + II + IVA + IVA_AD + GANANCIAS + IIBB;

  const lines: TaxLineItem[] = [
    {
      code: "DI",
      name: "Derecho de Importación",
      base: "CIF",
      rate: `${tariff_rate}%`,
      amount: DI,
      legal_basis: "Ley 22.415 — Código Aduanero. NCM / Posición SIM",
      description: "Arancel principal que grava la importación de mercaderías. La tasa varía según la posición arancelaria del producto (NCM/SIM). Para países del MERCOSUR aplica el Arancel Externo Común (AEC).",
      exceptions: "Bienes de capital (BK) y bienes de informática y telecomunicaciones (BIT) pueden tener DI 0% o diferencial. MERCOSUR: DII 0% entre socios.",
    },
    {
      code: "TE",
      name: "Tasa Estadística",
      base: "CIF",
      rate: "3% (tope USD 500 por despacho)",
      amount: TE,
      legal_basis: "Dec. 108/99 y modificatorias. Res. MEyP 5/2024",
      description: "Tributo que financia el servicio estadístico aduanero. Se aplica sobre el valor CIF con un tope máximo de USD 500 por despacho de importación.",
      exceptions: "Exentos: importaciones desde países del MERCOSUR (intrazona), bienes del Estado, organismos internacionales, correo diplomático. IMPORTANTE: los bienes BIT y BK NO están exentos de TE — la exención BIT/BK aplica únicamente sobre el DI. Celulares, tablets y laptops pagan TE aunque tengan DI 0%.",
    },
  ];

  if (impuesto_interno_rate > 0) {
    lines.push({
      code: "II",
      name: "Impuesto Interno",
      base: "CIF",
      rate: `${impuesto_interno_rate}%`,
      amount: II,
      legal_basis: "Ley 24.674 — Impuestos Internos. ARCA (ex AFIP)",
      description: "Impuesto selectivo que grava ciertos bienes en la etapa de importación o fabricación. Para celulares y smartphones aplica sobre el valor CIF. Tasa varía según tipo de producto.",
      exceptions: "Aplica a celulares/smartphones, bebidas alcohólicas, tabacos, seguros, vehículos de alta gama. Verificar capítulo específico en Ley 24.674 según posición NCM del producto.",
    });
  }

  lines.push(
    {
      code: "IVA",
      name: "IVA Importación",
      base: "CIF + DI + TE" + (impuesto_interno_rate > 0 ? " + II" : ""),
      rate: `${iva_rate}%`,
      amount: IVA,
      legal_basis: "Ley 23.349 — Art. 1° inc. b) y Art. 28",
      description: "Impuesto al Valor Agregado sobre importaciones definitivas. Se aplica sobre la base imponible CIF + DI + TE (+ II si hubiera impuesto interno). Es recuperable como crédito fiscal para responsables inscriptos en IVA.",
      exceptions: "Alícuota reducida 10,5%: alimentos de la canasta básica, bienes de capital nuevos (Art. 28 inc. e), publicaciones periódicas, medicamentos. Exentos: libros, determinados alimentos. Celulares y electrónica en general: 21%.",
    },
    {
      code: "IVA Ad.",
      name: "IVA Adicional (Percepción)",
      base: "CIF + DI + TE" + (impuesto_interno_rate > 0 ? " + II" : ""),
      rate: "10% inscriptos / 20% no inscriptos",
      amount: IVA_AD,
      legal_basis: "R.G. ARCA (ex AFIP) 2937/2010 y R.G. 4461/2019",
      description: "Percepción de IVA a cuenta del impuesto que corresponda tributar. Para responsables inscriptos en IVA la alícuota es 10%. Para no inscriptos: 20%.",
      exceptions: "Responsables inscriptos en IVA: 10%. No inscriptos y monotributistas: 20%. Exentos de IVA: también exentos de esta percepción.",
    },
    {
      code: "IG",
      name: "Percepción Ganancias",
      base: "CIF + DI + TE" + (impuesto_interno_rate > 0 ? " + II" : ""),
      rate: "6% (3% para algunos casos)",
      amount: GANANCIAS,
      legal_basis: "R.G. ARCA (ex AFIP) 2281/2007 y modificatorias",
      description: "Anticipo del Impuesto a las Ganancias a cuenta del impuesto anual. Se aplica sobre la base imponible aduanera. Es acreditable contra el Impuesto a las Ganancias anual.",
      exceptions: "Exentos: entidades sin fines de lucro, importaciones del Estado. Alícuota 3%: determinadas operaciones especiales. No aplicable a sujetos exentos en Ganancias.",
    },
    {
      code: "IIBB",
      name: "Ingresos Brutos (Percepción)",
      base: "CIF + DI + TE" + (impuesto_interno_rate > 0 ? " + II" : ""),
      rate: "2,5% (varía por provincia y actividad)",
      amount: IIBB,
      legal_basis: "Convenio Multilateral (CM) — Resolución General ARCA. Código Fiscal provincial",
      description: "Percepción a cuenta del Impuesto sobre los Ingresos Brutos. La tasa varía según la provincia de destino y la actividad del importador. Se acredita contra el IIBB provincial que corresponda.",
      exceptions: "Tasa referencial 2,5%. Buenos Aires puede ser 3%, CABA varía según actividad. Exentos: importadores con certificado de exención IIBB. Verificar con ARCA y aduana de ingreso.",
    }
  );

  return {
    country: "Argentina",
    cif,
    lines,
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: cif < 200
      ? "Monto CIF bajo. Evaluar régimen de envíos de particular a particular (courier) — franquicia USD 200 libre de derechos para uso personal."
      : "Despacho formal obligatorio para importaciones comerciales. Requiere despachante de aduana matriculado. Presentar SEDI (declaración estadística online) antes del despacho.",
    last_updated: "2026-06-01",
    disclaimer: "Tasas vigentes a junio 2026. IIBB varía por provincia. Impuesto Interno varía por producto. Verificar con ARCA (arca.gob.ar) y despachante habilitado.",
  };
}

// ── BRASIL ─────────────────────────────────────────────────────────────────
function calcBrasil(cif: number, tariff_rate: number): TaxResult {
  const II = cif * (tariff_rate / 100);
  const IPI_rate = 0.05;
  const IPI = (cif + II) * IPI_rate;
  const PIS = (cif + II + IPI) * 0.021;
  const COFINS = (cif + II + IPI) * 0.0965;
  const basePreICMS = cif + II + IPI + PIS + COFINS;
  const ICMS = basePreICMS / (1 - 0.18) * 0.18;
  const total = II + IPI + PIS + COFINS + ICMS;

  return {
    country: "Brasil",
    cif,
    lines: [
      {
        code: "II",
        name: "Imposto de Importação",
        base: "CIF (valor aduaneiro)",
        rate: `${tariff_rate}%`,
        amount: II,
        legal_basis: "Decreto-Lei 37/1966 — TEC (Tarifa Externa Comum MERCOSUR)",
        description: "Principal tributo sobre importações. Tasa definida pela posição NCM na TEC. Receita federal da União.",
        exceptions: "Isenções: drawback, ZFM (Zona Franca de Manaus), regimes aduaneiros especiais. MERCOSUR: TEC 0% entre sócios para maioria dos produtos.",
      },
      {
        code: "IPI",
        name: "Imposto sobre Produtos Industrializados",
        base: "CIF + II",
        rate: "5% (referencial — varia por NCM)",
        amount: IPI,
        legal_basis: "Lei 5.172/1966 — TIPI (Tabela de Incidência do IPI)",
        description: "Imposto federal sobre produtos industrializados. A alíquota varia conforme a natureza do produto na TIPI. Muitos produtos têm alíquota 0%.",
        exceptions: "Alíquota 0%: bens de capital, alimentos básicos, medicamentos. Isentos: produtos exportados. Verificar TIPI para posição específica.",
      },
      {
        code: "PIS",
        name: "PIS — Programa de Integração Social",
        base: "CIF + II + IPI",
        rate: "2,1%",
        amount: PIS,
        legal_basis: "Lei 10.865/2004 — Art. 8°",
        description: "Contribuição social federal sobre importações de bens e serviços. Juntamente com COFINS financia a seguridade social.",
        exceptions: "Alíquota reduzida ou zero: medicamentos, alimentos, máquinas e equipamentos. Verificar Anexo I da Lei 10.865/2004.",
      },
      {
        code: "COFINS",
        name: "COFINS — Contribuição para Financiamento da Seguridade Social",
        base: "CIF + II + IPI",
        rate: "9,65%",
        amount: COFINS,
        legal_basis: "Lei 10.865/2004 — Art. 8°",
        description: "Contribuição federal que, junto com PIS, financia a seguridade social. Incide sobre importações de bens e serviços estrangeiros.",
        exceptions: "Mesmas exceções do PIS. Alíquota zero para produtos essenciais conforme lista do Ministério da Fazenda.",
      },
      {
        code: "ICMS",
        name: "ICMS — Imposto sobre Circulação de Mercadorias e Serviços",
        base: "CIF + II + IPI + PIS + COFINS (cálculo por dentro)",
        rate: "18% (São Paulo — referencial)",
        amount: ICMS,
        legal_basis: "Lei Complementar 87/1996 (Lei Kandir) — legislação estadual",
        description: "Imposto estadual. A alíquota varia por estado (12% a 20%). Cálculo especial 'por dentro': o ICMS integra a própria base de cálculo.",
        exceptions: "Varia por estado: SP 18%, MG 18%, RJ 20%, RS 17%. Isenções por convênios CONFAZ. ZFM tem benefícios especiais.",
      },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Importação formal requer habilitação RADAR na Receita Federal. Obrigatório despachante aduaneiro para importações comerciais.",
    last_updated: "2026-06-01",
    disclaimer: "ICMS varia por estado. IPI varia por NCM/TIPI. Taxas referenciais — verificar em Receita Federal (rf.gov.br).",
  };
}

// ── URUGUAY ────────────────────────────────────────────────────────────────
function calcUruguay(cif: number, tariff_rate: number): TaxResult {
  const DGA = cif * (tariff_rate / 100);
  const IMESI = 0;
  const baseIVA = cif + DGA + IMESI;
  const IVA = baseIVA * 0.22;
  const total = DGA + IMESI + IVA;

  return {
    country: "Uruguay",
    cif,
    lines: [
      {
        code: "DGA",
        name: "Derecho de Aduana",
        base: "CIF",
        rate: `${tariff_rate}% (AEC MERCOSUR)`,
        amount: DGA,
        legal_basis: "Código Aduanero Uruguayo — Ley 19.276. TEC MERCOSUR",
        description: "Arancel de importación según posición NCM. Uruguay aplica el Arancel Externo Común del MERCOSUR. Administrado por la Dirección Nacional de Aduanas (DNA).",
        exceptions: "Entre socios MERCOSUR: 0% (libre circulación). Zonas Francas: exentas de derechos. Régimen de admisión temporaria disponible.",
      },
      {
        code: "IMESI",
        name: "Impuesto Específico Interno (IMESI)",
        base: "Precio de venta o valor CIF",
        rate: "0% (varía por producto)",
        amount: IMESI,
        legal_basis: "Título 11 del Texto Ordenado 1996 — DGI",
        description: "Impuesto selectivo que grava productos específicos. Para la mayoría de productos importados es 0%. Solo aplica a rubros especiales.",
        exceptions: "Aplica a: tabaco (77%), bebidas alcohólicas (varies), combustibles, vehículos automotores, cosméticos. Tasa varía por producto.",
      },
      {
        code: "IVA",
        name: "IVA Importación",
        base: "CIF + DGA + IMESI",
        rate: "22% (tasa básica) / 10% (tasa mínima)",
        amount: IVA,
        legal_basis: "Título 10 del Texto Ordenado 1996 — DGI",
        description: "Impuesto al Valor Agregado sobre importaciones. Tasa básica 22%. Es crédito fiscal para empresas contribuyentes de IVA.",
        exceptions: "Tasa mínima 10%: determinados alimentos, medicamentos, servicios turísticos. Exentos: algunos alimentos de la canasta básica.",
      },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Régimen simplificado para envíos hasta USD 200 (courier). Zonas Francas ofrecen exención total de tributos aduaneros.",
    last_updated: "2026-06-01",
    disclaimer: "Verificar tasas en DNA Uruguay (aduanas.gub.uy) y DGI (dgi.gub.uy). IMESI depende del producto específico.",
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
      { code: "AI", name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: Arancel, legal_basis: "Ley Aduanera de Paraguay — DNA (Dirección Nacional de Aduanas)", description: "Arancel que grava la importación de mercaderías. Paraguay aplica el AEC del MERCOSUR. Ciudad del Este tiene regímenes especiales.", exceptions: "MERCOSUR: libre circulación entre socios. Zona Franca Ciudad del Este: beneficios especiales." },
      { code: "IVA", name: "IVA Importación", base: "CIF + Arancel", rate: "10%", amount: IVA, legal_basis: "Ley 125/1991 — Código Tributario Paraguay", description: "IVA general del 10% sobre importaciones. Uno de los más bajos de la región. Acreditable para empresas contribuyentes.", exceptions: "Exentos: bienes del Estado, organismos internacionales, algunos alimentos básicos." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Paraguay tiene baja carga tributaria. Ciudad del Este es zona especial con regímenes diferenciados.",
    last_updated: "2026-06-01",
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
      { code: "AI", name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}% (general 6%)`, amount: Arancel, legal_basis: "D.L. 910/1975 y Ley 18.525 — Arancel Aduanero Chileno. Administrado por SNA.", description: "Arancel general uniforme del 6% para la mayoría de productos. Chile cuenta con TLCs con más de 60 países, por lo que el arancel efectivo puede ser 0%.", exceptions: "Arancel 0%: productos originarios de China (TLC 2006), EE.UU. (TLC 2004), UE (AA 2003), MERCOSUR, CAN, entre otros. Verificar origen." },
      { code: "IVA", name: "IVA Importación", base: "CIF + Arancel", rate: "19%", amount: IVA, legal_basis: "D.L. 825/1974 — Ley del IVA Chile. Art. 8° inc. b)", description: "IVA del 19% sobre el valor CIF más el arancel. Es crédito fiscal para empresas contribuyentes de IVA en Chile.", exceptions: "Exentos: bienes de capital bajo régimen especial, donaciones, algunos bienes culturales. Verificar en SII Chile." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Chile tiene TLCs con muchos países — arancel puede ser 0% según origen. Verificar acuerdo vigente.",
    last_updated: "2026-06-01",
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
      { code: "AI", name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: Arancel, legal_basis: "Decreto 2685/1999 — Estatuto Aduanero. DIAN (Dirección de Impuestos y Aduanas Nacionales)", description: "Arancel sobre valor CIF. Tasa varía por subpartida arancelaria. Colombia aplica el Arancel Externo Común de la CAN para algunos productos.", exceptions: "Exenciones: bienes de capital sin producción nacional (con resolución del Ministerio de Comercio), donaciones, importaciones temporales." },
      { code: "AC", name: "Arancel Consular", base: "CIF", rate: "1.2%", amount: AC, legal_basis: "Decreto 2685/1999 y reglamentaciones consulares", description: "Tributo cobrado por servicios consulares colombianos. Se aplica sobre el valor CIF de la mercancía importada.", exceptions: "Exentos: importaciones de organismos internacionales, diplomáticos, donaciones humanitarias." },
      { code: "IVA", name: "IVA Importación", base: "CIF + Aranceles", rate: "19%", amount: IVA, legal_basis: "Estatuto Tributario Art. 420 y ss. — DIAN", description: "IVA del 19% sobre la base imponible. Es recuperable como impuesto descontable para responsables de IVA.", exceptions: "Tarifa diferencial: 5% para algunos bienes básicos. Excluidos: alimentos básicos de la canasta familiar. Verificar en DIAN." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta USD 200 ingresan sin arancel (franquicia courier). Importación formal requiere RUT importador.",
    last_updated: "2026-06-01",
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
      { code: "IGI", name: "IGI — Impuesto General de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: IGI, legal_basis: "Ley de los Impuestos Generales de Importación y Exportación (LIGIE). SAT / Aduana México", description: "Arancel principal sobre importaciones. Tasa definida por fracción arancelaria LIGIE. México tiene TLCs con EE.UU./Canadá (T-MEC), UE, Japón y más de 50 países.", exceptions: "T-MEC (antes TLCAN): 0% para la mayoría de bienes de origen EE.UU./Canadá. PROSEC: tasas preferenciales para industrias específicas. Maquiladoras: régimen especial." },
      { code: "DTA", name: "DTA — Derecho de Trámite Aduanero", base: "CIF", rate: "0.8‰ (mín. MXN 294)", amount: DTA, legal_basis: "Ley Federal de Derechos — Art. 49. SAT México", description: "Derecho que se paga por el trámite de cada pedimento de importación. El mínimo en pesos equivale aproximadamente a USD 15-18 según tipo de cambio.", exceptions: "Exentos: importaciones temporales para maquila, mercancías en tránsito internacional, importaciones del gobierno federal." },
      { code: "IVA", name: "IVA Importación", base: "CIF + IGI + DTA", rate: "16%", amount: IVA, legal_basis: "Ley del IVA — Art. 1° y Art. 27. SAT México", description: "IVA del 16% sobre valor CIF más todos los demás impuestos. Acreditable para contribuyentes del régimen general.", exceptions: "Tasa 0%: alimentos en estado natural, medicinas de patente, servicios médicos. Frontera norte: 8% (zona económica especial). Verificar en SAT." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "México tiene TLCAN/T-MEC con EE.UU. y Canadá. TLC con UE. Verificar origen para tasa preferencial.",
    last_updated: "2026-06-01",
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
      { code: "AV", name: "Ad Valorem", base: "CIF", rate: `${tariff_rate}%`, amount: AdValorem, legal_basis: "Decreto Legislativo 1053 — Ley General de Aduanas. SUNAT Perú", description: "Arancel ad valorem sobre el valor CIF. Perú tiene tasas de 0%, 6% y 11%. Cuenta con TLC con China (2010), EE.UU. (2009), UE (2013) y otros.", exceptions: "TLC China: 0% para muchos productos desde 2019. TLC EE.UU.: mayoría de bienes 0%. Drawback: devolución del 3% del FOB exportado. Verificar en SUNAT." },
      { code: "IPM", name: "IPM — Impuesto de Promoción Municipal", base: "CIF", rate: "2%", amount: IPM, legal_basis: "Decreto Legislativo 776 — Ley de Tributación Municipal. SUNAT", description: "Impuesto del 2% destinado al Fondo de Compensación Municipal (FONCOMUN). Se aplica sobre el valor CIF en aduanas.", exceptions: "Exentos: importaciones del sector público, organismos internacionales, importaciones temporales." },
      { code: "IGV", name: "IGV — Impuesto General a las Ventas", base: "CIF + AV + IPM", rate: "16%", amount: IGV, legal_basis: "Decreto Legislativo 821 — Ley del IGV e ISC. SUNAT Perú", description: "Equivalente al IVA. Tasa 16% más 2% IPM = 18% total efectivo. Crédito fiscal disponible para empresas con RUC.", exceptions: "Exonerados: productos agropecuarios (Apéndice I), servicios médicos, educación, algunos insumos agrícolas. ISC aplica adicionalmente a bienes selectivos." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta USD 200 libres de impuesto (modalidad courier). Perú tiene TLC con China desde 2010.",
    last_updated: "2026-06-01",
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
      { code: "TARIC", name: "Arancel TARIC", base: "CIF", rate: `${tariff_rate}%`, amount: TARIC, legal_basis: "Reglamento (UE) 2658/87 — Nomenclatura Combinada. Arancel Integrado Comunitario (TARIC). DG TAXUD", description: "Arancel exterior común de la UE según código TARIC de 10 dígitos. Todos los estados miembros aplican la misma tasa exterior. Despacho único en cualquier aduana UE (principio de libre circulación).", exceptions: "SGP (Sistema de Preferencias Generalizadas): países en desarrollo con tasas reducidas. Acuerdos UE-Mercosur, UE-Chile, UE-México, entre otros. Todo/MPG: exenciones para determinados equipos e insumos." },
      { code: "IVA", name: "IVA Importación", base: "CIF + TARIC", rate: "21%", amount: IVA, legal_basis: "Directiva IVA 2006/112/CE. Ley 37/1992 del IVA (España). AEAT", description: "IVA sobre importaciones. En España: 21% tipo general. Crédito fiscal completo para empresas sujetas a IVA. Declaración mensual o trimestral según régimen.", exceptions: "Tipo reducido 10%: alimentos, hostelería, transporte, vivienda. Tipo superreducido 4%: pan, leche, queso, libros, medicamentos, prótesis. Verificar en AEAT (agenciatributaria.gob.es)." },
    ],
    total_taxes: total,
    landed_cost: cif + total,
    tax_burden_pct: Math.round((total / cif) * 100),
    import_method_note: "Envíos hasta EUR 150 libres de arancel desde 2021 (fin franquicia IVA). Todo paga IVA desde primer euro.",
    last_updated: "2026-06-01",
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
  const { cif, tariff_rate, destination, iva_rate, impuesto_interno_rate } = input;

  switch (destination) {
    case "Argentina": return calcArgentina(cif, tariff_rate, iva_rate ?? 21, impuesto_interno_rate ?? 0);
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
          { code: "AI", name: "Arancel de Importación", base: "CIF", rate: `${tariff_rate}%`, amount: arancel, legal_basis: "Verificar en autoridad aduanera local", description: "Arancel estimado según posición arancelaria. Verificar tasa exacta con la aduana del país de destino.", exceptions: "Pueden aplicar acuerdos comerciales con tasas preferenciales según el país de origen del producto." },
          { code: "IVA", name: "IVA estimado", base: "CIF + Arancel", rate: "18% (referencial)", amount: iva, legal_basis: "Verificar en autoridad aduanera local", description: "IVA estimado a tasa referencial del 18%. La tasa real varía según el país de destino y el tipo de producto.", exceptions: "La tasa de IVA varía por país y tipo de producto. Verificar con la autoridad tributaria del país de destino." },
        ],
        total_taxes: total,
        landed_cost: cif + total,
        tax_burden_pct: Math.round((total / cif) * 100),
        import_method_note: "Consultar con despachante local para tributos exactos.",
        last_updated: "2026-06-01",
        disclaimer: "Cálculo referencial genérico. Verificar tributos exactos con autoridad aduanera del país de destino.",
      };
  }
}
