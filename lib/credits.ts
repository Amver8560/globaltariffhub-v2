// ─────────────────────────────────────────────────────────────
// GTH — Sistema de créditos de consulta
// Todas las lecturas/escrituras de `profiles` son server-side con
// service-role. El rol `authenticated` no tiene privilegio de escritura
// sobre `profiles` (SEC-1). Un error de DB nunca se interpreta como
// "primera consulta gratis".
// ─────────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const FREE_CREDITS = 3;

export interface CreditCheckResult {
  ok: boolean;
  error?: NextResponse;
  userId?: string;
  isPro?: boolean;
}

function creditCheckFailed(): NextResponse {
  return NextResponse.json(
    {
      error: "No pudimos verificar tus créditos en este momento. Probá de nuevo en un momento.",
      code: "CREDIT_CHECK_FAILED",
    },
    { status: 503 }
  );
}

function noCredits(): NextResponse {
  return NextResponse.json(
    {
      error:
        "Usaste tus 3 consultas gratuitas de la apertura anticipada. Escribinos a analia@globaltariffhub.com y te habilitamos el acceso.",
      code: "NO_CREDITS",
    },
    { status: 402 }
  );
}

/**
 * Verifica si el usuario tiene créditos disponibles.
 * Si los tiene, consume uno y devuelve ok: true.
 * Si no, devuelve un NextResponse con el error correspondiente.
 * Toda operación sobre `profiles` se hace con service-role.
 */
export async function checkAndConsumeCredit(): Promise<CreditCheckResult> {
  // El client ligado a la cookie SÓLO se usa para validar la sesión.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "Sesión requerida. Por favor iniciá sesión.", code: "UNAUTHENTICATED" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();

  const { data: profile, error: selErr } = await admin
    .from("profiles")
    .select("credits_used, is_pro")
    .eq("id", user.id)
    .maybeSingle();

  // Error real de DB → NUNCA se interpreta como primera consulta gratis.
  if (selErr) {
    console.error("[credits] fallo al leer profiles", { userId: user.id, err: selErr.message });
    return { ok: false, error: creditCheckFailed() };
  }

  // Fila ausente (el trigger no corrió / usuario previo): crearla contando esta consulta.
  if (!profile) {
    const { error: insErr } = await admin.from("profiles").insert({
      id: user.id,
      email: user.email,
      credits_used: 1,
      is_pro: false,
      plan: "free",
    });
    if (insErr) {
      console.error("[credits] fallo al crear profiles", { userId: user.id, err: insErr.message });
      return { ok: false, error: creditCheckFailed() };
    }
    return { ok: true, userId: user.id, isPro: false };
  }

  // Usuario Pro — acceso ilimitado.
  if (profile.is_pro) return { ok: true, userId: user.id, isPro: true };

  // Sin créditos disponibles.
  if ((profile.credits_used ?? 0) >= FREE_CREDITS) {
    return { ok: false, error: noCredits() };
  }

  // Consumir un crédito.
  const { error: updErr } = await admin
    .from("profiles")
    .update({ credits_used: (profile.credits_used ?? 0) + 1 })
    .eq("id", user.id);
  if (updErr) {
    console.error("[credits] fallo al consumir crédito", { userId: user.id, err: updErr.message });
    return { ok: false, error: creditCheckFailed() };
  }

  return { ok: true, userId: user.id, isPro: false };
}

/**
 * Devuelve un crédito ya consumido cuando la consulta no entregó un resultado
 * útil (saturación, timeout o cualquier otro fallo previo a la respuesta).
 * Best-effort: no lanza; los errores se registran pero no rompen la respuesta.
 *
 * Devuelve `true` cuando el crédito NO queda consumido: se reintegró, el
 * usuario es Pro (no gasta créditos) o no había userId. Devuelve `false`
 * solo si una operación de base de datos impidió confirmar el reintegro.
 */
export async function refundCredit(userId?: string): Promise<boolean> {
  if (!userId) return true;
  const admin = createAdminClient();

  const { data: profile, error: selErr } = await admin
    .from("profiles")
    .select("credits_used, is_pro")
    .eq("id", userId)
    .maybeSingle();
  if (selErr) {
    console.error("[credits] refund: fallo al leer profiles", { userId, err: selErr.message });
    return false;
  }
  if (!profile || profile.is_pro) return true;

  const next = Math.max(0, (profile.credits_used ?? 0) - 1);
  const { error: updErr } = await admin
    .from("profiles")
    .update({ credits_used: next })
    .eq("id", userId);
  if (updErr) {
    console.error("[credits] refund: fallo al devolver crédito", { userId, err: updErr.message });
    return false;
  }
  return true;
}
