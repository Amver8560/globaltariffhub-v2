import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredit } from "@/lib/credits";
import { aiErrorResponse, MODEL_DEADLINE_MS } from "@/lib/aiError";
import { resolveTariff } from "@/lib/tariffResolver";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sos un experto en certificados de origen y acuerdos comerciales internacionales.
El usuario te pasa una operación comercial y vos calculás el ahorro real con y sin certificado de origen.

Devolvés ÚNICAMENTE un JSON con este formato exacto, sin texto adicional:

{
  "agreement": {
    "name": "MERCOSUR",
    "type": "Regional",
    "parties": ["Argentina", "Brasil", "Uruguay", "Paraguay"],
    "active": true,
    "description": "Mercado Común del Sur — libre circulación de bienes entre países miembros"
  },
  "tariff_without": {
    "rate": "14%",
    "amount": 1400.00,
    "description": "Arancel general sin acuerdo preferencial"
  },
  "tariff_with": {
    "rate": "0%",
    "amount": 0.00,
    "description": "Arancel preferencial MERCOSUR"
  },
  "certificate_cost": {
    "amount": 85.00,
    "currency": "USD",
    "issuer": "Cámara de Comercio",
    "processing_days": 3,
    "validity_days": 180
  },
  "savings": {
    "gross": 1400.00,
    "net": 1315.00,
    "roi_percent": 1547,
    "recommendation": "Altamente recomendable tramitar el certificado"
  },
  "requirements": {
    "origin_rule": "Transformación sustancial o contenido regional mínimo 60%",
    "documents": [
      { "name": "Factura comercial", "mandatory": true, "notes": "Original + 3 copias" },
      { "name": "Declaración jurada del exportador", "mandatory": true, "notes": "Ante escribano público" },
      { "name": "Certificado de origen MERCOSUR (Formulario A)", "mandatory": true, "notes": "Emitido por la Cámara de Comercio habilitada" },
      { "name": "Packing list", "mandatory": true, "notes": "" },
      { "name": "Análisis de composición del producto", "mandatory": false, "notes": "Solo para productos con componentes importados" }
    ],
    "issuing_entity": "Cámara de Comercio Argentina o Ministerio de Relaciones Exteriores",
    "where_to_get": "https://www.cancilleria.gob.ar/es/comercio-internacional/certificados-de-origen"
  },
  "disclaimer": "Este es un análisis de referencia. El certificado de origen real debe tramitarse ante el organismo habilitado en el país exportador. Los valores arancelarios pueden variar."
}

Calculá los montos en base al valor FOB y la cantidad proporcionados.

FÓRMULAS OBLIGATORIAS — usá siempre estas:
- tariff_without.amount = fob_value × (tasa_general / 100)
- tariff_with.amount = fob_value × (tasa_preferencial / 100)
- savings.gross = tariff_without.amount − tariff_with.amount
- savings.net = savings.gross − certificate_cost.amount
- savings.roi_percent = Math.round((savings.net / certificate_cost.amount) × 100)
  → Ejemplo: net=1315, cert_cost=85 → ROI = (1315/85)×100 = 1547%
  → Si savings.net es negativo, el ROI es negativo y la recomendación debe desaconsejar el certificado.

Solo respondés con el JSON, sin texto adicional, sin markdown.`;

export async function POST(req: NextRequest) {
  const credit = await checkAndConsumeCredit();
  if (!credit.ok) return credit.error!;

  const { origin, destination, hs_code, fob_value, quantity, unit, agreement, lang } = await req.json();

  if (!origin || !destination || !fob_value) {
    return NextResponse.json({ error: "Faltan datos de la operación" }, { status: 400 });
  }

  try {
    const prompt = `Calculá el análisis de preferencia arancelaria por origen para esta operación:
- Origen: ${origin}
- Destino: ${destination}
- Código HS: ${hs_code || "No especificado"}
- Valor FOB: USD ${fob_value}
- Cantidad: ${quantity} ${unit}
- Acuerdo a simular: ${agreement || "el más conveniente disponible"}
- Idioma de respuesta: ${lang === "en" ? "inglés" : "español"}`;

    // Modelo (contexto del certificado) + resolvedor de tasa (Bloque 2), en paralelo.
    const [response, resolved] = await Promise.all([
      client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: AbortSignal.timeout(MODEL_DEADLINE_MS), maxRetries: 1 },
      ),
      resolveTariff({ importCountry: destination, originCountry: origin, code: hs_code || "", system: "HS" }).catch(() => null),
    ]);

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);

    const general = resolved?.general ?? null;
    const preferential = resolved?.preferential ?? null;
    parsed.tariff = { general, preferential };
    parsed.jurisdiction = resolved?.jurisdiction ?? null;

    // Regla 11 — no propagar una tasa inventada. Las cifras del modelo se descartan;
    // el comparativo sólo se muestra si el resolvedor entregó una tasa.
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const fob = Number(fob_value) || 0;

    if (!general || general.status === "not_determined" || general.value === null) {
      parsed.tariff_not_determined = true;
      parsed.tariff_without = null;
      parsed.tariff_with = null;
      parsed.savings = null;
      parsed.message = lang === "en"
        ? "We couldn't determine the tariff precisely enough to compare the certificate scenario."
        : "No pudimos determinar el arancel con suficiente precisión para comparar el escenario con certificado.";
    } else {
      const genRate = general.value;
      parsed.tariff_without = {
        rate: `${genRate}%`,
        amount: r2((fob * genRate) / 100),
        description: parsed.tariff_without?.description ?? "Arancel general",
      };
      if (preferential && preferential.value !== null) {
        const prefRate = preferential.value;
        parsed.tariff_with = {
          rate: `${prefRate}%`,
          amount: r2((fob * prefRate) / 100),
          description: parsed.tariff_with?.description ?? "Arancel preferencial",
        };
        const cc = parsed.certificate_cost?.amount;
        const gross = r2(parsed.tariff_without.amount - parsed.tariff_with.amount);
        parsed.savings = parsed.savings || {};
        parsed.savings.gross = gross;
        if (typeof cc === "number") {
          parsed.savings.net = r2(gross - cc);
          parsed.savings.roi_percent = cc > 0 ? Math.round((parsed.savings.net / cc) * 100) : null;
        }
      } else {
        // Sin tasa preferencial de fuente: no se arma un comparativo con número inventado.
        parsed.tariff_with = null;
        parsed.savings = null;
      }
      parsed.tariff_basis = general.status; // "referential"

      // Corrección B — con base referencial no se propagan afirmaciones categóricas
      // de la IA (aplicabilidad del AEC, necesidad del certificado, beneficio
      // definitivo). El comparativo se entrega como estimación referencial,
      // sujeta al régimen de origen del acuerdo y a validación oficial.
      if (general.status === "referential") {
        const es = lang !== "en";
        if (parsed.tariff_without) {
          parsed.tariff_without.description = es
            ? "Arancel general de referencia (promedio a nivel HS6). No es la línea nacional definitiva."
            : "Referential general tariff (HS6-level average). Not the definitive national line.";
        }
        if (parsed.tariff_with) {
          parsed.tariff_with.description = es
            ? "Arancel preferencial de referencia (nivel HS6). Su aplicación depende de que la mercadería califique según el régimen de origen del acuerdo."
            : "Referential preferential tariff (HS6 level). Its application depends on the goods qualifying under the agreement's rules of origin.";
        }
        if (parsed.savings) {
          parsed.savings.basis = "referential";
          parsed.savings.recommendation = es
            ? "Estimación referencial del ahorro. No es un resultado definitivo: las tasas son a nivel HS6 y el beneficio preferencial está sujeto a las reglas de origen del acuerdo y a validación en la fuente oficial."
            : "Referential savings estimate. Not a definitive result: rates are at HS6 level and the preferential benefit is subject to the agreement's rules of origin and to validation with the official source.";
        }
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return aiErrorResponse(error, {
      lang,
      userId: credit.userId,
      fallback: lang === "en" ? "Analysis error. Please try again." : "Error en el análisis. Intentá de nuevo.",
    });
  }
}
