"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LAUNCH_OFFER_END = new Date("2025-07-22T23:59:59");

function daysLeft() {
  const diff = LAUNCH_OFFER_END.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const MODULES = [
  { href: "/modulo01", emoji: "🔍", title: "Búsqueda Arancelaria", desc: "Consultá posiciones HS, NCM y TARIC con tasa arancelaria y datos de origen/destino.", badge: "M01" },
  { href: "/modulo02", emoji: "📄", title: "Ahorro arancelario según el país de origen", desc: "Analizá si tu operación califica para tasa preferencial y qué certificado de origen necesitás.", badge: "M02" },
  { href: "/modulo03", emoji: "📦", title: "Calculadora CIF", desc: "Calculá el costo CIF exacto con flete, seguro y todos los tributos por país.", badge: "M03" },
  { href: "/modulo04", emoji: "💡", title: "Viabilidad de Importación", desc: "Analizá si el negocio cierra: costo nacionalizado, margen y precio de venta sugerido.", badge: "M04" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const days = daysLeft();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // Cargar perfil con créditos
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const creditsUsed = profile?.credits_used ?? 0;
  const isPro = profile?.is_pro ?? false;
  const creditsTotal = 3;
  const creditsLeft = Math.max(0, creditsTotal - creditsUsed);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#FFF", fontFamily: "Arial, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#0057FF,#0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{user?.user_metadata?.full_name || user?.email}</span>
          <Link href="/actualizar-clave" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Cambiar contraseña
          </Link>
          <button onClick={handleLogout} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
            Salir
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {/* Encabezado */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Centro de inteligencia arancelaria</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Elegí un módulo para empezar tu análisis.</p>
        </div>

        {/* Banner oferta lanzamiento */}
        {days > 0 && !isPro && (
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid #C9A84C", borderRadius: 14, padding: "20px 24px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#C9A84C", marginBottom: 4 }}>⚡ OFERTA DE LANZAMIENTO — {days} días restantes</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Plan anual con 2 meses gratis · <s style={{ color: "rgba(255,255,255,0.35)" }}>USD 290</s> → <strong>USD 238/año</strong></p>
            </div>
            <Link href="/pricing" style={{ padding: "10px 24px", borderRadius: 10, background: "#C9A84C", color: "#000", fontSize: 13, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
              Aprovechar oferta →
            </Link>
          </div>
        )}

        {/* Estado de cuenta */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 36 }}>
          {/* Créditos */}
          <div style={{ background: "#0D1B3E", borderRadius: 14, padding: 20, border: "1px solid rgba(0,87,255,0.2)" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Consultas disponibles</p>
            {isPro ? (
              <>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>∞</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Plan activo</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 28, fontWeight: 800, color: creditsLeft > 0 ? "#FFF" : "#ef4444" }}>{creditsLeft}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}> / {creditsTotal}</span></p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Consultas gratuitas</p>
              </>
            )}
          </div>

          {/* Plan */}
          <div style={{ background: "#0D1B3E", borderRadius: 14, padding: 20, border: `1px solid ${isPro ? "rgba(34,197,94,0.3)" : "rgba(0,87,255,0.2)"}` }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Plan actual</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: isPro ? "#22c55e" : "#C9A84C" }}>{isPro ? "Pro ✓" : "Gratis"}</p>
            {!isPro && <Link href="/pricing" style={{ fontSize: 12, color: "#0057FF", textDecoration: "none", fontWeight: 700 }}>Actualizar →</Link>}
          </div>

          {/* Consultas usadas */}
          <div style={{ background: "#0D1B3E", borderRadius: 14, padding: 20, border: "1px solid rgba(0,87,255,0.2)" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Consultas realizadas</p>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{creditsUsed}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Total acumulado</p>
          </div>
        </div>

        {/* Módulos */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "rgba(255,255,255,0.7)" }}>Módulos disponibles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 40 }}>
          {MODULES.map((mod) => {
            const locked = !isPro && creditsLeft === 0;
            return (
              <div key={mod.href} style={{ position: "relative" }}>
                <Link
                  href={locked ? "/pricing" : mod.href}
                  style={{ display: "block", background: "#0D1B3E", borderRadius: 14, padding: 22, border: "1px solid rgba(0,87,255,0.2)", textDecoration: "none", color: "#FFF", opacity: locked ? 0.5 : 1, transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{mod.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0,87,255,0.2)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 6, padding: "2px 8px", color: "#6B9FFF" }}>{mod.badge}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{mod.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{mod.desc}</p>
                  {locked && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 10, fontWeight: 700 }}>🔒 Activá un plan para continuar</p>}
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA si sin plan */}
        {!isPro && (
          <div style={{ background: "linear-gradient(135deg, #0D1B3E, #0A1628)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 16, padding: "32px 36px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Desbloqueá acceso ilimitado</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>Consultas ilimitadas en todos los módulos, exportación PDF y actualizaciones mensuales de tasas.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pricing" style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Ver planes →
              </Link>
              {days > 0 && (
                <Link href="/pricing?plan=annual" style={{ padding: "12px 28px", borderRadius: 10, background: "rgba(201,168,76,0.15)", border: "1px solid #C9A84C", color: "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  ⚡ Oferta anual — {days} días
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
