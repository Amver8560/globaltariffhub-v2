"use client";

// ─────────────────────────────────────────────────────────────
// GTH — Caja de error accionable para las consultas con IA.
// Muestra: qué pasó · estado del crédito · botón "Reintentar".
// Se usa igual en los módulos 01–04.
// ─────────────────────────────────────────────────────────────
import { creditNote, type AIErrorView } from "@/lib/aiClient";

export default function ApiErrorBox({
  view,
  lang,
  onRetry,
  retrying = false,
}: {
  view: AIErrorView;
  lang: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const note = creditNote(view, lang);
  const en = lang === "en";

  return (
    <div
      role="alert"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 10,
        padding: "14px 16px",
        marginTop: 14,
        marginBottom: 4,
      }}
    >
      <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.55, margin: 0 }}>{view.message}</p>
      {note && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 6, marginBottom: 0 }}>{note}</p>
      )}
      {view.retryable && onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          style={{
            marginTop: 12,
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid rgba(0,87,255,0.4)",
            background: retrying ? "rgba(0,87,255,0.2)" : "rgba(0,87,255,0.15)",
            color: "#6B9FFF",
            fontSize: 13,
            fontWeight: 700,
            cursor: retrying ? "not-allowed" : "pointer",
          }}
        >
          {retrying
            ? en
              ? "Retrying…"
              : "Reintentando…"
            : en
              ? "↻ Retry"
              : "↻ Reintentar"}
        </button>
      )}
    </div>
  );
}
