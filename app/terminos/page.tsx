import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — Global Tariff Hub",
  description: "Términos y condiciones de uso de la plataforma Global Tariff Hub.",
};

export default function Terminos() {
  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.5)" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/privacidad" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Política de Privacidad</Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 20, padding: "5px 16px", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}>Legal</span>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginTop: 20, marginBottom: 8, letterSpacing: -0.5 }}>Términos de Uso</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Última actualización: junio 2026</p>
        </div>

        {[
          {
            title: "1. Aceptación de los términos",
            body: "Al acceder y utilizar Global Tariff Hub (en adelante, 'la plataforma' o 'GTH'), aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguno de estos términos, no debés utilizar la plataforma.",
          },
          {
            title: "2. Descripción del servicio",
            body: "Global Tariff Hub es una plataforma de apoyo para el análisis de comercio internacional. Permite buscar códigos arancelarios (HS, NCM, TARIC), simular operaciones con certificados de origen, calcular costos CIF y analizar la viabilidad de operaciones de importación. Los datos son de referencia y se obtienen de fuentes públicas como la OMC (WTO API), Siscomex de Brasil y TARIC de la Unión Europea, las cuales están sujetas a cambios que pueden no reflejarse en tiempo real.",
          },
          {
            title: "3. Naturaleza de los datos — Carácter informativo",
            body: "Toda la información provista por GTH tiene carácter exclusivamente informativo y de referencia. GTH es un intermediario de consulta, no un redistribuidor de bases de datos ni un asesor aduanero. Los datos pueden contener imprecisiones o no reflejar actualizaciones normativas recientes. El usuario es el único responsable de verificar la información con los organismos oficiales competentes antes de realizar cualquier operación de comercio exterior.",
          },
          {
            title: "4. Lo que GTH no hace",
            body: "GTH no emite certificados de origen, documentos aduaneros ni ningún otro documento oficial. GTH no brinda asesoramiento legal, impositivo ni aduanero. Los simuladores y calculadoras son herramientas de estimación y no reemplazan la consulta con un despachante de aduana habilitado, un asesor legal o un contador especializado en comercio exterior.",
          },
          {
            title: "5. Fuentes de referencia y limitación de responsabilidad",
            body: "GTH utiliza como referencia datos de fuentes públicas (WTO API, BrasilAPI/Siscomex, TARIC EU). Estas fuentes están sujetas a cambios normativos frecuentes. No garantizamos la exactitud, integridad ni actualización en tiempo real de los datos provistos. Los resultados generados por inteligencia artificial son orientativos y no constituyen asesoramiento legal, tributario ni aduanero. GTH no será responsable por pérdidas económicas, sanciones aduaneras, errores de clasificación ni ningún otro daño derivado del uso de la plataforma.",
          },
          {
            title: "6. Propiedad intelectual",
            body: "El diseño, código, marca, textos y contenidos propios de GTH son propiedad de Global Tariff Hub y están protegidos por la legislación de propiedad intelectual aplicable. Los datos arancelarios se obtienen de fuentes de referencia públicas y se citan con la atribución correspondiente. GTH no reclama derechos sobre dichos datos. Queda prohibida la reproducción, distribución o explotación comercial de los contenidos de GTH sin autorización expresa.",
          },
          {
            title: "7. Uso aceptable",
            body: "El usuario se compromete a utilizar la plataforma de manera lícita y conforme a estos términos. Queda prohibido: (a) usar GTH para fines ilegales; (b) intentar acceder a sistemas o datos sin autorización; (c) reproducir o redistribuir bases de datos de la plataforma; (d) realizar scraping masivo o automatizado sin consentimiento escrito de GTH.",
          },
          {
            title: "8. Cuentas de usuario",
            body: "Al registrarte en GTH sos responsable de mantener la confidencialidad de tus credenciales de acceso. GTH puede suspender o cancelar cuentas que infrinjan estos términos sin previo aviso. Las consultas gratuitas son de uso personal y no transferible.",
          },
          {
            title: "9. Modificaciones al servicio y a los términos",
            body: "GTH se reserva el derecho de modificar, suspender o discontinuar el servicio en cualquier momento. Estos Términos de Uso pueden actualizarse periódicamente. Los cambios significativos serán notificados por email a los usuarios registrados. El uso continuado de la plataforma tras la notificación implica la aceptación de los nuevos términos.",
          },
          {
            title: "10. Jurisdicción y ley aplicable",
            body: "Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, con renuncia expresa a cualquier otro fuero que pudiera corresponder.",
          },
          {
            title: "11. Contacto",
            body: "Para consultas sobre estos Términos de Uso escribí a analia@globaltariffhub.com.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#FFFFFF" }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.85, fontSize: 14 }}>{section.body}</p>
          </div>
        ))}

        {/* Aviso herramienta de apoyo */}
        <div style={{ marginTop: 16, padding: "24px 28px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(239,68,68,0.8)", fontWeight: 700, marginBottom: 8 }}>⚠ Herramienta de apoyo — no de asesoramiento</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
            GTH proporciona herramientas de apoyo para el análisis de comercio internacional. La clasificación arancelaria definitiva, la aplicación de acuerdos comerciales y los requisitos regulatorios deben ser verificados por <strong style={{ color: "rgba(255,255,255,0.75)" }}>profesionales competentes</strong> y/o las autoridades aduaneras correspondientes.
          </p>
        </div>

        {/* Aviso IA */}
        <div style={{ padding: "20px 28px", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(168,85,247,0.85)", fontWeight: 700, marginBottom: 8 }}>🤖 Aviso IA</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
            Los resultados generados mediante inteligencia artificial son <strong style={{ color: "rgba(255,255,255,0.75)" }}>orientativos</strong> y no constituyen asesoramiento legal, tributario o aduanero.
          </p>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none" }}>← Volver al inicio</Link>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
