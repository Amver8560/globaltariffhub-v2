import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/modulo01", "/modulo03", "/modulo04", "/modulo05"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Bloqueo global del sitio ────────────────────────────────────────────────
  // Si SITE_PASSWORD está definido en Vercel, el sitio es privado.
  // Para activar: agregar SITE_PASSWORD=tu-contraseña en Vercel → Settings → Environment Variables
  // Para desactivar (lanzar al público): eliminar esa variable.
  const sitePassword = process.env.SITE_PASSWORD;
  const isAccessPage = pathname === "/acceso";
  const isSiteAccessApi = pathname === "/api/site-access";

  if (sitePassword && !isAccessPage && !isSiteAccessApi) {
    const cookie = request.cookies.get("site_access");
    if (!cookie || cookie.value !== sitePassword) {
      const url = request.nextUrl.clone();
      url.pathname = "/acceso";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
