// ─────────────────────────────────────────────────────────────
// GTH — NCM API Integration
// Fuente: BrasilAPI (brasilapi.com.br) — cubre estándar MERCOSUR
// Datos: códigos NCM 8 dígitos, descripción completa, notas
// Sin autenticación requerida — API pública gratuita
// ─────────────────────────────────────────────────────────────

export interface NCMResult {
  codigo: string;           // NCM 8 dígitos: "13021110"
  descricao: string;        // Descripción oficial en portugués
  descricao_es?: string;    // Traducción al español (via Claude si disponible)
  data_inicio: string;      // Vigente desde
  data_fim: string;         // Vigente hasta ("31/12/9999" = vigente)
  tipo_ato: string;
  numero_ato: string;
  ano_ato: string;
  source: "NCM" | "fallback";
}

export interface NCMChapterResult {
  codigo: string;
  descricao: string;
  filhos?: NCMChapterResult[];
}

// Cache en memoria (TTL 24h)
const cache = new Map<string, { data: NCMResult | null; ts: number }>();
const chapterCache = new Map<string, { data: NCMChapterResult[]; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const BASE_URL = "https://brasilapi.com.br/api/ncm/v1";

/**
 * Busca un código NCM específico (8 dígitos)
 * Ej: "13021110" → Concentrados de paja de adormidera
 */
export async function getNCMCode(ncm8: string): Promise<NCMResult | null> {
  const code = ncm8.replace(/\D/g, "").slice(0, 8);
  if (code.length < 6) return null;

  const cached = cache.get(code);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetch(`${BASE_URL}/${code}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      cache.set(code, { data: null, ts: Date.now() });
      return null;
    }

    const data = await res.json();

    // BrasilAPI devuelve array con un item
    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return null;

    const result: NCMResult = {
      codigo: item.codigo,
      descricao: item.descricao,
      data_inicio: item.data_inicio,
      data_fim: item.data_fim,
      tipo_ato: item.tipo_ato,
      numero_ato: item.numero_ato,
      ano_ato: item.ano_ato,
      source: "NCM",
    };

    cache.set(code, { data: result, ts: Date.now() });
    return result;

  } catch {
    return null;
  }
}

/**
 * Busca NCMs por texto de descripción
 * Ej: "regaliz" → lista de códigos NCM que contienen esa palabra
 */
export async function searchNCMByDescription(query: string): Promise<NCMResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`${BASE_URL}?search=${encoded}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 10).map((item: any) => ({
      codigo: item.codigo,
      descricao: item.descricao,
      data_inicio: item.data_inicio,
      data_fim: item.data_fim,
      tipo_ato: item.tipo_ato,
      numero_ato: item.numero_ato,
      ano_ato: item.ano_ato,
      source: "NCM" as const,
    }));

  } catch {
    return [];
  }
}

/**
 * Normaliza código NCM: "1302.11.10" → "13021110"
 */
export function normalizeNCM8(code: string): string {
  return code.replace(/\D/g, "").slice(0, 8);
}

/**
 * Extrae capítulo NCM (primeros 2 dígitos): "13021110" → "13"
 */
export function getNCMChapter(ncm8: string): string {
  return ncm8.replace(/\D/g, "").slice(0, 2);
}

/**
 * Verifica si un código NCM está vigente
 */
export function isNCMVigente(result: NCMResult): boolean {
  if (!result.data_fim) return true;
  const parts = result.data_fim.split("/");
  if (parts.length !== 3) return true;
  const year = parseInt(parts[2]);
  return year >= new Date().getFullYear();
}
