import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateTaxes } from "@/lib/taxEngine";
import { checkAndConsumeCredit } from "@/lib/credits";
import { aiErrorResponse, MODEL_DEADLINE_MS } from "@/lib/aiError";
import { resolveTariff } from "@/lib/tariffResolver";
import { notDetermined } from "@/lib/tariffDatum";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  let lang = "es";
  try {
    // Verificar créditos antes de procesar
    const credit = await checkAndConsumeCredit();
    if (!credit.ok) return credit.error!;
    userId = credit.userId;

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
    lang = (formData.get("lang") as string || "es").toLowerCase();
    const es = lang === "es";

    if (!destination || fob_unit <= 0) {
      return NextResponse.json({
        error: es ? "Seleccioná el país de importación e ingresá el precio FOB." : "Select import country and enter FOB price."
      }, { status: 400 });
    }

    // ── Paso 1: Identificación del producto con IA ──
    // La IA identifica el producto. Sus cifras arancelarias (tariff_rate,
    // effective_rate) y "excepciones de régimen" inferidas NO se usan ni se
    // muestran (Bloque 2 · D6/D9): la tasa la resuelve resolveTariff().
    let productInfo: any = {
      hs_code: hs_code || "",
      description: description || "",
      product_name: description || "Producto sin identificar",
      ncm_code: "",
      taric_code: "",
      requires_permits: [],
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

IMPORTANTE: Determiná la tasa arancelaria EFECTIVA real, aplicando las excepciones de régimen que correspondan al país de destino: bienes de capital (BK), bienes de tecnología/informática (BIT), zonas francas, regímenes de perfeccionamiento o drawback, tasa preferencial por TLC según el país de origen, y SGP.

Identificá el producto y devolvé SOLO JSON válido sin texto adicional:
{
  "product_name": "nombre del producto en español",
  "description": "descripción técnica breve",
  "hs_code": "código HS de 6 dígitos sin puntos, ej: 851712",
  "ncm_code": "código NCM de 8 dígitos para MERCOSUR, ej: 85171210",
  "taric_code": "código TARIC de 10 dígitos o null si no aplica",
  "primary_code": "el código principal en sistema ${tariff_system}",
  "tariff_rate": 16,
  "effective_rate": 0,
  "exception_applied": "BIT — Bien de Informática y Telecomunicaciones. Res. MEyP 669/2024. DI 0% para teléfonos celulares bajo NCM 8517.12.10",
  "exception_type": "BIT|BK|TLC|SGP|MERCOSUR|PROSEC|null",
  "chapter": "descripción del capítulo arancelario",
  "requires_permits": ["ENACOM", "etc — solo si realmente aplica, sino []"],
  "import_restrictions": "descripción de restricciones específicas o null",
  "confidence": "high/medium/low"
}`
        : `Analyze this product${description ? ` (description: "${description}")` : ""} for import from ${supplier_country} to ${destination}.
The user works with the ${systemLabel} system.

IMPORTANT: Determine the ACTUAL effective tariff rate, applying the regime exceptions that apply to the destination country: capital goods, IT/technology goods, free zones, inward-processing or drawback regimes, preferential FTA rate by country of origin, and GSP.

Identify the product and return ONLY valid JSON without extra text:
{
  "product_name": "product name in English",
  "description": "brief technical description",
  "hs_code": "6-digit HS code without dots, e.g.: 851712",
  "ncm_code": "8-digit NCM code for MERCOSUR, e.g.: 85171210",
  "taric_code": "10-digit TARIC code or null if not applicable",
  "primary_code": "the main code in ${tariff_system} system",
  "tariff_rate": 16,
  "effective_rate": 0,
  "exception_applied": "BIT — IT and Telecom Goods. 0% DI for mobile phones under NCM 8517.12.10",
  "exception_type": "BIT|BK|FTA|GSP|MERCOSUR|null",
  "chapter": "tariff chapter description",
  "requires_permits": ["agencies — only if truly applicable, else []"],
  "import_restrictions": "specific restriction description or null",
  "confidence": "high/medium/low"
}`;

      content.push({ type: "text", text: promptText });
      messages.push({ role: "user", content });

      const msg = await client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages,
        },
        { signal: AbortSignal.timeout(MODEL_DEADLINE_MS), maxRetries: 1 },
      );

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

    // ── Paso 2: Valor CIF ──
    const fob_total = fob_unit * quantity;
    const insurance = fob_total * 0.005;
    const cif = fob_total + freight_total + insurance;

    // ── Paso 3: Resolución de la tasa arancelaria (Bloque 2) ──
    const code = hs_code || productInfo.ncm_code || productInfo.hs_code || productInfo.taric_code || "";
    const resolved = await resolveTariff({
      importCountry: destination,
      originCountry: supplier_country,
      code,
      system: tariff_system,
    }).catch(() => null);
    const general = resolved?.general
      ?? notDetermined(destination, "No se pudo resolver la tasa arancelaria para esta operación.");

    const productOut = {
      product_name: productInfo.product_name,
      description: productInfo.description,
      hs_code: productInfo.hs_code || "",
      ncm_code: productInfo.ncm_code || "",
      taric_code: productInfo.taric_code || "",
      chapter: productInfo.chapter ?? null,
      requires_permits: productInfo.requires_permits || [],
      import_restrictions: productInfo.import_restrictions ?? null,
      tariff_system,
      tariff: general,
    };
    const commercial = { fob_unit, fob_total, freight_total, insurance, cif, quantity, supplier_country, destination };

    // D4 — sin tasa determinable, NO se calcula un total dependiente del arancel.
    if (general.status === "not_determined") {
      return NextResponse.json({
        product: productOut,
        commercial,
        tariff_not_determined: true,
        subtotal_known: {
          label: es ? "Valor CIF conocido (sin arancel ni tributos)" : "Known CIF value (excl. duty and taxes)",
          value: cif,
        },
        message: es
          ? "No pudimos determinar el arancel con suficiente precisión para completar esta estimación."
          : "We couldn't determine the tariff precisely enough to complete this estimate.",
        taxes: null,
        analysis: null,
      });
    }

    // Tasa referencial → se calcula, marcado como referencial.
    const taxes = calculateTaxes({ cif, tariff_rate: general.value as number, destination });
    const landed_unit = taxes.landed_cost / quantity;

    return NextResponse.json({
      product: productOut,
      commercial,
      result_basis: general.status, // "referential" (o "determined" a futuro)
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
    return aiErrorResponse(err, {
      lang,
      userId,
      fallback: lang === "en"
        ? "Could not complete the viability analysis. Please try again."
        : "No se pudo completar el análisis de viabilidad. Intentá de nuevo.",
    });
  }
}
