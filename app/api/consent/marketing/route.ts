// ─────────────────────────────────────────────────────────────
// GTH — Preferencia de comunicaciones (marketing) del usuario autenticado
// POST /api/consent/marketing  { enabled: boolean }
// Sirve para dar de baja y para reactivar. Sólo afecta marketing:
// no toca terms/privacy/legal, cuenta, acceso ni créditos.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setMarketingConsent } from "@/lib/consent";

export async function POST(req: NextRequest) {
  let body: { enabled?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "Falta 'enabled' (boolean)." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Sesión requerida.", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  try {
    const r = await setMarketingConsent({
      userId: user.id,
      email: user.email ?? null,
      enabled: body.enabled,
      source: "dashboard",
    });
    return NextResponse.json({
      ok: true,
      marketing_consent: r.marketing_consent,
      changed: r.changed,
    });
  } catch (err) {
    console.error("[consent/marketing] error", { userId: user.id, err: String(err) });
    return NextResponse.json(
      { ok: false, error: "No pudimos actualizar tu preferencia. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}
