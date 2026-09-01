import { NextRequest, NextResponse } from "next/server";
import { getRate } from "@/lib/fxApi";

// GET /api/fx?to=ARS[&base=USD]  →  { rate, date, source, to, base }
// Público (no consume créditos): es solo tipo de cambio de referencia.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = (searchParams.get("to") || "").toUpperCase();
  const base = (searchParams.get("base") || "USD").toUpperCase();

  if (!to) {
    return NextResponse.json({ error: "Falta el parámetro 'to' (ej: ARS)" }, { status: 400 });
  }

  const r = await getRate(to, base);
  return NextResponse.json(
    { base, ...r },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
  );
}
