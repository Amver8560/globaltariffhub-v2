import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — Global Tariff Hub",
};

export default function Privacidad() {
  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>View in English</Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(201,168,76,0.15)", border: "1px solid #C9A84C", borderRadius: 20, padding: "5px 16px", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}>
            Legal
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Política de Privacidad</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Última actualización: junio 2025</p>
        </div>

        {[
          {
            title: "1. Quiénes somos",
            body: "Global Tariff Hub es una plataforma de consulta arancelaria para emprendedores, pequeñas y medianas empresas que operan en comercio internacional. El responsable del tratamiento de datos es Global Tariff Hub, contacto: analia@globaltariffhub.com."
          },
          {
            title: "2. Qué datos recopilamos",
            body: "Recopilamos únicamente la dirección de correo electrónico que ingresás voluntariamente en el formulario de registro anticipado. No recopilamos datos de navegación, cookies de seguimiento ni información personal adicional en esta etapa del sitio."
          },
          {
            title: "3. Para qué usamos tus datos",
            body: "Tu email se usa exclusivamente para: (a) enviarte un correo de confirmación de registro, (b) notificarte cuando la plataforma esté disponible, (c) enviarte actualizaciones sobre novedades arancelarias y el lanzamiento del servicio. No vendemos ni compartimos tu email con terceros."
          },
          {
            title: "4. Servicios de terceros",
            body: "Utilizamos Resend (resend.com) como proveedor de envío de correos electrónicos. Tu email puede ser procesado por sus servidores conforme a su propia política de privacidad. No utilizamos cookies de seguimiento ni plataformas de análisis de comportamiento en esta etapa."
          },
          {
            title: "5. Conservación de datos",
            body: "Conservamos tu email mientras el servicio esté activo o hasta que solicites su eliminación. Podés solicitar la baja en cualquier momento escribiendo a analia@globaltariffhub.com con el asunto 'Baja de lista'."
          },
          {
            title: "6. Tus derechos",
            body: "Tenés derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Para ejercer cualquiera de estos derechos escribinos a analia@globaltariffhub.com. Respondemos en un plazo máximo de 30 días hábiles."
          },
          {
            title: "7. Seguridad",
            body: "Tomamos medidas razonables para proteger tu información. Sin embargo, ningún sistema de transmisión de datos por Internet es 100% seguro. Usamos proveedores con estándares de seguridad reconocidos en la industria."
          },
          {
            title: "8. Cambios a esta política",
            body: "Podemos actualizar esta política periódicamente. Cualquier cambio significativo será comunicado por email a los usuarios registrados. La fecha de última actualización siempre estará visible al inicio de este documento."
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "#FFFFFF" }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, fontSize: 15 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: "24px", background: "#0D1B3E", borderRadius: 12, border: "1px solid rgba(0,87,255,0.2)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            ¿Tenés preguntas sobre esta política? Escribinos a{" "}
            <a href="mailto:analia@globaltariffhub.com" style={{ color: "#0057FF" }}>analia@globaltariffhub.com</a>
          </p>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
