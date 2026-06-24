// ─────────────────────────────────────────────────────────────
// GTH — API Admin: activar plan manualmente
// POST /api/admin/activate
// Body: { email, plan, admin_key }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, plan, admin_key } = await req.json();

    // Clave de admin — cambiar por una segura en .env
    if (admin_key !== process.env.GTH_ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!email || !plan) {
      return NextResponse.json({ error: "Faltan datos: email y plan requeridos" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Calcular fecha de vencimiento
    const now = new Date();
    let expires = new Date(now);
    if (plan === "monthly") {
      expires.setMonth(expires.getMonth() + 1);
    } else if (plan === "annual") {
      expires.setFullYear(expires.getFullYear() + 1);
    }

    // Buscar usuario por email en auth.users via admin
    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !users) {
      return NextResponse.json({ error: `Usuario no encontrado: ${email}` }, { status: 404 });
    }

    // Activar plan
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_pro: true,
        plan,
        plan_expires_at: expires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", users.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Plan ${plan} activado para ${email}`,
      expires: expires.toISOString(),
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
