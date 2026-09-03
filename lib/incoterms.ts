// ─────────────────────────────────────────────────────────────
// GTH — Bloque 3 · Incoterms (modelo reducido)
//
// El Incoterm sirve para decidir QUÉ necesita preguntar GTH para
// construir la base estimada para el arancel — no para reconstruir la
// distribución económica completa de la compraventa.
//
//   precio comercial cotizado + Incoterm
//     → qué componentes de base ya están incluidos (no se re-suman)
//     → qué componentes de base faltan conocer (se piden)
//     → base conocida / estimada
//     → TariffDatum → estimación dentro del alcance de GTH
//
// Set cerrado (D1): EXW · FCA · FOB · CFR · CIF.
// DAP / DDP / CPT / CIP NO se calculan ni se aproximan a otro Incoterm.
// ─────────────────────────────────────────────────────────────

export type Incoterm = "EXW" | "FCA" | "FOB" | "CFR" | "CIF";

export const SUPPORTED_INCOTERMS: readonly Incoterm[] = [
  "EXW",
  "FCA",
  "FOB",
  "CFR",
  "CIF",
] as const;

export function isSupportedIncoterm(v: unknown): v is Incoterm {
  return typeof v === "string" && (SUPPORTED_INCOTERMS as readonly string[]).includes(v);
}

// Componentes de BASE que GTH puede necesitar preguntar.
export type BaseComponent = "pre_shipment" | "international_freight" | "insurance";

export const BASE_COMPONENT_LABEL_ES: Record<BaseComponent, string> = {
  // Rótulo simple para usuarios sin experiencia en comercio exterior.
  pre_shipment: "costos previos al transporte internacional",
  international_freight: "flete internacional",
  insurance: "seguro internacional",
};

// Qué componentes de base pide GTH según el Incoterm (nada más).
// El orden importa: el seguro % se calcula sobre el acumulado previo.
export const ASK_FOR_BASE: Record<Incoterm, BaseComponent[]> = {
  EXW: ["pre_shipment", "international_freight", "insurance"],
  FCA: ["pre_shipment", "international_freight", "insurance"],
  FOB: ["international_freight", "insurance"],
  CFR: ["insurance"],
  CIF: [],
};

// Componentes de base contextuales: se piden pero no bloquean si faltan
// (para FCA el pre-embarque depende del lugar convenido de entrega).
export const CONTEXTUAL_BASE: Record<Incoterm, BaseComponent[]> = {
  EXW: [],
  FCA: ["pre_shipment"],
  FOB: [],
  CFR: [],
  CIF: [],
};

// Qué ya cubre el precio declarado — sólo para mostrar "no se vuelve a sumar".
export const ALREADY_IN_PRICE: Record<Incoterm, string[]> = {
  EXW: [],
  FCA: ["Despacho de exportación"],
  FOB: ["Despacho de exportación", "Gastos de origen hasta la carga a bordo"],
  CFR: ["Despacho de exportación", "Gastos de origen", "Flete internacional"],
  CIF: [
    "Despacho de exportación",
    "Gastos de origen",
    "Flete internacional",
    "Seguro internacional",
  ],
};

export interface IncotermMeta {
  code: Incoterm;
  name_es: string;
  name_en: string;
  /** Ámbito de transporte al que corresponde el término. */
  transport_scope: "any" | "sea_inland";
  /** Nota visible cuando el término es sólo marítimo/fluvial (D2). Vacío si no aplica. */
  scope_note_es: string;
  scope_note_en: string;
  seller_es: string;
  buyer_es: string;
}

const SEA_NOTE_ES = "Corresponde a transporte marítimo o fluvial.";
const SEA_NOTE_EN = "Applies to sea or inland waterway transport.";

export const INCOTERM_META: Record<Incoterm, IncotermMeta> = {
  EXW: {
    code: "EXW",
    name_es: "En Fábrica",
    name_en: "Ex Works",
    transport_scope: "any",
    scope_note_es: "",
    scope_note_en: "",
    seller_es:
      "Pone la mercadería a disposición en su local; no la carga ni la despacha para exportación.",
    buyer_es:
      "Asume todo desde el local del vendedor: pre-embarque, transporte internacional y seguro.",
  },
  FCA: {
    code: "FCA",
    name_es: "Franco Transportista",
    name_en: "Free Carrier",
    transport_scope: "any",
    scope_note_es: "",
    scope_note_en: "",
    seller_es:
      "Entrega la mercadería despachada para exportación al transportista designado por el comprador, en el lugar convenido.",
    buyer_es:
      "Asume el flete internacional y el seguro; según el lugar convenido, también costos de origen a su cargo.",
  },
  FOB: {
    code: "FOB",
    name_es: "Franco a Bordo",
    name_en: "Free On Board",
    transport_scope: "sea_inland",
    scope_note_es: SEA_NOTE_ES,
    scope_note_en: SEA_NOTE_EN,
    seller_es:
      "Entrega la mercadería cargada a bordo del buque en el puerto de embarque; incluye despacho de exportación y gastos portuarios de origen.",
    buyer_es: "Asume el flete internacional y el seguro.",
  },
  CFR: {
    code: "CFR",
    name_es: "Costo y Flete",
    name_en: "Cost and Freight",
    transport_scope: "sea_inland",
    scope_note_es: SEA_NOTE_ES,
    scope_note_en: SEA_NOTE_EN,
    seller_es: "Como FOB y además paga el flete internacional hasta el puerto de destino.",
    buyer_es: "Asume el seguro internacional.",
  },
  CIF: {
    code: "CIF",
    name_es: "Costo, Seguro y Flete",
    name_en: "Cost, Insurance and Freight",
    transport_scope: "sea_inland",
    scope_note_es: SEA_NOTE_ES,
    scope_note_en: SEA_NOTE_EN,
    seller_es:
      "Como CFR y además contrata el seguro internacional hasta el puerto de destino.",
    buyer_es: "Asume los costos a partir de la llegada al puerto de destino.",
  },
};
