# GTH — Fuentes Oficiales de Referencia

Registro de fuentes oficiales que GTH debe monitorear y citar.
Actualizar cuando haya cambios normativos.

---

## 🇦🇷 Argentina — Sistema de Importaciones

### Cambios al sistema de importaciones (SIRA → SEDI)
- **URL:** https://www.argentina.gob.ar/noticias/cambios-en-el-sistema-de-importaciones
- **Organismo:** Secretaría de Comercio / AFIP / Banco Central (BCRA)
- **Fecha referencia:** Junio 2026
- **Resumen de cambios:**
  - Se eliminó el sistema SIRA (Sistema de Importaciones de la República Argentina)
  - Se implementó el **SEDI** (Sistema Estadístico de Importaciones) — declaración jurada informativa en AFIP
  - Se eliminaron licencias y permisos discrecionales para importar
  - Se mantienen controles técnicos de SENASA y ANMAT
- **Normativas clave:**
  - Resolución Conjunta 5466/23 (Secretaría de Comercio + AFIP)
  - Resolución 1/2023 (Secretaría de Comercio) — deroga la 523/2017
  - Comunicación A 7918 BCRA (Bopreal)
  - Comunicación A 7917 BCRA (plazos de pago)
- **Nota GTH:** Argentina cambia frecuentemente su sistema de importaciones. Verificar esta fuente mensualmente y actualizar los documentos requeridos en el módulo de búsqueda.

---

## 🌎 MERCOSUR — NCM y AEC

### Nomenclatura Común NCM y Arancel Externo Común
- **URL:** https://mercosur.int/politica-comercial/nomenclatura-comun-ncm-y-arancel-externo-comun-aec/
- **URL notas por código:** https://polcom.mercosur.int/nomenclatura/notas/{id}
- **Organismo:** Secretaría del MERCOSUR
- **Datos disponibles:** Códigos NCM 8 dígitos, tasas AEC, notas de sección y capítulo, exclusiones
- **Acceso API:** Requiere autenticación (no pública). Alternativa: Siscomex Brasil (API pública)
- **Nota GTH:** Las notas de capítulo contienen exclusiones críticas que cambian la clasificación. Ej: extracto de regaliz con >10% sacarosa → partida 17.04, no 13.02.

---

## 🇧🇷 Brasil — Siscomex NCM (alternativa pública)

### API NCM Brasil (cubre estándar MERCOSUR)
- **URL API:** https://brasilapi.com.br/api/ncm/v1/{codigo}
- **Organismo:** Receita Federal / Siscomex
- **Autenticación:** Ninguna (pública)
- **Formato:** JSON
- **Cobertura:** Códigos NCM completos con descripción
- **Nota GTH:** Misma nomenclatura que Argentina/Uruguay/Paraguay por acuerdo MERCOSUR.

---

## 🇪🇺 Unión Europea — TARIC

### Base de datos TARIC completa
- **URL consulta web:** https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp
- **Descarga bulk:** CIRCABC (Comisión Europea) — actualización diaria a las 19:15 hs Bruselas
- **Formato:** XML completo
- **Datos disponibles:** Códigos TARIC, tasas, cuotas, footnotes, notas de capítulo, exclusiones
- **Autenticación:** Ninguna para descarga anónima
- **Contacto técnico:** TAXUD-DDS-TARIC@ec.europa.eu
- **Nota GTH:** Fuente más completa disponible gratuitamente. Requiere parseo XML y almacenamiento local.

---

## 🌐 WTO — HS Tasas MFN

### WTO Tariff API
- **URL:** https://apiportal.wto.org/
- **Endpoint tasas:** https://api.wto.org/timeseries/v1/data
- **Autenticación:** API key gratuita (registro en apiportal.wto.org)
- **Datos disponibles:** Tasas MFN aplicadas por código HS 6 dígitos, año, país
- **Datos NO disponibles:** Notas de capítulo, exclusiones (son del WCO, con copyright)
- **Variable de entorno GTH:** `WTO_API_KEY`
- **Estado integración:** ✅ Integrado en `/api/tariff-rate` y `/api/search`

---

## Calendario de monitoreo sugerido

| Fuente | Frecuencia | Motivo |
|---|---|---|
| argentina.gob.ar importaciones | Mensual | Argentina cambia el sistema con frecuencia |
| MERCOSUR AEC | Trimestral | Cambios en tasas del AEC |
| TARIC (EU) | Diaria (automatizar) | Se actualiza todos los días |
| WTO MFN rates | Anual | Datos del año anterior disponibles |
| Siscomex NCM Brasil | Semestral | Cambios de nomenclatura |
