// ─────────────────────────────────────────────────────────────
// GTH — Verificación de acuerdos comerciales vigentes
// Uso: getTradeAgreement("Argentina", "Brasil") -> { name, scope }
//      getTradeAgreement("Argentina", "China")  -> null
//
// Determinístico y orientativo. Cubre los países del selector de
// los módulos. La existencia de un acuerdo NO garantiza tasa 0%
// para todos los productos — por eso el módulo sigue mostrando el
// comparativo con/sin certificado sólo cuando hay acuerdo.
// ─────────────────────────────────────────────────────────────

export interface TradeAgreement {
  /** Nombre corto del acuerdo, listo para mostrar. */
  name: string;
  /** Descripción breve del alcance. */
  scope: string;
}

const norm = (c: string) => c.trim().toLowerCase();

// Bloques
const MERCOSUR = ["argentina", "brasil", "uruguay", "paraguay", "bolivia"];
const CAN = ["bolivia", "colombia", "ecuador", "perú"];
const EU = ["españa", "alemania", "francia", "italia"];
const ALADI = [
  "argentina", "bolivia", "brasil", "chile", "colombia", "ecuador",
  "méxico", "paraguay", "perú", "uruguay", "venezuela",
];

// Pares bilaterales con TLC / acuerdo de libre comercio vigente.
// Clave: pareja ordenada alfabéticamente unida por "|".
const BILATERAL: Record<string, TradeAgreement> = {};

const addBilateral = (a: string, b: string, ag: TradeAgreement) => {
  const key = [norm(a), norm(b)].sort().join("|");
  BILATERAL[key] = ag;
};

// T-MEC / USMCA
const TMEC: TradeAgreement = { name: "T-MEC (USMCA)", scope: "Tratado entre México, Estados Unidos y Canadá" };
addBilateral("México", "Estados Unidos", TMEC);
addBilateral("México", "Canadá", TMEC);
addBilateral("Estados Unidos", "Canadá", TMEC);

// TLCs de Chile
const chileFTA: TradeAgreement = { name: "TLC de Chile", scope: "Tratado de libre comercio bilateral vigente" };
["China", "Japón", "Corea del Sur", "India", "Australia", "Canadá", "Estados Unidos", "México"].forEach((p) =>
  addBilateral("Chile", p, chileFTA)
);
EU.forEach((p) => addBilateral("Chile", p, { name: "Acuerdo de Asociación Chile–UE", scope: "Acuerdo de asociación económica con la Unión Europea" }));

// TLCs de México
const mexFTA: TradeAgreement = { name: "TLC de México", scope: "Tratado de libre comercio bilateral vigente" };
["Japón"].forEach((p) => addBilateral("México", p, mexFTA));
EU.forEach((p) => addBilateral("México", p, { name: "Acuerdo Global México–UE", scope: "Tratado de libre comercio con la Unión Europea" }));

// TLCs de Perú
const peruFTA: TradeAgreement = { name: "TLC de Perú", scope: "Tratado de libre comercio bilateral vigente" };
["China", "Corea del Sur", "Japón", "Estados Unidos", "Canadá", "Australia"].forEach((p) =>
  addBilateral("Perú", p, peruFTA)
);
EU.forEach((p) => addBilateral("Perú", p, { name: "Acuerdo Comercial Perú–UE", scope: "Acuerdo comercial multipartes con la Unión Europea" }));

// TLCs de Colombia
const colFTA: TradeAgreement = { name: "TLC de Colombia", scope: "Tratado de libre comercio bilateral vigente" };
["Estados Unidos", "Canadá", "Corea del Sur"].forEach((p) => addBilateral("Colombia", p, colFTA));
EU.forEach((p) => addBilateral("Colombia", p, { name: "Acuerdo Comercial Colombia–UE", scope: "Acuerdo comercial multipartes con la Unión Europea" }));

// UE – Reino Unido
EU.forEach((p) =>
  addBilateral(p, "Reino Unido", { name: "Acuerdo de Comercio y Cooperación UE–Reino Unido", scope: "Acuerdo post-Brexit entre la UE y el Reino Unido" })
);

/**
 * Devuelve el acuerdo comercial vigente entre dos países, o null si no existe.
 */
export function getTradeAgreement(origin: string, destination: string): TradeAgreement | null {
  if (!origin || !destination) return null;
  const o = norm(origin);
  const d = norm(destination);
  if (o === d) return null;

  // MERCOSUR
  if (MERCOSUR.includes(o) && MERCOSUR.includes(d)) {
    return { name: "MERCOSUR", scope: "Mercado Común del Sur — libre circulación de bienes entre socios" };
  }

  // Comunidad Andina
  if (CAN.includes(o) && CAN.includes(d)) {
    return { name: "Comunidad Andina (CAN)", scope: "Zona de libre comercio andina" };
  }

  // Mercado Único de la UE
  if (EU.includes(o) && EU.includes(d)) {
    return { name: "Mercado Único de la UE", scope: "Libre circulación de mercancías dentro de la Unión Europea" };
  }

  // Bilaterales / acuerdos con terceros
  const key = [o, d].sort().join("|");
  if (BILATERAL[key]) return BILATERAL[key];

  // ALADI — acuerdo de alcance parcial entre miembros latinoamericanos
  // (cubre pares como Argentina–México, Brasil–Chile, Uruguay–Colombia, etc.)
  if (ALADI.includes(o) && ALADI.includes(d)) {
    return {
      name: "ALADI — acuerdo de alcance parcial",
      scope: "Preferencias arancelarias parciales dentro de la Asociación Latinoamericana de Integración",
    };
  }

  return null;
}

/** Helper booleano. */
export function hasTradeAgreement(origin: string, destination: string): boolean {
  return getTradeAgreement(origin, destination) !== null;
}
