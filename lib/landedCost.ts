// ─────────────────────────────────────────────────────────────
// GTH — Bloque 3 · computeLandedCost() — motor canónico único (M3 y M4)
//
//   precio comercial cotizado + Incoterm
//     → qué componentes de base ya están incluidos (no se re-suman)
//     → qué componentes de base faltan conocer (se piden, NO se inventan)
//     → base conocida / estimada para el arancel
//     → TariffDatum → estimación dentro del alcance de GTH
//     → (aparte, opcional) otros costos de la operación que el usuario informe
//
// Principio de producto (ATLAS): permitir avanzar con lo disponible y
// mostrar claramente qué falta, en vez de bloquear la exploración.
//   - Un componente económico faltante NO impide mostrar el subtotal conocido.
//   - Se bloquea sólo cuando es imposible producir información útil y honesta
//     (precio inválido, Incoterm no soportado) o cuando el arancel es
//     not_determined (se muestra igual la base conocida, sin arancel).
//
// Tres estados por componente:
//   informed → el usuario informó un monto (se usa)
//   zero     → el usuario declaró expresamente 0 (se cuenta como 0, NO falta)
//   missing  → falta el dato: GTH NO lo inventa, NO asume 0, NO aplica %
//
// Sin fiscalidad interna. Sin tasas genéricas. Sin defaults. El arancel
// proviene EXCLUSIVAMENTE del TariffDatum del Bloque 2.
// ─────────────────────────────────────────────────────────────
import {
  type Incoterm,
  type BaseComponent,
  ASK_FOR_BASE,
  CONTEXTUAL_BASE,
  ALREADY_IN_PRICE,
  BASE_COMPONENT_LABEL_ES,
  INCOTERM_META,
  isSupportedIncoterm,
} from "@/lib/incoterms";

export type MoneyInput =
  | { state: "informed"; value: number }
  | { state: "zero" }
  | { state: "missing" };

export type InsuranceInput =
  | { state: "informed"; kind: "amount" | "percent"; value: number }
  | { state: "zero" }
  | { state: "missing" };

export interface OtherCost {
  label: string;
  amount: MoneyInput;
}

export interface CostInput {
  declared_value: number; // precio comercial cotizado (en una sola moneda)
  incoterm: Incoterm;
  // Componentes de BASE — sólo se leen los que ASK_FOR_BASE[incoterm] pide.
  pre_shipment?: MoneyInput;
  international_freight?: MoneyInput;
  insurance?: InsuranceInput;
  // Otros costos de la operación — NO entran a la base. Se muestran aparte,
  // sólo los que el usuario informe.
  other_costs?: OtherCost[];
  // Arancel — EXCLUSIVAMENTE del TariffDatum de Bloque 2.
  duty: { status: "referential" | "not_determined"; rate: number | null };
  quantity?: MoneyInput;
}

export interface LineItem {
  key: string;
  label_es: string;
  amount: number;
}

export type ResultCompleteness = "complete" | "partial" | "not_computable";

export interface CostResult {
  incoterm: Incoterm;
  scope_note_es: string;
  scope_note_en: string;

  /** Componentes que el Incoterm ya pone dentro del precio declarado (no se re-suman). */
  already_in_price: string[];

  /** Componentes de base que el usuario informó y se sumaron a la base. */
  added_to_base: LineItem[];

  /** Precio declarado + Σ(componentes de base informados). Siempre calculable si el precio es válido. */
  base_known: number;

  /** Componentes de base que el Incoterm pide y NO fueron informados (missing). */
  missing_base_components: string[];

  /** true si no falta ningún componente de base NO contextual. */
  base_complete: boolean;

  duty: {
    rate: number | null;
    amount: number | null; // calculado sobre base_known; null si el arancel es not_determined
    basis: "referential" | "not_determined";
  };

  /** base_known + duty.amount. Presente en "complete" y "partial"; null si not_computable. */
  operation_estimate: number | null;

  /** Otros costos de la operación informados por el usuario (aparte de la estimación). */
  other_costs_declared: LineItem[];

  /** operation_estimate + Σ(other_costs_declared). Suma explícita de dos partes. null si no hay estimación. */
  total_with_other_costs: number | null;

  per_unit: number | null;

  basis: "referential" | "not_determined";
  completeness: ResultCompleteness;

  /** Texto para la UI según completeness. */
  note_es: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function moneyToNumber(mi: MoneyInput | undefined): { known: true; value: number } | { known: false } {
  if (!mi || mi.state === "missing") return { known: false };
  if (mi.state === "zero") return { known: true, value: 0 };
  return { known: true, value: Math.max(0, Number.isFinite(mi.value) ? mi.value : 0) };
}

export function computeLandedCost(input: CostInput): CostResult {
  if (!isSupportedIncoterm(input.incoterm)) {
    throw new Error(`Incoterm no soportado: ${String(input.incoterm)}`);
  }
  const meta = INCOTERM_META[input.incoterm];
  const declared =
    Number.isFinite(input.declared_value) && input.declared_value > 0 ? input.declared_value : 0;

  const asked = ASK_FOR_BASE[input.incoterm];
  const contextual = new Set<BaseComponent>(CONTEXTUAL_BASE[input.incoterm]);

  const added_to_base: LineItem[] = [];
  const missing_base_components: string[] = [];
  let blockingMissing = false;

  let runningBase = declared;

  for (const comp of asked) {
    if (comp === "insurance") {
      const ins = input.insurance;
      if (!ins || ins.state === "missing") {
        missing_base_components.push(BASE_COMPONENT_LABEL_ES.insurance);
        if (!contextual.has("insurance")) blockingMissing = true;
        continue;
      }
      if (ins.state === "zero") continue;
      const amt =
        ins.kind === "percent"
          ? r2((runningBase * Math.max(0, ins.value)) / 100)
          : r2(Math.max(0, ins.value));
      if (amt > 0) {
        added_to_base.push({ key: "insurance", label_es: BASE_COMPONENT_LABEL_ES.insurance, amount: amt });
        runningBase = r2(runningBase + amt);
      }
      continue;
    }

    const mi = comp === "pre_shipment" ? input.pre_shipment : input.international_freight;
    const n = moneyToNumber(mi);
    if (!n.known) {
      missing_base_components.push(BASE_COMPONENT_LABEL_ES[comp]);
      if (!contextual.has(comp)) blockingMissing = true;
      continue;
    }
    if (n.value > 0) {
      added_to_base.push({ key: comp, label_es: BASE_COMPONENT_LABEL_ES[comp], amount: r2(n.value) });
      runningBase = r2(runningBase + n.value);
    }
  }

  const base_known = r2(runningBase);
  const base_complete = !blockingMissing;

  // ── Arancel — sólo del TariffDatum. Se calcula sobre base_known. ──
  const dutyDetermined = input.duty.status === "referential" && typeof input.duty.rate === "number";
  const duty_amount = dutyDetermined ? r2((base_known * (input.duty.rate as number)) / 100) : null;

  // ── Otros costos de la operación (aparte de la base y del arancel) ──
  const other_costs_declared: LineItem[] = [];
  for (const oc of input.other_costs ?? []) {
    const n = moneyToNumber(oc.amount);
    if (n.known && n.value > 0) {
      other_costs_declared.push({
        key: `other:${oc.label}`,
        label_es: oc.label,
        amount: r2(n.value),
      });
    }
  }

  // ── Estimación de la operación (alcance GTH = base + arancel) ──
  let operation_estimate: number | null = null;
  let total_with_other_costs: number | null = null;
  let completeness: ResultCompleteness;
  let note_es: string;

  if (declared === 0) {
    completeness = "not_computable";
    note_es = "Ingresá el precio comercial cotizado para ver la estimación.";
  } else if (!dutyDetermined) {
    completeness = "not_computable";
    note_es =
      "No se puede estimar el arancel: no está determinado para esta posición y jurisdicción. Se muestra la base conocida hasta el momento.";
  } else {
    operation_estimate = r2(base_known + (duty_amount as number));
    const sumOther = other_costs_declared.reduce((s, l) => s + l.amount, 0);
    total_with_other_costs = other_costs_declared.length ? r2(operation_estimate + sumOther) : null;

    if (base_complete) {
      completeness = "complete";
      note_es = "";
    } else {
      completeness = "partial";
      note_es =
        "Estimación provisional. No se informó: " +
        missing_base_components.join(", ") +
        ". El monto puede variar al incorporarlo(s). No se asume ningún valor.";
    }
  }

  // ── Por unidad ──
  let per_unit: number | null = null;
  const q = moneyToNumber(input.quantity);
  if (operation_estimate !== null && q.known && q.value > 0) {
    per_unit = r2(operation_estimate / q.value);
  }

  return {
    incoterm: input.incoterm,
    scope_note_es: meta.scope_note_es,
    scope_note_en: meta.scope_note_en,
    already_in_price: [...ALREADY_IN_PRICE[input.incoterm]],
    added_to_base,
    base_known,
    missing_base_components,
    base_complete,
    duty: {
      rate: input.duty.status === "referential" ? input.duty.rate : null,
      amount: duty_amount,
      basis: input.duty.status,
    },
    operation_estimate,
    other_costs_declared,
    total_with_other_costs,
    per_unit,
    basis: input.duty.status,
    completeness,
    note_es,
  };
}

/** Mapea el string de un input de formulario a MoneyInput (tres estados). */
export function toMoney(raw: string | number | null | undefined): MoneyInput {
  if (raw === null || raw === undefined) return { state: "missing" };
  const s = String(raw).trim();
  if (s === "") return { state: "missing" };
  const n = Number(s.replace(",", "."));
  if (!Number.isFinite(n)) return { state: "missing" };
  if (n === 0) return { state: "zero" };
  return { state: "informed", value: n };
}

/** Mapea kind+value de seguro a InsuranceInput (tres estados). */
export function toInsurance(
  kind: "amount" | "percent" | string | null | undefined,
  raw: string | number | null | undefined,
): InsuranceInput {
  const m = toMoney(raw);
  if (m.state === "missing") return { state: "missing" };
  if (m.state === "zero") return { state: "zero" };
  const k = kind === "percent" ? "percent" : "amount";
  return { state: "informed", kind: k, value: m.value };
}
