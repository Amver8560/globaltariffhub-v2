// ─────────────────────────────────────────────────────────────
// GTH — API Admin: sincronizar TARIC desde CIRCABC → Supabase
// POST /api/admin/sync-taric
// Headers: { "x-admin-key": GTH_ADMIN_KEY }
// También se activa por Vercel Cron (vercel.json)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { syncTARICToSupabase } from "@/lib/taricSync";

export const maxDuration = 300; // 5 minutos — la sincronización puede tardar

export async function POST(req: NextRequest) {
  // Verificar clave de admin
  const adminKey = req.headers.get("x-admin-key") ||
    (await req.json().catch(() => ({}))).admin_key;

  if (adminKey !== process.env.GTH_ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await syncTARICToSupabase();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}

// Vercel Cron — se activa automáticamente según vercel.json
export async function GET(req: NextRequest) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await syncTARICToSupabase();
  return NextResponse.json(result);
}
