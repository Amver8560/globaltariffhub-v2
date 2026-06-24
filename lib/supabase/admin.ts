// ─────────────────────────────────────────────────────────────
// GTH — Supabase Admin Client (service role)
// Solo para uso server-side: crons, seeds, admin routes
// NUNCA exponer al cliente
// ─────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
