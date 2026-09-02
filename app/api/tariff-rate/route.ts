import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkAndConsumeCredit } from "@/lib/credits";
import { aiErrorResponse, MODEL_DEADLINE_MS } from "@/lib/aiError";
import { resolveTariff, toLegacyView } from "@/lib/tariffResolver";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  let lang = "es";
  try {
    const credit = await checkAndConsumeCredit();
    if (!credit.ok) return credit.error!;
    userId = credit.userId;

    const body = await req.json();
    const { tariff_code, system = "HS", origin, destination } = body;
    lang = body.lang || "es";

    if (!tariff_code || !destination) {
      return NextResponse.json({ error: "tariff_code and destination are required" }, { status: 400 });
    }

    const systemLabel = system === "NCM" ? "NCM (Nomenclatura Común del MERCOSUR)"
      : system === "TARIC" ? "TARIC (código arancelario de la Unión Europea)"
      : "HS (Sistema Armonizado)";

    // La IA sólo aporta CONTEXTO (descripción, notas del acuerdo). No aporta la tasa:
    // la tasa la resuelve `resolveTariff()` por jurisdicción, nomenclatura y fuente (Bloque 2).
    const systemPrompt = lang === "es"
      ? `Eres un experto en comercio internacional y aranceles aduaneros.
Dado un código arancelario en formato ${systemLabel} y países de origen y destino, devuelve las tasas arancelarias aplicables.
Responde SOLO con JSON válido, sin texto adicional.`
      : `You are an expert in international trade and customs tariffs.
Given a tariff code in ${system} format and origin/destination countries, return the applicable tariff rates.
Respond ONLY with valid JSON, no additional text.`;

    const userPrompt = lang === "es"
      ? `Para el código ${system} ${tariff_code}, exportación desde ${origin || "origen no especificado"} hacia ${destination}:
¿Cuál es la tasa arancelaria base y la tasa preferencial si aplica algún acuerdo comercial?

Responde con este JSON exacto:
{
  "tariff_code": "${tariff_code}",
  "system": "${system}",
  "description": "descripción breve del producto",
  "base_rate": 14.5,
  "preferential_rate": 0,
  "has_preferential": true,
  "agreement": "nombre del acuerdo (ej: MERCOSUR, TLC, SGP) o null",
  "agreement_note": "nota breve sobre condiciones del acuerdo o null",
  "origin": "${origin || ""}",
  "destination": "${destination}",
  "notes": "observación adicional relevante o null",
  "confidence": "high/medium/low"
}`
      : `For ${system} code ${tariff_code}, export from ${origin || "unspecified origin"} to ${destination}:
What is the base tariff rate and preferential rate if any trade agreement applies?

Respond with this exact JSON:
{
  "tariff_code": "${tariff_code}",
  "system": "${system}",
  "description": "brief product description",
  "base_rate": 14.5,
  "preferential_rate": 0,
  "has_preferential": true,
  "agreement": "agreement name (e.g.: MERCOSUR, FTA, GSP) or null",
  "agreement_note": "brief note about agreement conditions or null",
  "origin": "${origin || ""}",
  "destination": "${destination}",
  "notes": "additional relevant observation or null",
  "confidence": "high/medium/low"
}`;

    // Modelo (contexto) + resolvedor de tasa (fuentes), en paralelo.
    const [message, resolved] = await Promise.all([
      client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: AbortSignal.timeout(MODEL_DEADLINE_MS), maxRetries: 1 },
      ),
      resolveTariff({ importCountry: destination, originCountry: origin || "", code: tariff_code, system }),
    ]);

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const ai = jsonMatch ? safeParse(jsonMatch[0]) : null;

    const legacy = toLegacyView(resolved);

    // Se conserva SÓLO el contexto textual de la IA. Sus cifras (base_rate,
    // preferential_rate, confidence) se descartan: la tasa la fija el resolvedor.
    const data = {
      tariff_code,
      system,
      origin: origin || "",
      destination,
      description: ai?.description ?? null,
      notes: ai?.notes && ai.notes !== "null" ? ai.notes : null,
      agreement: ai?.agreement && ai.agreement !== "null" ? ai.agreement : null,
      agreement_note: ai?.agreement_note && ai.agreement_note !== "null" ? ai.agreement_note : null,

      // Estructura canónica (Bloque 2).
      tariff: {
        general: resolved.general,
        preferential: resolved.preferential ?? null,
      },
      jurisdiction: resolved.jurisdiction,

      // Campos legacy — derivados EXCLUSIVAMENTE del TariffDatum. null si no hay tasa.
      base_rate: legacy.base_rate,
      base_rate_status: legacy.base_rate_status,
      base_rate_source: legacy.base_rate_source,
      base_rate_asof: legacy.base_rate_asof,
      preferential_rate: legacy.preferential_rate,
      has_preferential: legacy.has_preferential,
    };

    return NextResponse.json(data);
  } catch (err: unknown) {
    return aiErrorResponse(err, {
      lang,
      userId,
      fallback: lang === "en" ? "Could not fetch the tariff rate. Please try again." : "No se pudo obtener la tasa arancelaria. Intentá de nuevo.",
    });
  }
}

function safeParse(s: string): Record<string, unknown> | null {
  try { return JSON.parse(s); } catch { return null; }
}
