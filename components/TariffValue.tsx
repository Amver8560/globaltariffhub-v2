"use client";

// ─────────────────────────────────────────────────────────────
// GTH — Bloque 2 · Presentación de un TariffDatum
//
// Muestra: la tasa (o "No determinado"), el estado
// (Determinado / Referencial / No determinado), la fuente, el nivel de
// nomenclatura, y la necesidad de validación cuando corresponde.
// El `confidence` interno no se muestra como eje primario.
// ─────────────────────────────────────────────────────────────
import type { TariffDatum, TariffStatus } from "@/lib/tariffDatum";

const LABEL: Record<TariffStatus, { es: string; en: string; color: string; bg: string }> = {
  determined:     { es: "Determinado",    en: "Determined",     color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  referential:    { es: "Referencial",    en: "Referential",    color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  not_determined: { es: "No determinado", en: "Not determined", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const LEVEL_LABEL: Record<string, { es: string; en: string }> = {
  "HS6":          { es: "HS 6 dígitos", en: "HS 6-digit" },
  "national-8":   { es: "línea nacional 8 díg.", en: "national line 8-digit" },
  "national-10":  { es: "línea nacional 10 díg.", en: "national line 10-digit" },
  "n/a":          { es: "", en: "" },
};

export default function TariffValue({
  datum,
  lang = "es",
  label,
}: {
  datum: TariffDatum | null | undefined;
  lang?: string;
  label?: string;
}) {
  const en = lang === "en";
  const d = datum ?? null;
  const status: TariffStatus = d?.status ?? "not_determined";
  const l = LABEL[status];
  const lvl = d?.nomenclature?.level ? LEVEL_LABEL[d.nomenclature.level] : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: d?.value != null ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>
          {d?.value != null ? `${d.value}%` : (en ? "Not determined" : "No determinado")}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: l.color, background: l.bg,
          border: `1px solid ${l.color}55`, borderRadius: 999, padding: "2px 10px",
        }}>
          {en ? l.en : l.es}
        </span>
      </div>

      {d && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>
          {d.source?.name && d.source.name !== "—" && (
            <span>{en ? "Source" : "Fuente"}: {d.source.name}</span>
          )}
          {lvl && (en ? lvl.en : lvl.es) && (
            <span> · {en ? "Level" : "Nivel"}: {en ? lvl.en : lvl.es}</span>
          )}
          {d.as_of?.value && (
            <span> · {en ? "As of" : "Dato de"} {d.as_of.value}</span>
          )}
          {d.jurisdiction?.country && (
            <span> · {en ? "Jurisdiction" : "Jurisdicción"}: {d.jurisdiction.country}</span>
          )}
        </div>
      )}

      {d?.requires_validation && status !== "not_determined" && (
        <p style={{ fontSize: 11, color: "#C9A84C", margin: 0 }}>
          ⚠ {en
            ? "Requires validation in the official system of the importing country or with a customs broker."
            : "Requiere validación en el sistema oficial del país importador o con un despachante de aduana."}
        </p>
      )}
      {d?.note && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{d.note}</p>
      )}
    </div>
  );
}
