"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MARKETING_CONSENT_TEXT } from "@/lib/legalVersions";

const CONTACT_EMAIL = "analia@globaltariffhub.com";

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
  const [marketingOn, setMarketingOn] = useState<boolean | null>(null);
  const [mktBusy, setMktBusy] = useState(false);

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

      // Preferencia de comunicaciones (marketing). Sin fila → OFF.
      const { data: uc } = await supabase
        .from("user_consents")
        .select("marketing_consent")
        .eq("user_id", user.id)
        .maybeSingle();
      setMarketingOn(uc?.marketing_consent ?? false);

      setLoading(false);
    };
    load();
  }, [router]);

  const toggleMarketing = async () => {
    if (mktBusy || marketingOn === null) return;
    const next = !marketingOn;
    setMktBusy(true);
    try {
      const res = await fetch("/api/consent/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j?.ok) setMarketingOn(typeof j.marketing_consent === "boolean" ? j.marketing_consent : next);
    } finally {
      setMktBusy(false);
    }
  };

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

        {/* Banner apertura anticipada */}
        {!isPro && (
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid #C9A84C", borderRadius: 14, padding: "20px 24px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#C9A84C", marginBottom: 4 }}>APERTURA ANTICIPADA — 01 al 04 de septiembre</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Tenés 3 consultas gratuitas para recorrer todos los módulos. Cuando abramos los planes te vamos a avisar.</p>
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
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Consultas gratuitas · apertura 01–04 sep</p>
              </>
            )}
          </div>

          {/* Plan */}
          <div style={{ background: "#0D1B3E", borderRadius: 14, padding: 20, border: `1px solid ${isPro ? "rgba(34,197,94,0.3)" : "rgba(0,87,255,0.2)"}` }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Plan actual</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: isPro ? "#22c55e" : "#C9A84C" }}>{isPro ? "Pro ✓" : "Gratis"}</p>
            {!isPro && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Apertura anticipada</p>}
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
                  href={locked ? `mailto:${CONTACT_EMAIL}` : mod.href}
                  style={{ display: "block", background: "#0D1B3E", borderRadius: 14, padding: 22, border: "1px solid rgba(0,87,255,0.2)", textDecoration: "none", color: "#FFF", opacity: locked ? 0.5 : 1, transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{mod.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0,87,255,0.2)", border: "1px solid rgba(0,87,255,0.4)", borderRadius: 6, padding: "2px 8px", color: "#6B9FFF" }}>{mod.badge}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{mod.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{mod.desc}</p>
                  {locked && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 10, fontWeight: 700 }}>Usaste tus 3 consultas — escribinos para seguir usándolo →</p>}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Comunicaciones */}
        <div style={{ background: "#0D1B3E", borderRadius: 14, padding: 20, border: "1px solid rgba(0,87,255,0.2)", marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Comunicaciones</p>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 520 }}>{MARKETING_CONSENT_TEXT}</p>
            <button
              onClick={toggleMarketing}
              disabled={mktBusy || marketingOn === null}
              style={{
                flexShrink: 0,
                padding: "8px 18px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: marketingOn ? "#22c55e" : "rgba(255,255,255,0.2)",
                background: marketingOn ? "rgba(34,197,94,0.15)" : "transparent",
                color: marketingOn ? "#22c55e" : "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: 700,
                cursor: mktBusy || marketingOn === null ? "not-allowed" : "pointer",
              }}
            >
              {marketingOn === null ? "…" : mktBusy ? "Guardando…" : marketingOn ? "Activadas" : "Desactivadas"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
            {marketingOn === null
              ? ""
              : marketingOn
              ? "Estás recibiendo estas comunicaciones. Podés desactivarlas cuando quieras."
              : "No vas a recibir estas comunicaciones. Podés volver a activarlas cuando quieras."}
          </p>
        </div>

        {/* Contacto — apertura anticipada */}
        {!isPro && (
          <div style={{ background: "linear-gradient(135deg, #0D1B3E, #0A1628)", border: "1px solid rgba(0,87,255,0.3)", borderRadius: 16, padding: "32px 36px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Estás en la apertura anticipada</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>Tenés 3 consultas gratuitas en todos los módulos. Cuando abramos los planes te vamos a avisar. ¿Necesitás más consultas ahora? Escribinos.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#0057FF,#003DB3)", color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Escribinos →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
