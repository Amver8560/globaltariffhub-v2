// ─────────────────────────────────────────────────────────────
// GTH — Bloque 2 · Resolución de jurisdicción
//
// A partir del PAÍS IMPORTADOR resuelve qué régimen de nomenclatura
// aplica (por pertenencia a un bloque/unión aduanera, modelada como
// dato con procedencia) y qué fuentes de tasa consultar, en qué
// prioridad. No hay listas arbitrarias de "países soportados": la
// región resuelve la nomenclatura; las fuentes actuales determinan
// qué puede sostenerse.
//
// Si el país no pertenece a un bloque con nomenclatura regional
// integrada → regime "unknown": sólo WTO/WITS HS6, siempre referencial.
// ─────────────────────────────────────────────────────────────

interface Bloc {
  id: string;
  nomenclature: "NCM" | "TARIC";
  level: "national-8" | "national-10";
  /** Países del selector de los módulos que pertenecen al bloque. */
  members: string[];
  /** Procedencia de la membresía — para trazabilidad, no es intuición. */
  membership_source: string;
  as_of: string;
}

const BLOCS: Bloc[] = [
  {
    id: "MERCOSUR",
    nomenclature: "NCM",
    level: "national-8",
    members: ["Argentina", "Brasil", "Uruguay", "Paraguay"],
    membership_source: "MERCOSUR — miembros plenos con Nomenclatura Común (NCM) y Arancel Externo Común. Venezuela suspendida; Bolivia en proceso de adhesión.",
    as_of: "2026-09",
  },
  {
    id: "EU_CUSTOMS_UNION",
    nomenclature: "TARIC",
    level: "national-10",
    // De los países del selector, sólo estos integran la unión aduanera de la UE.
    // Reino Unido quedó fuera post-Brexit.
    members: ["España", "Alemania", "Francia", "Italia"],
    membership_source: "Unión Aduanera de la UE — Arancel Integrado (TARIC) común a los Estados miembros.",
    as_of: "2026-09",
  },
];

export type TariffSourceId =
  | "TARIC_TABLE"
  | "TARIC_SCRAPE"
  | "NCM_NOMENCLATURE"
  | "WTO_HS6"
  | "WITS_HS6";

export interface TariffSourceSlot {
  id: TariffSourceId;
  /** Mayor = se prefiere. La selección es determinística por prioridad, no por orden de llegada. */
  priority: number;
  expected_level: "national-8" | "national-10" | "HS6";
  expected_scope: "national" | "multilateral";
  /** false para NCM_NOMENCLATURE: aporta nomenclatura/vigencia, no una tasa. */
  provides_rate: boolean;
}

export interface JurisdictionPlan {
  import_country: string;
  regime: "NCM" | "TARIC" | "unknown";
  bloc_id?: string;
  membership_source?: string;
  membership_as_of?: string;
  tariff_sources: TariffSourceSlot[];
}

const WTO_WITS: TariffSourceSlot[] = [
  { id: "WTO_HS6",  priority: 20, expected_level: "HS6", expected_scope: "multilateral", provides_rate: true },
  { id: "WITS_HS6", priority: 10, expected_level: "HS6", expected_scope: "multilateral", provides_rate: true },
];

export function resolveJurisdiction(importCountry: string): JurisdictionPlan {
  const bloc = BLOCS.find((b) => b.members.includes(importCountry));

  if (bloc?.nomenclature === "TARIC") {
    return {
      import_country: importCountry,
      regime: "TARIC",
      bloc_id: bloc.id,
      membership_source: bloc.membership_source,
      membership_as_of: bloc.as_of,
      tariff_sources: [
        { id: "TARIC_TABLE",  priority: 90, expected_level: "national-10", expected_scope: "national", provides_rate: true },
        { id: "TARIC_SCRAPE", priority: 40, expected_level: "national-10", expected_scope: "national", provides_rate: true },
        ...WTO_WITS,
      ],
    };
  }

  if (bloc?.nomenclature === "NCM") {
    return {
      import_country: importCountry,
      regime: "NCM",
      bloc_id: bloc.id,
      membership_source: bloc.membership_source,
      membership_as_of: bloc.as_of,
      tariff_sources: [
        // NCM da nomenclatura + vigencia, NO una tasa (BrasilAPI no publica el arancel).
        { id: "NCM_NOMENCLATURE", priority: 80, expected_level: "national-8", expected_scope: "national", provides_rate: false },
        ...WTO_WITS,
      ],
    };
  }

  return {
    import_country: importCountry,
    regime: "unknown",
    tariff_sources: [...WTO_WITS],
  };
}

/** Lista pública de jurisdicciones con régimen de nomenclatura regional integrado (para UI / diagnóstico). */
export function coveredRegimes(): { bloc: string; nomenclature: string; members: string[] }[] {
  return BLOCS.map((b) => ({ bloc: b.id, nomenclature: b.nomenclature, members: [...b.members] }));
}
