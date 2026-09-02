// ─────────────────────────────────────────────────────────────
// GTH — Contexto de la operación que viaja entre módulos por la URL.
// Cada módulo funciona de forma independiente; cuando el usuario salta
// de uno a otro, estos datos se arrastran para no volver a cargarlos.
// ─────────────────────────────────────────────────────────────

export interface OpContext {
  origin?: string;
  destination?: string;
  tariff_code?: string;
  system?: string;      // "HS" | "NCM" | "TARIC"
  base_rate?: string;   // tasa general, número como texto (ej "14" o "14%")
  pref_rate?: string;   // tasa preferencial con acuerdo/certificado
  fob_value?: string;
  quantity?: string;
  // Bloque 2 — procedencia mínima. El receptor NUNCA reconstruye una tasa
  // como "determinada" desde la URL: a lo sumo es "referencial".
  base_rate_status?: string;  // "referential" | "not_determined"
  pref_rate_status?: string;  // "referential" | "not_determined"
}

/** Construye "?a=1&b=2" a partir del contexto, omitiendo vacíos. */
export function buildOpQuery(ctx: OpContext): string {
  const p = new URLSearchParams();
  (Object.keys(ctx) as (keyof OpContext)[]).forEach((k) => {
    const v = ctx[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      p.set(k, String(v).replace(/%\s*$/, "").trim());
    }
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Lee el contexto desde los searchParams. */
export function readOpContext(sp: URLSearchParams | { get(k: string): string | null }): OpContext {
  const g = (k: string) => sp.get(k) ?? undefined;
  return {
    origin: g("origin"),
    destination: g("destination"),
    tariff_code: g("tariff_code"),
    system: g("system"),
    base_rate: g("base_rate"),
    pref_rate: g("pref_rate"),
    fob_value: g("fob_value"),
    quantity: g("quantity"),
    base_rate_status: g("base_rate_status"),
    pref_rate_status: g("pref_rate_status"),
  };
}
