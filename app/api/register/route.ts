// ─────────────────────────────────────────────────────────────
// GTH — Alta de usuario + registro de consentimiento (server-side)
//
// Flujo:
//   1. Validar entrada + 3 consentimientos legales obligatorios.
//   2. supabase.auth.signUp (SSR client → setea cookie de sesión en la respuesta).
//   3. recordConsent(userId). Si falla: 1 reintento inmediato idempotente.
//   4. Si el reintento también falla: deshacer el alta (admin.deleteUser),
//      cerrar sesión y limpiar TODAS las cookies sb-* de la respuesta,
//      devolver 503 (o 500 si deleteUser también falla) + log estructurado.
//
// raw_user_meta_data NO se usa como fuente de verdad ni cola de recuperación.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordConsent, type ConsentPayload } from "@/lib/consent";

type PendingCookie = { name: string; value: string; options: CookieOptions };

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function orNull(v: unknown): string | null {
  const s = str(v).trim();
  return s ? s : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const email = str(body.email).trim();
  const password = str(body.password);
  const name = str(body.name).trim();
  const marketing = body.marketing === true;
  const consents = (body.consents ?? {}) as Record<string, unknown>;

  const signup_source = orNull(body.signup_source) ?? "direct";
  const utm_source = orNull(body.utm_source);
  const utm_medium = orNull(body.utm_medium);
  const utm_campaign = orNull(body.utm_campaign);

  // ── Validación ──────────────────────────────────────────────
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "El email no parece válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (consents.terms !== true || consents.privacy !== true || consents.legal !== true) {
    return NextResponse.json(
      {
        ok: false,
        error: "Tenés que aceptar los Términos de Uso, la Política de Privacidad y el Aviso Legal.",
      },
      { status: 400 }
    );
  }

  // ── Cliente SSR con recolección de cookies ──────────────────
  const pending: PendingCookie[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(toSet) {
          for (const { name, value, options } of toSet) pending.push({ name, value, options });
        },
      },
    }
  );

  // Camino normal: replica en la respuesta las cookies que emitió Supabase
  // (incluida la sesión creada por signUp cuando la confirmación está OFF).
  const applyCookies = (res: NextResponse) => {
    for (const { name, value, options } of pending) res.cookies.set(name, value, options);
    return res;
  };

  // Camino de compensación: NO replica la sesión. Expira toda cookie sb-*
  // que signUp haya intentado setear (`pending`) y toda sb-* que venga en la
  // request. El usuario queda completamente fuera de sesión.
  const clearAllSupabaseCookies = (res: NextResponse) => {
    const names = new Set<string>();
    for (const c of pending) if (c.name.startsWith("sb-")) names.add(c.name);
    for (const c of req.cookies.getAll()) if (c.name.startsWith("sb-")) names.add(c.name);
    for (const name of names) res.cookies.set(name, "", { maxAge: 0, path: "/" });
    return res;
  };

  // ── 2. Alta en Supabase Auth ───────────────────────────────
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, signup_source, utm_source, utm_medium, utm_campaign },
      emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    const m = error.message.toLowerCase();
    let msg = "No pudimos crear la cuenta. Intentá de nuevo en un momento.";
    if (m.includes("already registered") || m.includes("already exists") || error.status === 422) {
      msg = "Ya existe una cuenta con ese email. Probá iniciar sesión o recuperar tu contraseña.";
    } else if (m.includes("rate limit") || m.includes("too many") || m.includes("email send")) {
      msg = "Estamos recibiendo muchos registros en este momento. Esperá unos minutos y volvé a intentar.";
    } else if (m.includes("signups not allowed") || m.includes("disabled")) {
      msg = "El registro está temporalmente deshabilitado. Escribinos a analia@globaltariffhub.com.";
    } else if (m.includes("database error")) {
      msg = "Hubo un problema al crear tu cuenta. Escribinos a analia@globaltariffhub.com y lo resolvemos.";
    } else if (m.includes("invalid") && m.includes("email")) {
      msg = "El email no parece válido. Revisalo e intentá de nuevo.";
    }
    return applyCookies(NextResponse.json({ ok: false, error: msg, code: "SIGNUP_FAILED" }, { status: 400 }));
  }

  const userId = data.user?.id;
  if (!userId) {
    return applyCookies(
      NextResponse.json(
        { ok: false, error: "No pudimos crear la cuenta. Intentá de nuevo.", code: "SIGNUP_FAILED" },
        { status: 400 }
      )
    );
  }

  // ── 3. Registro de consentimiento (idempotente) + 1 reintento ──
  const payload: ConsentPayload = { marketing, signup_source, utm_source, utm_medium, utm_campaign };

  try {
    await recordConsent(userId, payload);
  } catch (err1) {
    console.warn("[register] recordConsent falló, reintentando", {
      userId,
      err: String(err1),
    });
    await new Promise((r) => setTimeout(r, 250));
    try {
      await recordConsent(userId, payload);
    } catch (err2) {
      console.error("[register] recordConsent falló tras reintento — compensando", {
        userId,
        email,
        err: String(err2),
      });

      // ── 4. Compensación: deshacer el alta + limpiar sesión ──
      let deleted = false;
      try {
        const admin = createAdminClient();
        const { error: delErr } = await admin.auth.admin.deleteUser(userId);
        if (delErr) throw delErr;
        deleted = true;
      } catch (delErr) {
        console.error("[register] usuario huérfano sin consentimiento — limpieza MANUAL requerida", {
          userId,
          email,
          err: String(delErr),
        });
      }

      // Invalidar la sesión local creada por signUp (revoca el estado del cliente SSR).
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {}

      const res = NextResponse.json(
        deleted
          ? {
              ok: false,
              code: "CONSENT_PERSIST_FAILED",
              error: "No pudimos completar el registro. Probá de nuevo en unos minutos.",
            }
          : {
              ok: false,
              code: "REGISTRATION_INCOMPLETE",
              error:
                "Tu cuenta se creó pero hubo un problema al completarla. Escribinos a analia@globaltariffhub.com y lo resolvemos.",
            },
        { status: deleted ? 503 : 500 }
      );
      // NO se aplican las cookies de sesión: se expiran todas.
      clearAllSupabaseCookies(res);
      return res;
    }
  }

  // ── OK ─────────────────────────────────────────────────────
  return applyCookies(NextResponse.json({ ok: true, session: !!data.session }));
}
