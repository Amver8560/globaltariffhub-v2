import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredit } from "@/lib/credits";
import { aiErrorResponse, buildAIErrorPayload, MODEL_DEADLINE_MS, ENRICH_DEADLINE_MS } from "@/lib/aiError";
import { getWTOMFNRate, normalizeHS6 } from "@/lib/wtoApi";
import { getNCMCode, normalizeNCM8 } from "@/lib/ncmApi";
import { getTARICRate, hs6ToTaric } from "@/lib/taricApi";

// El servidor aborta la llamada al modelo antes que el backstop del cliente (45s).
export const maxDuration = 60;

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
- Si "trade_agreement" es "Ninguno", NO incluyas "Certificado de origen" ni ninguna de sus variantes ("Certificado de origen MERCOSUR", "Certificado de origen preferencial", "EUR.1", "Form A", etc.) en "origin_documents" ni en "destination_documents": un certificado de origen preferencial solo tiene sentido cuando existe un acuerdo que otorga tasa preferencial. Si el país de destino exige un certificado de origen NO preferencial por un régimen puntual (antidumping, cupo, licencia), escribilo exactamente como "Certificado de origen no preferencial (si lo exige el régimen del destino)"
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
- Solo respondés con el JSON, sin texto adicional, sin markdown`;

// Nota específica de Argentina — se agrega solo cuando la operación es hacia/desde Argentina.
const ARG_NOTE = `Nota Argentina (destino u origen Argentina): usá SEDI y DUA, y certificados de los organismos vigentes (SENASA, ANMAT, ENACOM según el producto). Nunca menciones SIRA, SIMI, DJAI ni DJCP (fueron eliminados). Trámites a través de VUCE (vuce.gob.ar). Usá ARCA, no AFIP.`;

const ENRICHED_MARKER = "\x00ENRICHED\x00";

export async function POST(req: NextRequest) {
  const credit = await checkAndConsumeCredit();
  if (!credit.ok) return credit.error!;

  let lang = "es";

  try {
    const formData = await req.formData();
    const query = formData.get("query") as string | null;
    const imageFile = formData.get("image") as File | null;
    lang = (formData.get("lang") as string) || "es";
    const origin = (formData.get("origin") as string) || "";
    const destination = (formData.get("destination") as string) || "";
    const system = (formData.get("system") as string) || "HS";

    if (!query && !imageFile) {
      return NextResponse.json({ error: "Se requiere texto o imagen" }, { status: 400 });
    }

    const routeContext = origin && destination
      ? `País de origen: ${origin}. País de destino: ${destination}. Sistema de nomenclatura preferido: ${system}.`
      : "";

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

    const isArgentina = /argentina/i.test(origin) || /argentina/i.test(destination);

    const readable = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        let fullText = "";

        const emitError = async (err: unknown) => {
          const payload = await buildAIErrorPayload(err, {
            lang,
            userId: credit.userId,
            fallback: lang === "en" ? "Search error." : "Error al procesar la búsqueda.",
          });
          controller.enqueue(enc.encode(ENRICHED_MARKER + JSON.stringify(payload)));
        };

        try {
          // ── 1. Modelo (con deadline del servidor) ──
          try {
            const stream = client.messages.stream(
              {
                model: "claude-sonnet-4-6",
                max_tokens: 2048,
                system: [
                  { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
                  ...(isArgentina ? [{ type: "text" as const, text: ARG_NOTE }] : []),
                ],
                messages,
              },
              { signal: AbortSignal.timeout(MODEL_DEADLINE_MS), maxRetries: 1 },
            );

            stream.on("text", (chunk) => {
              fullText += chunk;
              controller.enqueue(enc.encode(chunk));
            });

            await stream.finalMessage();
          } catch (err) {
            // El modelo no entregó respuesta → reintegro + frame de error.
            await emitError(err);
            return;
          }

          // ── 2. Parseo del JSON del modelo ──
          let parsed: Record<string, unknown> | null = null;
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          } catch {
            parsed = null;
          }
          if (!parsed) {
            await emitError(new Error("El modelo no devolvió un JSON utilizable"));
            return;
          }

          // ── 3. Enriquecimiento con fuentes — best-effort, nunca hace fallar el resultado ──
          try {
            const results = parsed.results as Array<Record<string, unknown>> | undefined;
            if (Array.isArray(results) && destination) {
              const enrichAll = Promise.all(
                results.map(async (r) => {
                  const hs6 = normalizeHS6(String(r.hs_code || r.ncm_code || ""));
                  const ncm8 = normalizeNCM8(String(r.ncm_code || r.hs_code || ""));
                  const taricCode = hs6ToTaric(hs6);
                  const [wto, ncm, taric] = await Promise.all([
                    hs6 ? getWTOMFNRate(hs6, destination).catch(() => null) : Promise.resolve(null),
                    ncm8.length >= 6 ? getNCMCode(ncm8).catch(() => null) : Promise.resolve(null),
                    hs6 ? getTARICRate(taricCode, String(r.origin || origin || "")).catch(() => null) : Promise.resolve(null),
                  ]);
                  const enriched: Record<string, unknown> = { ...r };
                  if (wto?.source === "WTO" && wto.mfn_rate !== null) {
                    enriched.base_rate = `${wto.mfn_rate}%`;
                    enriched.wto_source = true;
                    enriched.wto_year = wto.year;
                    enriched.confidence = "alta";
                  } else {
                    enriched.wto_source = false;
                  }
                  if (ncm?.source === "NCM") {
                    enriched.ncm_description_official = ncm.descricao;
                    enriched.ncm_vigente = true;
                  }
                  if (taric?.source === "TARIC") {
                    enriched.taric_duty = taric.third_country_duty;
                    enriched.taric_measures = taric.measures;
                  }
                  return enriched;
                }),
              );
              const timed = await Promise.race([
                enrichAll,
                new Promise<null>((resolve) => setTimeout(() => resolve(null), ENRICH_DEADLINE_MS)),
              ]);
              if (timed) parsed.results = timed;
            }
          } catch (enrichErr) {
            console.error("[search] enriquecimiento falló, se entrega el resultado del modelo:", enrichErr);
          }

          controller.enqueue(enc.encode(ENRICHED_MARKER + JSON.stringify(parsed)));
        } finally {
          controller.close();
        }
      },
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
      fallback: lang === "en" ? "Search error." : "Error al procesar la búsqueda.",
    });
  }
}
