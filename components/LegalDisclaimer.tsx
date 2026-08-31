"use client";

// ─────────────────────────────────────────────────────────────
// GTH — Componente de aviso legal
// Uso: <LegalDisclaimer lang="es" context="search" />
// Contextos: "search" | "certificate" | "cif" | "viability" | "general"
// ─────────────────────────────────────────────────────────────

interface LegalDisclaimerProps {
  lang?: "es" | "en";
  context?: "search" | "certificate" | "cif" | "viability" | "general";
  wtoSource?: boolean;   // true si la tasa viene de WTO API (dato oficial)
  ncmSource?: boolean;   // true si NCM viene de Siscomex
  taricSource?: boolean; // true si TARIC viene de Access2Markets EU
  compact?: boolean;     // true para versión corta (footer)
}

const texts = {
  es: {
    title: "Aviso legal importante",
    general: "Los datos mostrados son de referencia y no constituyen asesoramiento aduanero profesional. Las tasas arancelarias, requisitos de licencias y documentación pueden cambiar sin previo aviso. Siempre verificar con la fuente oficial y un despachante de aduana habilitado antes de operar.",
    argentina_warning: "⚠️ Argentina modifica frecuentemente su sistema de importaciones (SIRA → SEDI). Verificar el estado vigente en argentina.gob.ar antes de cada operación.",
    hs_notes: "Las notas de sección y capítulo del Sistema Armonizado (SA 2022) son normativas legales vinculantes que determinan la clasificación correcta. GTH muestra información de referencia — las exclusiones específicas deben verificarse en la nomenclatura oficial publicada por la OMA/WCO.",
    ncm_notes: "La Nomenclatura Común del MERCOSUR (NCM) incluye notas de capítulo con exclusiones específicas que pueden reclasificar el producto. Verificar en la fuente oficial POLCOM (polcom.mercosur.int) o la aduana del país de destino.",
    taric_notes: "La clasificación TARIC (UE) puede incluir medidas adicionales: antidumping, cuotas, IVA, requisitos fitosanitarios. Consultar el sistema TARIC oficial de la Comisión Europea para la posición arancelaria definitiva.",
    source_wto: "✓ Tasa base: dato oficial WTO API",
    source_ncm: "✓ Descripción NCM: Siscomex Brasil (Receita Federal)",
    source_taric: "✓ Tasa TARIC: Access2Markets (Comisión Europea)",
    source_ai: "⚡ Tasa estimada por IA — verificar con fuente oficial",
    no_replace: "GTH no reemplaza la consulta con un despachante de aduana habilitado.",
    compact: "Datos de referencia. No reemplaza asesoramiento profesional. Verificar con fuente oficial antes de operar.",
  },
  en: {
    title: "Important legal notice",
    general: "The data shown is for reference purposes only and does not constitute professional customs advice. Tariff rates, license requirements and documentation may change without notice. Always verify with the official source and a licensed customs broker before operating.",
    argentina_warning: "⚠️ Argentina frequently modifies its import system (SIRA → SEDI). Verify the current status at argentina.gob.ar before each transaction.",
    hs_notes: "Section and chapter notes of the Harmonized System (HS 2022) are binding legal rules that determine correct classification. GTH displays reference information — specific exclusions must be verified in the official nomenclature published by the WCO.",
    ncm_notes: "The MERCOSUR Common Nomenclature (NCM) includes chapter notes with specific exclusions that may reclassify the product. Verify at the official POLCOM source (polcom.mercosur.int) or the customs authority of the destination country.",
    taric_notes: "TARIC classification (EU) may include additional measures: anti-dumping, quotas, VAT, phytosanitary requirements. Consult the official TARIC system of the European Commission for the final tariff position.",
    source_wto: "✓ Base rate: official WTO API data",
    source_ncm: "✓ NCM description: Siscomex Brazil (Receita Federal)",
    source_taric: "✓ TARIC rate: Access2Markets (European Commission)",
    source_ai: "⚡ AI-estimated rate — verify with official source",
    no_replace: "GTH does not replace consultation with a licensed customs broker.",
    compact: "Reference data only. Does not replace professional advice. Verify with official source before operating.",
  },
};

// Qué notas mostrar según contexto
const contextNotes: Record<string, ("argentina_warning" | "hs_notes" | "ncm_notes" | "taric_notes")[]> = {
  search:      ["hs_notes", "ncm_notes", "taric_notes", "argentina_warning"],
  certificate: ["hs_notes", "ncm_notes", "argentina_warning"],
  cif:         ["argentina_warning"],
  viability:   ["hs_notes", "ncm_notes", "taric_notes", "argentina_warning"],
  general:     ["argentina_warning"],
};

export default function LegalDisclaimer({
  lang = "es",
  context = "general",
  wtoSource = false,
  ncmSource = false,
  taricSource = false,
  compact = false,
}: LegalDisclaimerProps) {
  const t = texts[lang];

  // ── Estilo "letra chica de contrato": presente pero en segundo plano ──
  // fuente 11px máx · opacidad ~40% · sin recuadros de color

  // Versión compacta para footers
  if (compact) {
    return (
      <p style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
        fontStyle: "italic",
        textAlign: "center",
        lineHeight: 1.6,
        marginTop: 8,
      }}>
        {t.compact}
      </p>
    );
  }

  const notes = contextNotes[context] || contextNotes.general;

  return (
    <div style={{
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: "14px 18px",
      marginTop: 20,
    }}>
      {/* Título */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>
        {t.title}
      </p>

      {/* Aviso general */}
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 8 }}>
        {t.general}
      </p>

      {/* Notas según contexto */}
      {notes.map((key) => (
        <p key={key} style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, marginBottom: 6 }}>
          {t[key]}
        </p>
      ))}

      {/* Fuentes de datos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 8 }}>
        {wtoSource && (
          <span style={{ fontSize: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "rgba(34,197,94,0.7)", padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>
            {t.source_wto}
          </span>
        )}
        {ncmSource && (
          <span style={{ fontSize: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "rgba(34,197,94,0.7)", padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>
            {t.source_ncm}
          </span>
        )}
        {taricSource && (
          <span style={{ fontSize: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "rgba(34,197,94,0.7)", padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>
            {t.source_taric}
          </span>
        )}
        {!wtoSource && (
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>
            {t.source_ai}
          </span>
        )}
      </div>

      {/* No reemplaza */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8, marginTop: 4 }}>
        {t.no_replace}
      </p>
    </div>
  );
}
