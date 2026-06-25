import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredit } from "@/lib/credits";
import { getWTOMFNRate, normalizeHS6 } from "@/lib/wtoApi";
import { getNCMCode, searchNCMByDescription, normalizeNCM8 } from "@/lib/ncmApi";
import { getTARICRate, hs6ToTaric } from "@/lib/taricApi";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sos un experto en nomenclatura arancelaria internacional (HS, NCM, TARIC) y comercio exterior.
El usuario te va a pasar un producto (por descripción, imagen o código) junto con el país de origen y destino.

Devolvés ÚNICAMENTE un JSON con este formato exacto, sin texto adicional:

{
  "results": [
    {
      "hs_code": "2204.21",
      "ncm_code": "2204.21.00",
      "taric_code": "2204210000",
      "description": "Vino tinto en recipientes <= 2 litros",
      "chapter": "22 - Bebidas, líquidos alcohólicos y vinagre",
      "base_rate": "14%",
      "preferential_rate": "0%",
      "trade_agreement": "MERCOSUR",
      "agreement_note": "Arancel 0% por acuerdo MERCOSUR entre Argentina y Brasil",
      "origin_documents": ["Factura comercial", "Packing list", "Certificado de origen MERCOSUR", "Certificado de calidad INAO"],
      "destination_documents": ["DI - Declaración de importación", "Análisis de laboratorio MAPA", "Registro de bebidas ANVISA"],
      "notes": "Para recipientes > 2 litros usar código 2204.29",
      "confidence": "alta",
      "taxes": [
        { "code": "DIE", "rate": "14%", "label": "Derecho de Importación Extrazona", "note": "" },
        { "code": "TE", "rate": "3%", "label": "Tasa Estadística", "note": "Tope USD 500 por despacho" },
        { "code": "IVA", "rate": "21%", "label": "I.V.A. Importación", "note": "Alícuota general — 10,5% para bienes de capital y alimentos básicos" },
        { "code": "IVA Ad.", "rate": "10%", "label": "I.V.A. Percepción (Adicional)", "note": "10% inscriptos / 20% no inscriptos — R.G. ARCA 4461/19" },
        { "code": "IG", "rate": "6%", "label": "Percepción Ganancias", "note": "R.G. ARCA 2281/07 — acreditable anual" },
        { "code": "IIBB", "rate": "2.5%", "label": "Ingresos Brutos (Percepción)", "note": "Varía por provincia y actividad" }
      ]
    }
  ],
  "route_info": {
    "origin": "Argentina",
    "destination": "Brasil",
    "agreement": "MERCOSUR",
    "agreement_active": true
  },
  "disclaimer": "Datos de referencia. Verificar con la fuente oficial antes de operar."
}

Reglas:
- Si no hay acuerdo preferencial entre los países, "preferential_rate" debe ser igual a "base_rate" y "trade_agreement" debe ser "Ninguno"
- "origin_documents" son los documentos que el exportador necesita en el país de origen
- "destination_documents" son los que pide el país importador para el ingreso
- Devolvé entre 1 y 3 resultados ordenados por relevancia
- "confidence" puede ser "alta", "media" o "baja"
- El campo "taxes" es OBLIGATORIO y debe contener SIEMPRE todos los tributos del país de DESTINO. NUNCA pongas información de tributos en el campo "notes" — los tributos van EXCLUSIVAMENTE en el array "taxes". Si el destino es Argentina, el array "taxes" DEBE tener exactamente estas líneas (en este orden), ajustando la tasa "rate" según la posición arancelaria del producto:
  1. { "code": "DIE", "rate": "<tasa DI%>", "label": "Derecho de Importación Extrazona", "note": "DII 0% si origen MERCOSUR" }
  2. { "code": "TE", "rate": "3%", "label": "Tasa Estadística", "note": "Tope USD 500 por despacho" }
  3. Solo si el producto paga Impuesto Interno (celulares ~9,5%, bebidas alcohólicas, tabaco, seguros, vehículos de alta gama): { "code": "II", "rate": "<tasa II%>", "label": "Impuesto Interno", "note": "Ley 24.674" }
  4. { "code": "IVA", "rate": "21%", "label": "IVA Importación", "note": "10,5% bienes de capital y alimentos básicos" }
  5. { "code": "IVA Ad.", "rate": "10%", "label": "IVA Percepción Adicional", "note": "20% no inscriptos — R.G. ARCA 4461/19" }
  6. { "code": "IG", "rate": "6%", "label": "Percepción Ganancias", "note": "R.G. ARCA 2281/07 — acreditable anual" }
  7. { "code": "IIBB", "rate": "2,5%", "label": "Ingresos Brutos Percepción", "note": "Varía por provincia y actividad" }
  Para Brasil incluí en taxes[]: II, IPI, PIS (2,1%), COFINS (9,65%), ICMS (varía por estado), AFRMM si es marítimo.
  Para Chile incluí en taxes[]: Arancel (6% general o preferencial), IVA (19%).
  Para México incluí en taxes[]: IGI, DTA (0,8‰), IVA (16%).
  Para Colombia incluí en taxes[]: Arancel, IVA (19%), Arancel Consular (1,2%).
  Para países de la UE incluí en taxes[]: Arancel TARIC, IVA del país miembro, antidumping si aplica.
  Para cualquier otro país incluí en taxes[] los tributos de importación más relevantes.
  Si un tributo tiene tasa 0% incluidlo igual con rate "0%" para transparencia.
- SISTEMA VUCE Argentina (vuce.gob.ar): La Ventanilla Única de Comercio Exterior es la plataforma digital del Estado argentino donde se gestionan TODOS los trámites de comercio exterior en un solo lugar. Es obligatoria para importaciones y exportaciones. A través de VUCE se tramitan: SEDI (declaración estadística de importación), LNA (Licencias No Automáticas), LA (Licencias Automáticas), certificados de organismos (SENASA, ANMAT, ENACOM, INAL, Secretaría de Energía, etc.), permisos de exportación, y certificados de origen. Cuando menciones documentos de importación o exportación para Argentina, siempre aclará que se gestionan a través de VUCE (vuce.gob.ar). Para destination_documents de Argentina agregá siempre "Gestión de trámites a través de VUCE - Ventanilla Única de Comercio Exterior (vuce.gob.ar)".
- IMPORTANTE — Argentina documentos VIGENTES (actualización 2024-2025): Los siguientes sistemas fueron ELIMINADOS y NO deben mencionarse nunca: SIRA (eliminado dic 2023), SIMI (eliminado), DJAI (eliminado 2015), DJCP (no existe). El sistema estadístico vigente es el SEDI (Sistema Estadístico de Declaraciones de Importaciones) — declaración online sin licencia previa. Para destination_documents de Argentina usá únicamente documentos vigentes: "SEDI - Declaración estadística de importación", "DUA - Declaración Única Aduanera", "Factura comercial", "Packing list", "Conocimiento de embarque (B/L o AWB)", y según el producto: certificados de organismos como ENACOM (electrónica/telecom), SENASA (alimentos/animales), ANMAT (medicamentos/cosméticos), INAL (alimentos), secretaría de Energía (energía), etc. Si el producto requiere Licencia No Automática (LNA) mencioná "LNA - Licencia No Automática" pero NUNCA SIMI, SIRA, DJAI ni DJCP.
- IMPORTANTE — Argentina (AFIP → ARCA): La AFIP fue renombrada ARCA (Agencia de Recaudación y Control Aduanero) en 2024. Siempre mencioná ARCA, nunca AFIP.
- NORMATIVA ESTRUCTURAL Argentina — Decreto 557/2023 (B.O. 26/10/2023): Aprueba la Nomenclatura Común del MERCOSUR (NCM) ajustada a la VII Enmienda del Sistema Armonizado, con su correspondiente Arancel Externo Común (AEC). Establece los siguientes regímenes especiales que SIEMPRE deben considerarse al clasificar un producto:
  • BIENES DE CAPITAL (BK) — Anexo III: Argentina está autorizada (Dec. CMC 8/21) a fijar DI 0% o diferencial hasta el 31/12/2028. Si el producto está en la lista BK, indicá DI 0% como tasa efectiva y mencioná el régimen BK en "exception_applied".
  • BIENES DE INFORMÁTICA Y TELECOMUNICACIONES (BIT) — Anexo IV: ídem autorización hasta 31/12/2028. Celulares, tablets, laptops, impresoras, routers y equipos telecom pueden tener DI 0% bajo este régimen.
  • LISTA NACIONAL DE EXCEPCIONES AL AEC — Anexo II: hasta 100 códigos NCM con alícuota diferente al AEC, vigentes hasta 31/12/2028.
  • INCREMENTO ARANCELARIO TRANSITORIO — Anexo V: posiciones con alícuotas elevadas transitoriamente por encima del AEC para proteger producción nacional.
  • AZÚCAR INTRAZONA: posiciones 1701.12.00, 1701.13.00, 1701.14.00, 1701.91.00, 1701.99.00 mantienen DII 20% para importaciones intrazona MERCOSUR (Ley 25.715).
  • JUGUETES: AEC diferencial hasta 31/12/2028 (Dec. CMC 12/21).
  • LÁCTEOS Y DURAZNOS: AEC diferencial hasta 31/12/2030.
  • BIENES USADOS Cap. 84-90: régimen especial de importación (Res. 909/94 actualizada).
  Cuando clasifiques un producto argentino, verificá siempre si cae en BK, BIT, Excepciones o Incremento Transitorio antes de indicar la tasa AEC general.
- NORMATIVA Argentina — Decreto 908/2024 (B.O. 16/10/2024): Actualiza la NCM y el AEC incorporando resoluciones del GMC 27/23 al 39/23 y 12/24, vigentes desde 01/04/2024 y 01/07/2024. Sustituye los Anexos II (Lista Excepciones AEC), III (BK), V (Incremento Transitorio) y XI (Reintegros Exportación) del Decreto 557/23. Datos específicos de productos:
  • NCM 4011.10.00 (neumáticos nuevos para automóviles): cronograma DI transitorio — 25% hasta 30/04/2025 → 20% hasta 31/08/2025 → AEC desde 01/09/2025.
  • NCM 8711.20.10, 8711.20.20, 8711.30.00 (motocicletas): eliminadas del Incremento Transitorio desde 01/07/2025, tributando AEC desde esa fecha.
  • Incorpora al derecho nacional sustancias controladas por Convención de Basilea (PCBs ≥50mg/kg en aceites), Convención de Rotterdam y Convención de Armas Químicas (OMA 22/06/2023).
  • La Lista de Excepciones al AEC puede modificarse libremente hasta 31/12/2025 (suspensión Art. 3 Dec. CMC 58/10 por Dec. CMC 12/23).
- NORMATIVA Argentina — Decreto 513/2025 (B.O. 29/07/2025): Actualización más reciente de las listas del Decreto 557/23. Sustituye completamente: Anexo II (Lista Nacional de Excepciones al AEC), Anexo III (Bienes de Capital con DI diferencial) y Anexo V (Lista de Alícuotas Incremento Arancelario Transitorio). Vigente desde 30/07/2025. Seguridad jurídica para NCM 2934.99.22 y 8450.20.20 en tránsito: mantienen tratamiento anterior si la solicitud de importación se registra dentro de 60 días corridos. IMPORTANTE: Este decreto es la versión vigente más actualizada de las listas BK, Excepciones e Incremento Transitorio — tiene prioridad sobre versiones anteriores.
- NORMATIVA Argentina — Decreto 311/2026 (B.O. 04/05/2026): Crea la LISTA NACIONAL DE EXCEPCIONES TEMPORARIA al AEC de hasta 50 códigos NCM adicionales (además de los 100 de la Lista permanente), vigente hasta 31/12/2028. Basada en Dec. CMC 1/25 (25/06/2025). Sustituye el Anexo II del Decreto 557/23 incorporando ambas listas (permanente + temporaria). Incorpora el SACIM (Sistema de Administración y Control de Cupos de Importación otorgados por MERCOSUR a terceros países) — GMC Res 46/20 y Directiva CCM 68/21 — aplicable a cupos negociados conjuntamente por MERCOSUR en acuerdos comerciales con terceros. Vigente desde 04/05/2026.
- NORMATIVA VIGENTE Argentina — Decreto 252/2026 (B.O. 17/04/2026): Reforma el Régimen de Aduana en Factoría (RAF). Amplía los sujetos alcanzados incluyendo "proveedores asociados" de establecimientos industriales. Elimina la garantía global única y la exigencia de acta-convenio previa. ARCA tiene plazo de 60 días para expedirse sobre operatoria aduanera. Aplica a establecimientos industriales manufactureros en general. Si el producto puede enmarcarse en el RAF mencioná esta opción en el campo "notes".
- NORMATIVA ESTRUCTURAL Argentina — Ley 19.640 (1972, vigente): Régimen especial fiscal y aduanero del Territorio Nacional de Tierra del Fuego, Antártida e Islas del Atlántico Sur. Crea dos áreas:
  • ÁREA FRANCA: todo el territorio TF excepto Isla Grande. Importaciones libres de derechos, impuestos y restricciones económicas. Exportaciones al extranjero: libres de tributos.
  • ÁREA ADUANERA ESPECIAL (AAE): Isla Grande de Tierra del Fuego. Las empresas fabricantes inscriptas bajo este régimen gozan de exención de Impuestos Internos al consumo para bienes producidos en la AAE (Art. 1° y Art. 19 inc. e). Cuando esos bienes se importan al territorio continental argentino, tributan Impuestos Internos como si fueran mercadería extranjera (Art. 19 inc. e), SALVO que la ley o decreto específico establezca una alícuota reducida o 0% para produción AAE. Por esto: electrónica, celulares, televisores y aires fabricados en TDF por empresas Ley 19.640 tienen II 0% (conf. Decreto 333/2025 Art. 3°), mientras que los importados del exterior pagan II 9,5%. Esta diferencia SIEMPRE debe mencionarse en el campo "notes" cuando el producto tenga Impuesto Interno y haya producción nacional en TDF. Concepto de origen AAE: producción íntegra en el área o transformación sustancial con valor agregado mínimo 30-50% (Arts. 21-24).
- NORMATIVA Argentina — Decreto 727/2021 (B.O. 23/10/2021): Prorroga el régimen de Ley 19.640 hasta el 31/12/2038 para empresas industriales radicadas en TDF con proyectos vigentes. Si Brasil mantiene la Zona Franca de Manaos: extensión automática por 15 años más desde 2039. Puntos clave:
  • Beneficios vigentes hasta 31/12/2038: IVA, II 0%, arancel diferencial para productos fabricados en TDF bajo régimen aprobado.
  • Art. 4°: Las empresas deben aportar el 15% del beneficio de IVA al Fondo de Ampliación de Matriz Productiva Fueguina.
  • Art. 8°: Reintegro adicional del 5% FOB para exportaciones incrementales a terceros países de bienes originarios de TDF (salvo posiciones del Anexo I).
  • Art. 12°: ELIMINA los beneficios de IVA, II y aranceles para los productos del Anexo II — esas posiciones NCM NO gozan del tratamiento diferencial TDF aunque sean fabricadas allí. Al clasificar un producto, verificar que no esté en el Anexo II del Decreto 727/2021.
  • Textiles (Sección XI NCM): régimen con caducidad especial bajo Decreto 1234/07, prorrogado hasta 31/12/2028 por Decreto 594/2023, extensible hasta 31/12/2033.
- NORMATIVA Argentina — Decreto 333/2025 (B.O. 20/05/2025): Modifica Decreto 557/23. Tasas VIGENTES por posición NCM:
  • 8517.13.00 (teléfonos inteligentes/smartphones) y 8517.14.31 (celulares portátiles excl. satelital): DI 8% desde 20/05/2025 → DI 0% desde 15/01/2026 (régimen BIT, incorporados al Anexo IV del Dec. 557/23). Impuesto Interno: 9,5% hasta 31/12/2038 (Art. 3°). Empresas Ley 19.640 (Tierra del Fuego): II 0%.
  • 9504.50.00 (videoconsolas y máquinas videojuego excl. 9504.30): eliminadas del Incremento Transitorio (estaban al 35% DI), pasan al AEC vigente de 20%.
  • IMPUESTO INTERNO 9,5% (vigente hasta 31/12/2038) para estas posiciones NCM: 8415.10.11, 8415.10.19, 8415.81.10, 8415.82.10, 8415.90.10, 8415.90.20 (aire acondicionado y partes), 8418.69.40 (grupos frigoríficos), 8517.13.00, 8517.14.31, 8517.14.90 (celulares/teléfonos), 8528.52.00, 8528.59.00, 8528.71.11, 8528.71.19, 8528.72.00 (monitores y TV). Para estas posiciones el II es 9,5%, NO el 19% general. Empresas Ley 19.640 con origen Área Aduanera Especial: II 0%.
  IMPORTANTE: Para celulares el IVA es siempre 21% (no confundir con II 9,5%). Los tributos completos para 8517.13.00/8517.14.31 son: DI 8% (0% desde ene 2026), TE 3%, II 9,5%, IVA 21%, IVA Ad. 10%, IG 6%, IIBB 2,5%.
- NORMATIVA Argentina — Decreto 236/2025 (B.O. 31/03/2025): Modifica alícuotas DI para el sector textil, confecciones y calzado. Establece nuevas tasas en Anexo I y sustituye alícuotas en Anexo II del Decreto 557/23 para posiciones NCM de tejidos (Cap. 50-60), confecciones (Cap. 61-63) y calzado (Cap. 64). Tasas históricas del sector: 26% y 35% DI. Al clasificar productos textiles, confecciones o calzado verificar si la posición fue modificada por este decreto.
- NORMATIVA Argentina — Decreto 305/2026 (B.O. 04/05/2026): Incorpora al Incremento Arancelario Transitorio (Anexo V del Decreto 557/23) a los productos de tabaco calentado (PTC), cigarrillos electrónicos (CE) y bolsas de nicotina (BN). Se les aplica el arancel máximo consolidado ante la OMC para equipararlos con cigarrillos tradicionales. Posiciones afectadas: cartuchos y barras de tabaco para sistemas de calentamiento. Importadores de estos productos deben registrar ante el servicio aduanero dentro de 60 días si la mercadería estaba en tránsito al momento del dictado.
- NORMATIVA Argentina — Resolución 11/2026 MEyP (B.O. 16/01/2026): Papeles para uso editorial (Capítulo 48 NCM, Nota de Tributación al Cap. 48): DI 0% para importaciones de papel destinado a libros, diarios, directorios y publicaciones periódicas de interés general. Crea el RISE (Registro de Importadores de papel para uso editorial) en la Dirección de Importaciones. Para acceder al beneficio el importador debe inscribirse en el RISE. Si el producto importado a Argentina son papeles del Capítulo 48 para uso editorial, indicar DI 0% y mencionar RISE en destination_documents.
- NORMATIVA Argentina — RG ARCA 5807/2025 (B.O. 30/12/2025): Prorroga hasta el 30 de junio de 2026 las siguientes exenciones de percepción al momento de importación: (1) RG 2.281 — exención de percepción de Ganancias (IG) para operaciones de importación de bienes de primera necesidad definidos por RG 5.490; (2) RG 2.937 — exención de percepción adicional de IVA (IVA Ad.) para esas mismas importaciones de bienes de primera necesidad; (3) RG 5.501 — exención de percepciones IG e IVA Ad. para importaciones de insumos productivos de micro, pequeñas y medianas empresas (MiPyME) con Certificado MiPyME vigente. Al clasificar alimentos básicos o insumos de MiPyME para importación a Argentina, mencionar en "notes" que las percepciones de IG (6%) e IVA Ad. (10%) pueden estar eximidas hasta 30/06/2026 para bienes de primera necesidad (RG ARCA 5807/2025) o para MiPyME con certificado habilitante (RG 5501).
- Solo respondés con el JSON, sin texto adicional, sin markdown`;

export async function POST(req: NextRequest) {
  const credit = await checkAndConsumeCredit();
  if (!credit.ok) return credit.error!;

  const formData = await req.formData();
  const query = formData.get("query") as string | null;
  const imageFile = formData.get("image") as File | null;
  const lang = (formData.get("lang") as string) || "es";
  const origin = (formData.get("origin") as string) || "";
  const destination = (formData.get("destination") as string) || "";
  const system = (formData.get("system") as string) || "HS";

  if (!query && !imageFile) {
    return NextResponse.json({ error: "Se requiere texto o imagen" }, { status: 400 });
  }

  const routeContext = origin && destination
    ? `País de origen: ${origin}. País de destino: ${destination}. Sistema de nomenclatura preferido: ${system}.`
    : "";

  try {
    let messages: Anthropic.MessageParam[];

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

      messages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Identificá el producto en esta imagen y devolvé los códigos arancelarios. ${routeContext}${query ? ` Descripción adicional: ${query}` : ""}`,
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "user",
          content: `Buscá el código arancelario para: ${query}. ${routeContext}`,
        },
      ];
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);

    // Enriquecer cada resultado con datos oficiales en paralelo:
    // WTO (tasas MFN) + NCM Siscomex (descripción oficial) + TARIC (EU)
    if (parsed.results && Array.isArray(parsed.results) && destination) {
      const enrichPromises = parsed.results.map(async (r: any) => {
        const hs6      = normalizeHS6(r.hs_code || r.ncm_code || "");
        const ncm8     = normalizeNCM8(r.ncm_code || r.hs_code || "");
        const taricCode = hs6ToTaric(hs6);

        // Consultas en paralelo a las tres fuentes
        const [wto, ncm, taric] = await Promise.all([
          hs6 ? getWTOMFNRate(hs6, destination) : Promise.resolve(null),
          ncm8.length >= 6 ? getNCMCode(ncm8) : Promise.resolve(null),
          hs6 ? getTARICRate(taricCode, r.origin || origin || "") : Promise.resolve(null),
        ]);

        const enriched = { ...r };

        // WTO → tasa MFN real
        if (wto?.source === "WTO" && wto.mfn_rate !== null) {
          enriched.base_rate = `${wto.mfn_rate}%`;
          enriched.wto_source = true;
          enriched.wto_year  = wto.year;
          enriched.confidence = "alta";
        } else {
          enriched.wto_source = false;
        }

        // NCM → descripción oficial y vigencia
        if (ncm?.source === "NCM") {
          enriched.ncm_description_official = ncm.descricao;
          enriched.ncm_vigente = true;
          enriched.ncm_desde   = ncm.data_inicio;
        }

        // TARIC → tasa EU si el destino es europeo
        if (taric?.source === "TARIC") {
          enriched.taric_duty    = taric.third_country_duty;
          enriched.taric_unit    = taric.unit;
          enriched.taric_footnotes = taric.footnotes;
          enriched.taric_measures  = taric.measures;
        }

        return enriched;
      });

      parsed.results = await Promise.all(enrichPromises);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: lang === "en" ? "Search error. Please try again." : "Error al procesar la búsqueda. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
