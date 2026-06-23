import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredit } from "@/lib/credits";

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
      "confidence": "alta"
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
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: lang === "en" ? "Search error. Please try again." : "Error al procesar la búsqueda. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
