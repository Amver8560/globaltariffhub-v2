import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal — Global Tariff Hub",
  description: "Aviso legal, limitación de responsabilidad y derechos de autor de Global Tariff Hub.",
};

export default function Legales() {
  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.5)" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/terminos" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Términos de Uso</Link>
          <Link href="/privacidad" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Privacidad</Link>
          <Link href="/legal" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>View in English</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 20, padding: "5px 16px", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}>Legal</span>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginTop: 20, marginBottom: 8, letterSpacing: -0.5 }}>Aviso Legal</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Última actualización: junio 2026</p>
        </div>

        {/* Aviso principal — destacado */}
        <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "28px 32px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#ef4444", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Aviso importante</p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, fontWeight: 500 }}>
            <strong style={{ color: "#FFF" }}>Global Tariff Hub</strong> proporciona <strong style={{ color: "#FFF" }}>herramientas de apoyo</strong> para el análisis de comercio internacional. La clasificación arancelaria definitiva, la aplicación de acuerdos comerciales y los requisitos regulatorios deben ser verificados por <strong style={{ color: "#C9A84C" }}>profesionales competentes</strong> y/o las autoridades aduaneras correspondientes.
          </p>
        </div>

        {/* Aviso IA */}
        <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 14, padding: "20px 28px", marginBottom: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "rgba(168,85,247,0.9)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>🤖 Aviso IA</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
            Los resultados generados mediante <strong style={{ color: "#FFF" }}>inteligencia artificial</strong> son <strong style={{ color: "#FFF" }}>orientativos</strong> y no constituyen asesoramiento legal, tributario o aduanero. El usuario debe verificar toda clasificación arancelaria con un profesional habilitado antes de utilizarla en documentación oficial.
          </p>
        </div>

        {/* Secciones */}
        {[
          {
            icon: "📋",
            title: "Naturaleza del servicio",
            body: "Global Tariff Hub es una herramienta de apoyo para el análisis de comercio internacional. Permite estimar aranceles, simular operaciones y calcular costos de importación. Todos los resultados son estimaciones orientativas y no constituyen una liquidación aduanera definitiva ni asesoramiento legal o aduanero.",
          },
          {
            icon: "🏛",
            title: "Consulta profesional obligatoria",
            body: "Antes de realizar cualquier operación de importación o exportación, el usuario debe consultar con un despachante de aduana habilitado, un asesor legal especializado en comercio exterior y/o un contador con experiencia en operaciones internacionales. GTH no asume responsabilidad por decisiones comerciales tomadas exclusivamente en base a los datos de la plataforma.",
          },
          {
            icon: "🌐",
            title: "Fuentes de referencia utilizadas",
            body: "GTH utiliza como referencia datos provenientes de: WTO API (Organización Mundial del Comercio), BrasilAPI / Siscomex (Receita Federal de Brasil) y TARIC (Comisión Europea). Estas fuentes están sujetas a cambios normativos que pueden no reflejarse de inmediato en la plataforma. GTH actúa como intermediario de consulta y no redistribuye bases de datos completas ni garantiza la vigencia de los datos en el momento exacto de la consulta.",
          },
          {
            icon: "🤖",
            title: "Uso de inteligencia artificial",
            body: "La clasificación arancelaria por imagen o descripción utiliza modelos de inteligencia artificial (Anthropic Claude). Los resultados son orientativos y no constituyen asesoramiento legal, tributario ni aduanero. La clasificación automática puede contener errores. El usuario debe verificar siempre el código arancelario con un profesional habilitado antes de utilizarlo en documentación oficial o tomar decisiones comerciales basadas en él.",
          },
          {
            icon: "⚖️",
            title: "Limitación de responsabilidad",
            body: "Global Tariff Hub no será responsable por: errores de clasificación arancelaria, diferencias entre las tasas estimadas y las liquidadas por aduana, sanciones o multas aduaneras, pérdidas económicas derivadas del uso de la plataforma, ni por la desactualización de datos normativos. El uso de GTH es bajo la exclusiva responsabilidad del usuario.",
          },
          {
            icon: "🔄",
            title: "Actualización de datos",
            body: "Las tasas arancelarias MFN se actualizan desde la WTO API. Los datos TARIC se sincronizan mensualmente. La nomenclatura NCM proviene de BrasilAPI en tiempo real. A pesar de esto, las normativas de comercio exterior cambian frecuentemente. GTH no garantiza que los datos estén actualizados al momento exacto de la consulta.",
          },
        ].map((section, i) => (
          <div key={i} style={{ display: "flex", gap: 20, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 24, marginTop: 2, flexShrink: 0 }}>{section.icon}</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#FFFFFF" }}>{section.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.85, fontSize: 14 }}>{section.body}</p>
            </div>
          </div>
        ))}

        {/* Copyright */}
        <div style={{ background: "rgba(13,27,62,0.6)", border: "1px solid rgba(0,87,255,0.2)", borderRadius: 14, padding: "28px 32px", marginTop: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.7)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>© Derechos de Autor</p>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, marginBottom: 16 }}>
            <strong style={{ color: "#FFF" }}>© 2025 Global Tariff Hub.</strong> Todos los derechos reservados.
          </p>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, marginBottom: 16 }}>
            El diseño, código fuente, marca, textos, estructura y contenidos originales de esta plataforma son propiedad de <strong style={{ color: "#FFF" }}>Global Tariff Hub</strong> y están protegidos por la legislación de derechos de autor de la República Oriental del Uruguay y por los tratados internacionales aplicables, incluyendo el <strong style={{ color: "rgba(255,255,255,0.8)" }}>Convenio de Berna</strong> para la Protección de las Obras Literarias y Artísticas y el Acuerdo <strong style={{ color: "rgba(255,255,255,0.8)" }}>TRIPS</strong> de la OMC.
          </p>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, marginBottom: 16 }}>
            La plataforma fue creada y desarrollada originalmente en <strong style={{ color: "rgba(255,255,255,0.8)" }}>junio de 2025</strong>. Queda expresamente prohibida la reproducción total o parcial, distribución, transformación o comunicación pública de los contenidos propios de GTH sin autorización escrita del titular.
          </p>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85 }}>
            Los datos arancelarios se obtienen de fuentes de referencia públicas (WTO, Siscomex, TARIC EU) y se citan con la atribución correspondiente. GTH no reclama derechos sobre dichos datos y no garantiza su vigencia en el momento de la consulta.
          </p>
        </div>

        {/* Contacto */}
        <div style={{ marginTop: 32, padding: "20px 28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Consultas legales: <a href="mailto:analia@globaltariffhub.com" style={{ color: "#0057FF", textDecoration: "none", fontWeight: 600 }}>analia@globaltariffhub.com</a>
          </p>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none" }}>← Volver al inicio</Link>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12, flexWrap: "wrap" }}>
          <Link href="/terminos" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Términos de Uso</Link>
          <Link href="/privacidad" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Privacidad</Link>
          <Link href="/legales" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Aviso Legal</Link>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2025 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
