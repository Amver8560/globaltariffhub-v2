import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ── Guardarraíl — no quedan defaults numéricos de tasa ni códigos por padding ──
const root = fileURLToPath(new URL("..", import.meta.url));
const read = (p: string) => readFileSync(root + p, "utf8");

describe("guardarraíl Bloque 2", () => {
  it("no hay `tariff_rate: 14` ni `|| 14` / `|| 6` como fallback de tasa en las rutas", () => {
    for (const p of [
      "app/api/viability/route.ts",
      "app/api/tariff-rate/route.ts",
      "app/api/search/route.ts",
      "app/api/certificate/route.ts",
    ]) {
      const src = read(p);
      expect(src, `${p} contiene 'tariff_rate: 14'`).not.toMatch(/tariff_rate:\s*14\b/);
      expect(src, `${p} contiene '|| 14' o '|| 6' (fallback de tasa)`).not.toMatch(/\|\|\s*1?4\b|\|\|\s*6\b/);
    }
  });

  it("las rutas ya no fuerzan confidence a 'alta' / 'high'", () => {
    for (const p of ["app/api/tariff-rate/route.ts", "app/api/search/route.ts"]) {
      const src = read(p);
      expect(src, `${p} fuerza confidence`).not.toMatch(/confidence\s*=\s*["'](alta|high)["']/);
    }
  });

  it("taricApi ya no exporta hs6ToTaric (generador de código por padding)", () => {
    const src = read("lib/taricApi.ts");
    expect(src).not.toMatch(/export function hs6ToTaric/);
  });

  it("el resolvedor no arma códigos con padEnd de ceros", () => {
    const src = read("lib/tariffResolver.ts");
    expect(src).not.toMatch(/padEnd\(\s*(8|10)\s*,\s*["']0["']\s*\)/);
  });

  it("wtoApi: Estados Unidos = 840 (F17)", () => {
    const src = read("lib/wtoApi.ts");
    expect(src).toMatch(/"Estados Unidos":\s*"840"/);
    expect(src).not.toMatch(/"Estados Unidos":\s*"842"/);
  });
});
