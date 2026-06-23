import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkAndConsumeCredit } from "@/lib/credits";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const credit = await checkAndConsumeCredit();
    if (!credit.ok) return credit.error!;

    const { tariff_code, system = "HS", origin, destination, lang = "es" } = await req.json();

    if (!tariff_code || !destination) {
      return NextResponse.json({ error: "tariff_code and destination are required" }, { status: 400 });
    }

    const systemLabel = system === "NCM" ? "NCM (Nomenclatura Común del MERCOSUR)"
      : system === "TARIC" ? "TARIC (código arancelario de la Unión Europea)"
      : "HS (Sistema Armonizado)";

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("tariff-rate error:", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
