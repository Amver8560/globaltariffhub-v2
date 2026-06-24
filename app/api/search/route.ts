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
- NORMATIVA VIGENTE Argentina — Decreto 252/2026 (B.O. 17/04/2026): Reforma el Régimen de Aduana en Factoría (RAF). Amplía los sujetos alcanzados incluyendo "proveedores asociados" de establecimientos industriales. Elimina la garantía global única y la exigencia de acta-convenio previa. ARCA tiene plazo de 60 días para expedirse sobre operatoria aduanera. Aplica a establecimientos industriales manufactureros en general. Si el producto puede enmarcarse en el RAF mencioná esta opción en el campo "notes".
- IMPORTANTE — Argentina celulares/smartphones/tablets (posiciones NCM 8517.13, 8517.12, 8471): Los tributos correctos son: DI 20% (puede ser 0% bajo régimen BIT Res. MEyP 669/2024), TE 3%, Impuesto Interno ~9,5% (Ley 24.674 Cap. VI), IVA 21%, IVA Percepción 10% (inscriptos), Percepción Ganancias 6%, Ingresos Brutos ~2,5%. NUNCA indiques IVA 9,5% para celulares — el IVA es siempre 21%; el 9,5% es el Impuesto Interno. Incluí todos estos tributos en el campo "taxes".
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
