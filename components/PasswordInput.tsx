"use client";

import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/** Input de contraseña con botón de ojito para mostrar/ocultar. */
export default function PasswordInput({ style, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="gth-password-field" style={{ position: "relative" }}>
      <input
        {...props}
        type={show ? "text" : "password"}
        style={{ ...(style as React.CSSProperties), paddingRight: 46 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="gth-password-toggle"
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

      {/* Contraste consistente del ícono + estados hover/focus (inline style
          gana sobre CSS externo, por eso color y fondo del botón viven acá)
          y neutralización del repintado de autofill del navegador, que en
          Chrome/Safari pone el campo casi blanco y vuelve invisible tanto el
          ícono como el texto sobre el fondo oscuro del formulario. */}
      <style jsx>{`
        .gth-password-toggle {
          background: rgba(255, 255, 255, 0.07);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.85);
        }
        .gth-password-toggle:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.14);
        }
        .gth-password-toggle:focus-visible {
          outline: 2px solid #9CC0FF;
          outline-offset: 2px;
        }
        .gth-password-field input:-webkit-autofill,
        .gth-password-field input:-webkit-autofill:hover,
        .gth-password-field input:-webkit-autofill:focus,
        .gth-password-field input:-webkit-autofill:active {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px #13294B inset;
          box-shadow: 0 0 0 1000px #13294B inset;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
