// ─────────────────────────────────────────────────────────────
// GTH — Baja de la lista de interesados (sin login)
// GET /api/unsubscribe?token=<uuid>[&lang=en]
// Marca status='unsubscribed' + unsubscribed_at. La fila se conserva.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function page(message: string) {
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Global Tariff Hub</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#062863;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
  .box{max-width:420px;padding:40px 28px;text-align:center}
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
    invalid: isEn ? "Invalid unsubscribe link." : "El enlace de baja no es válido.",
    notFound: isEn
      ? "We couldn't find that subscription. It may already have been removed."
      : "No encontramos esa suscripción. Puede que ya se haya dado de baja.",
    ok: isEn
      ? "You've been unsubscribed. You won't receive any more emails from us."
      : "Te diste de baja. No vas a recibir más correos nuestros.",
    error: isEn ? "Something went wrong. Please try again later." : "Hubo un problema. Probá de nuevo más tarde.",
  };

  if (!token) return page(t.invalid);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("email");
    if (error) throw error;
    if (!data || data.length === 0) return page(t.notFound);
    return page(t.ok);
  } catch (err) {
    console.error("[unsubscribe] error", { err: String(err) });
    return page(t.error);
  }
}
