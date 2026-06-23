// ─────────────────────────────────────────────────────────────
// GTH — Sistema de créditos de consulta
// ─────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const FREE_CREDITS = 3;

export interface CreditCheckResult {
  ok: boolean;
  error?: NextResponse;
  userId?: string;
  isPro?: boolean;
}

/**
 * Verifica si el usuario tiene créditos disponibles.
 * Si los tiene, los consume y devuelve ok: true.
 * Si no, devuelve un NextResponse con error 402.
 */
export async function checkAndConsumeCredit(): Promise<CreditCheckResult> {
  const supabase = await createClient();

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "Sesión requerida. Por favor iniciá sesión.", code: "UNAUTHENTICATED" },
        { status: 401 }
      ),
    };
  }

  // Obtener perfil con créditos
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits_used, is_pro, plan")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Si no existe perfil lo creamos (fallback)
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      credits_used: 0,
      is_pro: false,
    });
    // Primera consulta — la dejamos pasar
    return { ok: true, userId: user.id, isPro: false };
  }

  // Usuario Pro — acceso ilimitado
  if (profile.is_pro) {
    return { ok: true, userId: user.id, isPro: true };
  }

  // Verificar créditos disponibles
  if (profile.credits_used >= FREE_CREDITS) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          error: "Agotaste tus 3 consultas gratuitas. Activá un plan para continuar.",
          code: "NO_CREDITS",
          redirect: "/pricing",
        },
        { status: 402 }
      ),
    };
  }

  // Consumir un crédito
  await supabase
    .from("profiles")
    .update({ credits_used: profile.credits_used + 1 })
    .eq("id", user.id);

  return { ok: true, userId: user.id, isPro: false };
}
