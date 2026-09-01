"use client";

import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/** Input de contraseña con botón de ojito para mostrar/ocultar. */
export default function PasswordInput({ style, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        type={show ? "text" : "password"}
        style={{ ...(style as React.CSSProperties), paddingRight: 46 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        style={{
          position: "absolute",
          right: 8,
          top: 0,
          bottom: 0,
          margin: "auto 0",
          height: 30,
          width: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.5)",
          padding: 0,
        }}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
