"use client";

import Link from "next/link";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  lang?: "es" | "en";
}

export default function TermsCheckbox({ checked, onChange, lang = "es" }: TermsCheckboxProps) {
  const label =
    lang === "es" ? (
      <>
        Leí y acepto los{" "}
        <Link href="/terminos" target="_blank" style={{ color: "#2563EB", textDecoration: "underline" }}>
          Términos de Uso
        </Link>
        . Entiendo que los datos son de referencia y no reemplazan el asesoramiento de un despachante de aduana habilitado.
      </>
    ) : (
      <>
        I have read and accept the{" "}
        <Link href="/terms" target="_blank" style={{ color: "#2563EB", textDecoration: "underline" }}>
          Terms of Use
        </Link>
        . I understand that data is for reference only and does not replace advice from a licensed customs broker.
      </>
    );

  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginTop: 16,
        padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${checked ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.12)"}`,
        background: checked ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? "#2563EB" : "rgba(255,255,255,0.3)"}`,
          background: checked ? "#2563EB" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, userSelect: "none" }}>
        {label}
      </p>
    </div>
  );
}
