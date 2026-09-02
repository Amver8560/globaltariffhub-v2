import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock del cliente de Supabase (service-role) ──────────────
type SelResult = { data: unknown; error: unknown };
type UpdResult = { error: unknown };

const state: {
  sel: SelResult;
  upd: UpdResult;
  updateArg: Record<string, unknown> | null;
} = {
  sel: { data: null, error: null },
  upd: { error: null },
  updateArg: null,
};

function makeAdmin() {
  return {
    from() {
      return {
        select() {
          return {
            eq() {
              return { maybeSingle: async () => state.sel };
            },
          };
        },
        update(arg: Record<string, unknown>) {
          state.updateArg = arg;
          return { eq: async () => state.upd };
        },
      };
    },
  };
}

vi.mock("next/server", () => ({ NextResponse: { json: (b: unknown) => b } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => makeAdmin() }));

import { refundCredit } from "@/lib/credits";

beforeEach(() => {
  state.sel = { data: null, error: null };
  state.upd = { error: null };
  state.updateArg = null;
});

describe("refundCredit — contrato de retorno (Bloque 1)", () => {
  it("sin userId → true, no toca la base", async () => {
    expect(await refundCredit(undefined)).toBe(true);
    expect(state.updateArg).toBeNull();
  });

  it("usuario Pro → true, no descuenta ni actualiza", async () => {
    state.sel = { data: { credits_used: 2, is_pro: true }, error: null };
    expect(await refundCredit("u1")).toBe(true);
    expect(state.updateArg).toBeNull();
  });

  it("perfil ausente → true (nada que reintegrar)", async () => {
    state.sel = { data: null, error: null };
    expect(await refundCredit("u1")).toBe(true);
  });

  it("camino feliz → true y decrementa credits_used sin bajar de 0", async () => {
    state.sel = { data: { credits_used: 2, is_pro: false }, error: null };
    expect(await refundCredit("u1")).toBe(true);
    expect(state.updateArg).toEqual({ credits_used: 1 });
  });

  it("credits_used ya en 0 → no baja de 0", async () => {
    state.sel = { data: { credits_used: 0, is_pro: false }, error: null };
    expect(await refundCredit("u1")).toBe(true);
    expect(state.updateArg).toEqual({ credits_used: 0 });
  });

  it("error al leer profiles → false (no se pudo confirmar el reintegro)", async () => {
    state.sel = { data: null, error: { message: "db read failed" } };
    expect(await refundCredit("u1")).toBe(false);
    expect(state.updateArg).toBeNull();
  });

  it("error al actualizar → false", async () => {
    state.sel = { data: { credits_used: 3, is_pro: false }, error: null };
    state.upd = { error: { message: "db write failed" } };
    expect(await refundCredit("u1")).toBe(false);
  });
});
