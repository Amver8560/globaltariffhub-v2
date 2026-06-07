import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un experto en nomenclatura arancelaria internacional (HS, NCM, TARIC).
Cuando el usuario te pase una descripción de producto o una imagen, devolvés un JSON con este formato exacto:

{
  "results": [
    {
      "code": "0806.10",
      "system": "HS",
      "description": "Uvas frescas",
      "chapter": "08 - Frutas y frutos comestibles",
      "base_rate": "12%",
      "notes": "Sujeto a cuota estacional en la UE",
      "confidence": "alta"
    }
  ],
  "disclaimer": "Datos de referencia. Verificar con la fuente oficial antes de operar."
}

Devolvé entre 1 y 3 resultados ordenados por relevancia.
El campo "system" puede ser "HS", "NCM" o "TARIC" según corresponda.
El campo "confidence" puede ser "alta", "media" o "baja".
Solo respondés con el JSON, sin texto adicional.`;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const query = formData.get("query") as string | null;
  const imageFile = formData.get("image") as File | null;
  const lang = (formData.get("lang") as string) || "es";

  if (!query && !imageFile) {
    return NextResponse.json({ error: "Se requiere texto o imagen" }, { status: 400 });
  }

  const isEs = lang !== "en";

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
              text: `Identificá el producto en esta imagen y devolvé los códigos arancelarios HS/NCM/TARIC correspondientes.${query ? ` Descripción adicional: ${query}` : ""}`,
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "user",
          content: `Buscá el código arancelario para: ${query}`,
        },
      ];
    }

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: isEs ? "Error al procesar la búsqueda" : "Search processing error" },
      { status: 500 }
    );
  }
}
