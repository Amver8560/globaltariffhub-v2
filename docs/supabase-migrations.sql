-- ─────────────────────────────────────────────────────────────
-- GTH — Supabase Migrations
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════
-- TABLA: taric_codes
-- Almacena todos los códigos TARIC sincronizados desde CIRCABC
-- Se actualiza diariamente via cron /api/admin/sync-taric
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS taric_codes (
  id                BIGSERIAL PRIMARY KEY,
  commodity_code    VARCHAR(10) NOT NULL UNIQUE,  -- Código TARIC 10 dígitos
  description       TEXT,                          -- Descripción en español
  description_en    TEXT,                          -- Descripción en inglés
  parent_code       VARCHAR(10),                   -- Código padre en jerarquía
  chapter           VARCHAR(2),                    -- Capítulo (2 dígitos)
  section           VARCHAR(5),                    -- Sección romana (I-XXI)
  duty_rate         VARCHAR(50),                   -- Tasa Erga Omnes (ej: "12%")
  unit              VARCHAR(50),                   -- Unidad de medida
  footnote_ids      TEXT[],                        -- IDs de footnotes aplicables
  footnotes         TEXT[],                        -- Textos de notas y exclusiones
  measure_types     TEXT[],                        -- Tipos de medidas adicionales
  valid_from        DATE,                          -- Vigente desde
  valid_to          DATE,                          -- Vigente hasta (NULL = vigente)
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_taric_chapter ON taric_codes(chapter);
CREATE INDEX IF NOT EXISTS idx_taric_parent  ON taric_codes(parent_code);
CREATE INDEX IF NOT EXISTS idx_taric_updated ON taric_codes(updated_at DESC);

-- Búsqueda de texto en descripción
CREATE INDEX IF NOT EXISTS idx_taric_desc_fts
  ON taric_codes USING gin(to_tsvector('spanish', COALESCE(description, '')));

-- ═══════════════════════════════════════════════════════════
-- TABLA: sync_log
-- Registro de sincronizaciones realizadas
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sync_log (
  id          BIGSERIAL PRIMARY KEY,
  source      VARCHAR(50) NOT NULL,   -- "taric", "ncm", "wto"
  records     INTEGER DEFAULT 0,
  errors      INTEGER DEFAULT 0,
  synced_at   TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT
);

-- ═══════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- taric_codes: lectura pública, escritura solo service role
-- ═══════════════════════════════════════════════════════════
ALTER TABLE taric_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log    ENABLE ROW LEVEL SECURITY;

-- Lectura pública para taric_codes (datos arancelarios oficiales)
CREATE POLICY "taric_codes_public_read"
  ON taric_codes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo service role puede insertar/actualizar
CREATE POLICY "taric_codes_service_write"
  ON taric_codes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- sync_log solo service role
CREATE POLICY "sync_log_service_only"
  ON sync_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- FUNCIÓN: buscar códigos TARIC por descripción (full text)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION search_taric(query TEXT)
RETURNS SETOF taric_codes AS $$
  SELECT * FROM taric_codes
  WHERE
    to_tsvector('spanish', COALESCE(description, '')) @@ plainto_tsquery('spanish', query)
    OR commodity_code ILIKE query || '%'
  ORDER BY
    CASE WHEN commodity_code ILIKE query || '%' THEN 0 ELSE 1 END,
    LENGTH(commodity_code)
  LIMIT 20;
$$ LANGUAGE sql STABLE;
