import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad",
};

export default function Privacidad() {
  return (
    <div style={{ backgroundColor: "#0B1B33", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #3B7BF6, #13294B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#E3B341", border: "1px solid #E3B341" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>View in English</Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(227,179,65,0.15)", border: "1px solid #E3B341", borderRadius: 20, padding: "5px 16px", color: "#E3B341", fontSize: 12, fontWeight: 600 }}>
            Legal
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Política de Privacidad</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Última actualización: junio 2026</p>
        </div>

        {[
          {
            title: "1. Quiénes somos",
            body: "Global Tariff Hub es una plataforma de consulta arancelaria para emprendedores, pequeñas y medianas empresas que operan en comercio internacional. El responsable del tratamiento de datos es Global Tariff Hub, contacto: globaltariffhub@gmail.com."
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
            body: "GTH utiliza los siguientes proveedores externos que pueden procesar tus datos: (a) Supabase (supabase.com) — gestión de cuentas de usuario y autenticación; tus credenciales de acceso se almacenan en su infraestructura. (b) Anthropic (anthropic.com) — motor de inteligencia artificial que procesa las consultas que ingresás en los módulos de la plataforma; las consultas pueden incluir descripciones de productos o imágenes que subís. (c) Resend (resend.com) — envío de correos electrónicos de confirmación y notificaciones. Cada proveedor opera conforme a su propia política de privacidad. GTH no vende ni comparte tus datos con terceros para fines publicitarios."
          },
          {
            title: "5. Conservación de datos",
            body: "Conservamos tu email mientras el servicio esté activo o hasta que solicites su eliminación. Podés solicitar la baja en cualquier momento escribiendo a globaltariffhub@gmail.com con el asunto 'Baja de lista'."
          },
          {
            title: "6. Tus derechos",
            body: "Tenés derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Para ejercer cualquiera de estos derechos escribinos a globaltariffhub@gmail.com. Respondemos en un plazo máximo de 30 días hábiles."
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

        <div style={{ marginTop: 48, padding: "24px", background: "#13294B", borderRadius: 12, border: "1px solid rgba(59,123,246,0.2)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            ¿Tenés preguntas sobre esta política? Escribinos a{" "}
            <a href="mailto:globaltariffhub@gmail.com" style={{ color: "#3B7BF6" }}>globaltariffhub@gmail.com</a>
          </p>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 Global Tariff Hub. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
