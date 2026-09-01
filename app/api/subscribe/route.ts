import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, lang, source, utm_source, utm_medium, utm_campaign } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const isEs = lang !== "en";
  const cleanEmail = email.trim();
  const now = new Date().toISOString();

  // ── 1. Persistir SIEMPRE antes de intentar enviar ──────────
  // Email único case-insensitive (citext). Re-suscripción reactiva la fila
  // (status → pending, nuevo consent_at) sin duplicar ni perder trazabilidad.
  let unsubscribeToken: string | null = null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("subscribers")
      .upsert(
        {
          email: cleanEmail,
          status: "pending",
          source: source ? String(source) : "coming_soon",
          utm_source: utm_source ? String(utm_source) : null,
          utm_medium: utm_medium ? String(utm_medium) : null,
          utm_campaign: utm_campaign ? String(utm_campaign) : null,
          consent_at: now,
          updated_at: now,
        },
        { onConflict: "email" }
      )
      .select("unsubscribe_token")
      .single();
    if (error) throw error;
    unsubscribeToken = data?.unsubscribe_token ?? null;
  } catch (dbErr) {
    console.error("[subscribe] no se pudo persistir el suscriptor", {
      email: cleanEmail,
      err: String(dbErr),
    });
    return NextResponse.json(
      { error: "No pudimos registrar tu email. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }

  // ── 2. Emails (best-effort — no bloquean el alta ya persistida) ──
  const unsubUrl = unsubscribeToken
    ? `${req.nextUrl.origin}/api/unsubscribe?token=${unsubscribeToken}${isEs ? "" : "&lang=en"}`
    : `${req.nextUrl.origin}/`;

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
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:8px;">Si no querés recibir más correos, <a href="${unsubUrl}" style="color:rgba(255,255,255,0.4);">date de baja acá</a>.</p>
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
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:8px;">If you no longer want these emails, <a href="${unsubUrl}" style="color:rgba(255,255,255,0.4);">unsubscribe here</a>.</p>
      </div>
    `;

  try {
    await Promise.all([
      resend.emails.send({
        from: "Global Tariff Hub <noreply@globaltariffhub.com>",
        to: cleanEmail,
        subject: confirmSubject,
        html: confirmHtml,
      }),
      resend.emails.send({
        from: "Global Tariff Hub <noreply@globaltariffhub.com>",
        to: process.env.NOTIFY_EMAIL!,
        subject: `Nuevo registro: ${cleanEmail}`,
        html: `<p>Nuevo registro en el Coming Soon:<br/><strong>${cleanEmail}</strong><br/>Idioma: ${lang || "es"}</p>`,
      }),
    ]);
  } catch (mailErr) {
    // El suscriptor ya quedó persistido; el email es secundario.
    console.error("[subscribe] envío de emails falló (suscriptor ya persistido)", {
      email: cleanEmail,
      err: String(mailErr),
    });
  }

  return NextResponse.json({ ok: true });
}
