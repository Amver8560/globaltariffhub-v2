import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateTaxes } from "@/lib/taxEngine";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const description = (formData.get("description") as string || "").trim();
    const hs_code = (formData.get("hs_code") as string || "").trim();
    const tariff_system = (formData.get("tariff_system") as string || "NCM").toUpperCase();
    const supplier_country = formData.get("supplier_country") as string || "China";
    const destination = formData.get("destination") as string || "";
    const fob_unit = parseFloat(formData.get("fob_unit") as string || "0");
    const quantity = parseInt(formData.get("quantity") as string || "1");
    const freight_total = parseFloat(formData.get("freight_total") as string || "0");
    const lang = (formData.get("lang") as string || "es").toLowerCase();
    const es = lang === "es";

    if (!destination || fob_unit <= 0) {
      return NextResponse.json({
        error: es ? "Seleccioná el país de importación e ingresá el precio FOB." : "Select import country and enter FOB price."
      }, { status: 400 });
    }

    // ── Paso 1: Identificación del producto con IA ──
    let productInfo: any = {
      hs_code: hs_code || "",
      description: description || "",
      product_name: description || "Producto sin identificar",
      tariff_rate: 14,
      ncm_code: "",
      taric_code: "",
      requires_permits: [],
      confidence: "low",
    };

    const needsAI = !hs_code && (image || description);

    if (needsAI) {
      const messages: any[] = [];
      const content: any[] = [];

      // Agregar imagen si existe
      if (image && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const b64 = Buffer.from(bytes).toString("base64");
        const mediaType = (image.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: b64 }
        });
      }

      const systemLabel = tariff_system === "NCM"
        ? "NCM (Nomenclatura Común del MERCOSUR, 8 dígitos)"
        : tariff_system === "TARIC"
        ? "TARIC (Arancel Integrado Europeo, 10 dígitos)"
        : "HS (Sistema Armonizado Internacional, 6 dígitos)";

      const promptText = es
        ? `Analizá este producto${description ? ` (descripción: "${description}")` : ""} para importación desde ${supplier_country} hacia ${destination}.
El usuario trabaja con el sistema ${systemLabel}.
Identificá el producto y devolvé SOLO JSON válido sin texto adicional:
{
  "product_name": "nombre del producto en español",
  "description": "descripción técnica breve",
  "hs_code": "código HS de 6 dígitos sin puntos, ej: 630140",
  "ncm_code": "código NCM de 8 dígitos para MERCOSUR, ej: 63014000",
  "taric_code": "código TARIC de 10 dígitos o null si no aplica",
  "primary_code": "el código principal en sistema ${tariff_system} — el más importante para este usuario",
  "tariff_rate": 20,
  "chapter": "descripción del capítulo arancelario",
  "requires_permits": ["ANMAT", "etc — solo si realmente aplica, sino []"],
  "import_restrictions": "descripción de restricciones específicas o null",
  "confidence": "high/medium/low"
}`
        : `Analyze this product${description ? ` (description: "${description}")` : ""} for import from ${supplier_country} to ${destination}.
The user works with the ${systemLabel} system.
Identify the product and return ONLY valid JSON without extra text:
{
  "product_name": "product name in English",
  "description": "brief technical description",
  "hs_code": "6-digit HS code without dots, e.g.: 630140",
  "ncm_code": "8-digit NCM code for MERCOSUR, e.g.: 63014000",
  "taric_code": "10-digit TARIC code or null if not applicable",
  "primary_code": "the main code in ${tariff_system} system — most important for this user",
  "tariff_rate": 20,
  "chapter": "tariff chapter description",
  "requires_permits": ["agencies — only if truly applicable, else []"],
  "import_restrictions": "specific restriction description or null",
  "confidence": "high/medium/low"
}`;

      content.push({ type: "text", text: promptText });
      messages.push({ role: "user", content });

      const msg = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 800,
        messages,
      });

      const text = msg.content[0].type === "text" ? msg.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          productInfo = { ...productInfo, ...parsed };
        } catch {
          // Mantener productInfo por defecto si JSON inválido
        }
      }
    }

    // ── Paso 2: Cálculo de tributos (motor propio) ──
    const fob_total = fob_unit * quantity;
    const insurance = fob_total * 0.005;
    const cif = fob_total + freight_total + insurance;

    const tariff_rate = typeof productInfo.tariff_rate === "number"
      ? productInfo.tariff_rate
      : parseFloat(productInfo.tariff_rate) || 14;

    const taxes = calculateTaxes({ cif, tariff_rate, destination });

    // ── Paso 3: Análisis comercial ──
    const landed_unit = taxes.landed_cost / quantity;

    return NextResponse.json({
      product: { ...productInfo, tariff_system },
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
        suggested_price_min: landed_unit * 1.8,
        suggested_price_unit: landed_unit * 2.5,
        suggested_price_max: landed_unit * 3.5,
        margin_pct: 150,
      },
    });

  } catch (err: any) {
    console.error("viability error:", err?.message || err);
    return NextResponse.json({
      error: `Error: ${err?.message || "Error interno del servidor"}`
    }, { status: 500 });
  }
}
