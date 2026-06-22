import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateTaxes } from "@/lib/taxEngine";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const description = formData.get("description") as string || "";
    const hs_code = formData.get("hs_code") as string || "";
    const supplier_country = formData.get("supplier_country") as string || "China";
    const destination = formData.get("destination") as string;
    const fob_unit = parseFloat(formData.get("fob_unit") as string || "0");
    const quantity = parseInt(formData.get("quantity") as string || "1");
    const freight_total = parseFloat(formData.get("freight_total") as string || "0");
    const lang = formData.get("lang") as string || "es";
    const es = lang === "es";

    if (!destination || fob_unit <= 0) {
      return NextResponse.json({ error: es ? "Faltan datos obligatorios." : "Missing required data." }, { status: 400 });
    }

    // ── Paso 1: Identificación del producto con IA (si no viene HS code) ──
    let productInfo: any = { hs_code: hs_code || "N/A", description: description || "", tariff_rate: 14, ncm_code: "", taric_code: "" };

    if (!hs_code && (image || description)) {
      const content: any[] = [];

      if (image) {
        const bytes = await image.arrayBuffer();
        const b64 = Buffer.from(bytes).toString("base64");
        content.push({ type: "image", source: { type: "base64", media_type: image.type, data: b64 } });
      }

      const prompt = es
        ? `Analizá este producto ${description ? `(descripción: "${description}")` : ""} para importación desde ${supplier_country} hacia ${destination}.
Identificá el producto y devolvé SOLO este JSON:
{
  "product_name": "nombre del producto",
  "description": "descripción técnica breve",
  "hs_code": "código HS principal (6 dígitos)",
  "ncm_code": "código NCM si aplica (8 dígitos)",
  "taric_code": "código TARIC si aplica (10 dígitos)",
  "tariff_rate": 14,
  "chapter": "capítulo arancelario",
  "requires_permits": ["lista de organismos de control si aplica"],
  "import_restrictions": "restricciones especiales o null",
  "confidence": "high/medium/low"
}`
        : `Analyze this product ${description ? `(description: "${description}")` : ""} for import from ${supplier_country} to ${destination}.
Identify the product and return ONLY this JSON:
{
  "product_name": "product name",
  "description": "brief technical description",
  "hs_code": "main HS code (6 digits)",
  "ncm_code": "NCM code if applicable (8 digits)",
  "taric_code": "TARIC code if applicable (10 digits)",
  "tariff_rate": 14,
  "chapter": "tariff chapter",
  "requires_permits": ["list of regulatory agencies if applicable"],
  "import_restrictions": "special restrictions or null",
  "confidence": "high/medium/low"
}`;

      content.push({ type: "text", text: prompt });

      const msg = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 600,
        messages: [{ role: "user", content }],
      });

      const text = msg.content[0].type === "text" ? msg.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) productInfo = { ...productInfo, ...JSON.parse(jsonMatch[0]) };
    }

    // ── Paso 2: Cálculo de tributos (motor propio) ──
    const fob_total = fob_unit * quantity;
    const insurance = fob_total * 0.005; // 0.5% seguro estándar
    const cif = fob_total + freight_total + insurance;

    const taxes = calculateTaxes({
      cif,
      tariff_rate: productInfo.tariff_rate || 14,
      destination,
    });

    // ── Paso 3: Análisis comercial ──
    const landed_unit = taxes.landed_cost / quantity;
    const suggested_price_unit = landed_unit * 2.5; // margen 150% referencial
    const suggested_price_min = landed_unit * 1.8;
    const suggested_price_max = landed_unit * 3.5;

    return NextResponse.json({
      product: productInfo,
      commercial: {
        fob_unit,
        fob_total,
        freight_total,
        insurance,
        cif,
        quantity,
        supplier_country,
        destination,
      },
      taxes,
      analysis: {
        landed_unit,
        suggested_price_unit,
        suggested_price_min,
        suggested_price_max,
        margin_pct: 150,
        breakeven_units: Math.ceil(freight_total / (fob_unit * 0.3)),
      },
    });

  } catch (err: any) {
    console.error("viability error:", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
