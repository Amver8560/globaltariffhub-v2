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

  it("contención R3 — viability NO llama a calculateTaxes ni lo importa", () => {
    const src = read("app/api/viability/route.ts");
    expect(src, "viability importa calculateTaxes").not.toMatch(/import\s*\{[^}]*calculateTaxes/);
    expect(src, "viability llama calculateTaxes()").not.toMatch(/calculateTaxes\s*\(/);
    expect(src).toMatch(/not_included_notice/);
  });

  it("contención R3 — viability no arma precios sugeridos por multiplicador", () => {
    const src = read("app/api/viability/route.ts");
    expect(src).not.toMatch(/suggested_price_(min|unit|max)/);
    expect(src).not.toMatch(/landed_unit\s*\*/);
  });
});

describe("guardarraíl Bloque 3 — Incoterm + modelo de costos", () => {
  it("ninguna fórmula de seguro fija (0.005 / 0,5% hardcodeado) en viability / M3 / M4", () => {
    for (const p of ["app/api/viability/route.ts", "app/modulo03/page.tsx", "app/modulo04/page.tsx"]) {
      const src = read(p);
      expect(src, `${p} tiene 0.005 hardcodeado`).not.toMatch(/\*\s*0\.005\b/);
      expect(src, `${p} tiene "* 0.5 / 100" hardcodeado`).not.toMatch(/\*\s*0\.5\s*\/\s*100/);
    }
  });

  it("la fórmula de costo vive sólo en lib/landedCost.ts", () => {
    for (const p of ["app/api/viability/route.ts", "app/modulo03/page.tsx", "app/modulo04/page.tsx"]) {
      const src = read(p);
      expect(src, `${p} define cifBase =`).not.toMatch(/cifBase\s*=/);
      expect(src, `${p} suma fob_total + freight`).not.toMatch(/fob_total\s*\+\s*freight/);
    }
  });

  it("M3 ya no define un array local INCOTERMS con DAP/DDP/CPT", () => {
    const src = read("app/modulo03/page.tsx");
    expect(src).not.toMatch(/const\s+INCOTERMS\s*=\s*\[/);
    expect(src).not.toMatch(/code:\s*"DAP"|code:\s*"DDP"|code:\s*"CPT"/);
  });

  it("M4 — claves muertas del modelo anterior eliminadas del diccionario", () => {
    const src = read("app/modulo04/page.tsx");
    for (const k of ["landed_cost", "landed_unit", "tax_breakdown", "total_taxes", "tax_burden", "price_analysis", "suggested_min", "suggested_ref", "suggested_max"]) {
      expect(src, `M4 aún tiene la clave ${k}`).not.toMatch(new RegExp(`\\b${k}\\s*:`));
    }
  });

  it("no quedan rótulos 'Costo total CIF' / 'nacionalizado' en M3 y sus PDF", () => {
    for (const p of ["app/modulo03/page.tsx", "lib/exportPDF.ts"]) {
      const src = read(p);
      expect(src, `${p} usa 'Costo total CIF'`).not.toMatch(/Costo total CIF/i);
      expect(src, `${p} usa 'nacionalizad'`).not.toMatch(/nacionalizad/i);
      expect(src, `${p} usa 'COSTO TOTAL SIN CERTIFICADO'`).not.toMatch(/COSTO TOTAL SIN CERTIFICADO/i);
    }
  });

  it("opContext extiende con incoterm y NO con transport_mode", () => {
    const src = read("lib/opContext.ts");
    expect(src).toMatch(/incoterm\?:\s*string/);
    expect(src).not.toMatch(/transport_mode/);
  });

  it("Incoterms soportados: exactamente EXW/FCA/FOB/CFR/CIF; sin DAP/DDP/CPT/CIP calculables", () => {
    const src = read("lib/incoterms.ts");
    expect(src).toMatch(/"EXW"\s*\|\s*"FCA"\s*\|\s*"FOB"\s*\|\s*"CFR"\s*\|\s*"CIF"/);
    expect(src).not.toMatch(/"DAP"|"DDP"|"CPT"|"CIP"/);
  });
});

describe("corrección — un TariffDatum en continuidad (M01 → M03)", () => {
  it("M01 ya no renderiza r.taxes[] como aranceles compitiendo con el TariffDatum", () => {
    const src = read("app/modulo01/page.tsx");
    expect(src, "M01 aún itera r.taxes con tax.rate").not.toMatch(/r\.taxes\.map\([^)]*tax[^)]*\)/);
    expect(src).not.toMatch(/🌐 Aranceles en destino/);
    expect(src).not.toMatch(/\{tax\.rate\}/);
  });

  it("exportSearchPDF ya no imprime la sección de r.taxes[]", () => {
    const src = read("lib/exportPDF.ts");
    expect(src).not.toMatch(/ARANCELES EN DESTINO|DESTINATION TARIFFS/);
    expect(src).not.toMatch(/r\.taxes\.forEach/);
  });

  it("M01 transmite el TariffDatum completo (tariff_datum) en el enlace", () => {
    const src = read("app/modulo01/page.tsx");
    expect(src).toMatch(/tariff_datum:\s*g\s*\?\s*JSON\.stringify\(g\)/);
  });

  it("opContext transporta tariff_datum / pref_tariff_datum", () => {
    const src = read("lib/opContext.ts");
    expect(src).toMatch(/tariff_datum\?:\s*string/);
    expect(src).toMatch(/pref_tariff_datum\?:\s*string/);
  });

  it("M03 NO re-ejecuta el fetch de arancel cuando llega un tariff_datum", () => {
    const src = read("app/modulo03/page.tsx");
    expect(src).toMatch(/if\s*\(\s*searchParams\.get\(["']tariff_datum["']\)\s*\)\s*return;/);
  });

  it("M03 reutiliza el datum recibido (lo parsea y lo muestra)", () => {
    const src = read("app/modulo03/page.tsx");
    expect(src).toMatch(/JSON\.parse\(ctx\.tariff_datum\)/);
    expect(src).toMatch(/datum=\{receivedDatum\}/);
  });
});

describe("correcciones de flujo — M01 orden / moneda / incoterm neutral", () => {
  it("useFxCurrency no asume USD cuando la moneda es ''", () => {
    const src = read("lib/useFxCurrency.ts");
    expect(src).toMatch(/if\s*\(!currency\)\s*return\s*"";/);
  });

  it("M03 inicializa la moneda desde el contexto, no fija USD", () => {
    const src = read("app/modulo03/page.tsx");
    expect(src).toMatch(/useFxCurrency\(searchParams\.get\(["']currency["']\)\s*\|\|\s*""\)/);
  });

  it("M03 — Incoterm: indicación neutral al entrar, error rojo sólo con precio cargado", () => {
    const src = read("app/modulo03/page.tsx");
    expect(src).toMatch(/n\(declaredValue\)\s*>\s*0[\s\S]{0,120}incoterm_pick[\s\S]{0,120}incoterm_help/);
  });

  it("M01 — nomenclatura determinada por la jurisdicción del destino", () => {
    const src = read("app/modulo01/page.tsx");
    expect(src).toMatch(/setDestination\(v\);\s*if\s*\(v\)\s*setSystem\(getSystemForCountry\(v\)\)/);
  });
});
