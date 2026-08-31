import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredit, refundCredit } from "@/lib/credits";
import { aiErrorResponse, isAIBusyError, aiBusyMessage } from "@/lib/aiError";
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
      "recommended": true,
      "applies_when": "Tu producto es vino en botella o envase individual de hasta 2 litros.",
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
- Devolvé entre 1 y 3 resultados ordenados por relevancia. El primer resultado SIEMPRE debe ser el más probable y tener "recommended": true. Los siguientes deben tener "recommended": false.
- "confidence" puede ser "alta", "media" o "baja"
- "recommended": true solo en el primer resultado (el más probable). Los demás "recommended": false.
- "applies_when": frase corta y simple (1 oración) que explica EN QUÉ CASO aplica ESE código específico. Escribila en lenguaje llano, sin jerga técnica. Ejemplo: "Tu producto es vino en botella individual de hasta 2 litros." o "Si tu producto se vende a granel en envases mayores a 2 litros, usá este código." Siempre debe estar presente en todos los resultados.
- El campo "taxes" muestra SOLO el arancel de importación y sus variantes por acuerdo comercial. NO incluyas IVA, percepciones, impuestos internos, sellos ni ningún tributo que no sea el arancel propiamente dicho — esos son competencia del despachante de aduana de cada país. Estructura del array taxes[]:
  1. Arancel general (MFN/NMF): tasa base sin acuerdo preferencial
  2. Arancel preferencial: solo si hay acuerdo comercial activo entre origen y destino (ej: MERCOSUR 0%, KCFTA 0%)
  3. Antidumping o cuota arancelaria: solo si aplica específicamente a ese producto y ruta
  Ejemplo: [{ "code": "Arancel MFN", "rate": "8%", "label": "Arancel general de importación", "note": "" }, { "code": "Arancel KCFTA", "rate": "0%", "label": "Tasa preferencial con certificado de origen KCFTA", "note": "" }]
- Argentina — documentos vigentes: usá SEDI, DUA, y certificados de organismos vigentes (SENASA, ANMAT, ENACOM según el producto). Nunca menciones SIRA, SIMI, DJAI ni DJCP (eliminados). Trámites a través de VUCE (vuce.gob.ar). Usá ARCA (no AFIP).
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

    const ENRICHED_MARKER = "\x00ENRICHED\x00";

    const readable = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        let fullText = "";

        try {
          // Stream Claude response
          const stream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
            messages,
          });

          stream.on("text", (chunk) => {
            fullText += chunk;
            controller.enqueue(enc.encode(chunk));
          });

          await stream.finalMessage();

          // Enriquecer con fuentes oficiales
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.results && Array.isArray(parsed.results) && destination) {
              const enrichPromises = parsed.results.map(async (r: any) => {
                const hs6 = normalizeHS6(r.hs_code || r.ncm_code || "");
                const ncm8 = normalizeNCM8(r.ncm_code || r.hs_code || "");
                const taricCode = hs6ToTaric(hs6);
                const [wto, ncm, taric] = await Promise.all([
                  hs6 ? getWTOMFNRate(hs6, destination) : Promise.resolve(null),
                  ncm8.length >= 6 ? getNCMCode(ncm8) : Promise.resolve(null),
                  hs6 ? getTARICRate(taricCode, r.origin || origin || "") : Promise.resolve(null),
                ]);
                const enriched = { ...r };
                if (wto?.source === "WTO" && wto.mfn_rate !== null) {
                  enriched.base_rate = `${wto.mfn_rate}%`;
                  enriched.wto_source = true;
                  enriched.wto_year = wto.year;
                  enriched.confidence = "alta";
                } else { enriched.wto_source = false; }
                if (ncm?.source === "NCM") {
                  enriched.ncm_description_official = ncm.descricao;
                  enriched.ncm_vigente = true;
                }
                if (taric?.source === "TARIC") {
                  enriched.taric_duty = taric.third_country_duty;
                  enriched.taric_measures = taric.measures;
                }
                return enriched;
              });
              parsed.results = await Promise.all(enrichPromises);
            }
            // Enviar datos enriquecidos al final del stream
            controller.enqueue(enc.encode(ENRICHED_MARKER + JSON.stringify(parsed)));
          }
        } catch (err) {
          const busy = isAIBusyError(err);
          if (busy) {
            try { await refundCredit(credit.userId); } catch { /* no-op */ }
          } else {
            console.error(err);
          }
          controller.enqueue(enc.encode(ENRICHED_MARKER + JSON.stringify({
            error: busy
              ? aiBusyMessage(lang)
              : (lang === "en" ? "Search error. Please try again." : "Error al procesar la búsqueda. Intentá de nuevo."),
            code: busy ? "AI_BUSY" : undefined,
          })));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return aiErrorResponse(error, {
      lang,
      userId: credit.userId,
      fallback: lang === "en" ? "Search error. Please try again." : "Error al procesar la búsqueda. Intentá de nuevo.",
    });
  }
}
