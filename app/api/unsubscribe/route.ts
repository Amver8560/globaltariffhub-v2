// ─────────────────────────────────────────────────────────────
// GTH — Baja de comunicaciones desde el enlace del email (sin login)
// GET /api/unsubscribe?token=<uuid>[&lang=en]
// Resuelve la fila de subscribers por el token y delega en
// setMarketingConsent() → sincroniza subscribers, y también
// user_consents + consent_events si ese email tiene cuenta.
// No toca terms/privacy/legal, cuenta, acceso ni créditos.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setMarketingConsent } from "@/lib/consent";

function page(message: string) {
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Global Tariff Hub</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#062863;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
  .box{max-width:440px;padding:40px 28px;text-align:center}
  .mark{font-weight:800;font-size:13px;color:#F4C542;letter-spacing:1px;margin-bottom:18px}
  p{font-size:15px;line-height:1.6;color:rgba(255,255,255,0.8)}
  a{color:#F4C542;text-decoration:none}
</style></head><body>
  <div class="box">
    <div class="mark">GLOBAL TARIFF HUB</div>
    <p>${message}</p>
    <p style="margin-top:20px"><a href="https://globaltariffhub.com">Ir al sitio →</a></p>
  </div>
</body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const isEn = req.nextUrl.searchParams.get("lang") === "en";

  const t = {
    invalid: isEn ? "This unsubscribe link is not valid." : "El enlace de baja no es válido.",
    notFound: isEn
      ? "We couldn't find that address. It may already have been removed."
      : "No encontramos esa dirección. Puede que ya se haya dado de baja.",
    ok: isEn
      ? "You've been unsubscribed from Global Tariff Hub updates. You can turn them back on from your dashboard whenever you want."
      : "Ya no vas a recibir novedades de Global Tariff Hub. Podés volver a activarlas desde tu panel cuando quieras.",
    error: isEn ? "Something went wrong. Please try again later." : "Hubo un problema. Probá de nuevo más tarde.",
  };

  if (!token) return page(t.invalid);

  try {
    const admin = createAdminClient();
    const { data: sub, error } = await admin
      .from("subscribers")
      .select("email")
      .eq("unsubscribe_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!sub?.email) return page(t.notFound);

    await setMarketingConsent({ email: sub.email, enabled: false, source: "email_link" });
    return page(t.ok);
  } catch (err) {
    console.error("[unsubscribe] error", { err: String(err) });
    return page(t.error);
  }
}
