import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, lang } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const isEs = lang !== "en";

  const confirmSubject = isEs
    ? "¡Estás en la lista! — Global Tariff Hub"
    : "You're on the list! — Global Tariff Hub";

  const confirmHtml = isEs
    ? `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#ffffff;padding:40px;border-radius:12px;">
        <h1 style="color:#C9A84C;font-size:24px;margin-bottom:8px;">Global Tariff Hub</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:32px;">Comercio internacional ágil</p>
        <h2 style="font-size:20px;margin-bottom:16px;">¡Estás en la lista! 🎉</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.7;">Gracias por registrarte. Sos de los primeros en conocer Global Tariff Hub — la plataforma arancelaria pensada para emprendedores y pymes.</p>
        <p style="color:rgba(255,255,255,0.75);line-height:1.7;margin-top:16px;">Te avisamos en cuanto lancemos. Mientras tanto, seguí nuestras novedades en <a href="https://globaltariffhub.com" style="color:#0057FF;">globaltariffhub.com</a>.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:32px 0;" />
        <p style="color:rgba(255,255,255,0.3);font-size:12px;">© 2025 Global Tariff Hub. Este sitio es de carácter informativo y no emite certificados de origen.</p>
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#ffffff;padding:40px;border-radius:12px;">
        <h1 style="color:#C9A84C;font-size:24px;margin-bottom:8px;">Global Tariff Hub</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:32px;">Agile international trade</p>
        <h2 style="font-size:20px;margin-bottom:16px;">You're on the list! 🎉</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.7;">Thank you for signing up. You're among the first to hear about Global Tariff Hub — the tariff platform built for entrepreneurs and SMEs.</p>
        <p style="color:rgba(255,255,255,0.75);line-height:1.7;margin-top:16px;">We'll notify you as soon as we launch. In the meantime, follow our updates at <a href="https://globaltariffhub.com/en" style="color:#0057FF;">globaltariffhub.com</a>.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:32px 0;" />
        <p style="color:rgba(255,255,255,0.3);font-size:12px;">© 2025 Global Tariff Hub. This site is for informational purposes only and does not issue certificates of origin.</p>
      </div>
    `;

  try {
    await Promise.all([
      // Confirmación al usuario
      resend.emails.send({
        from: "Global Tariff Hub <noreply@globaltariffhub.com>",
        to: email,
        subject: confirmSubject,
        html: confirmHtml,
      }),
      // Notificación a Analia
      resend.emails.send({
        from: "Global Tariff Hub <noreply@globaltariffhub.com>",
        to: process.env.NOTIFY_EMAIL!,
        subject: `Nuevo registro: ${email}`,
        html: `<p>Nuevo registro en el Coming Soon:<br/><strong>${email}</strong><br/>Idioma: ${lang || "es"}</p>`,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
