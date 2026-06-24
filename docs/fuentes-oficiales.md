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

## 🌐 Global Trade Alert — Medidas Comerciales en Tiempo Real

### Base de datos de intervenciones comerciales globales
- **URL:** https://www.globaltradealert.org/
- **Organismo:** Universidad de St. Gallen (Suiza) — independiente
- **Datos disponibles:**
  - Medidas proteccionistas y liberalizadoras por país y sector
  - Subsidios, aranceles adicionales, barreras no arancelarias (NTB)
  - Alertas de nuevas medidas en tiempo real
  - Cobertura desde 2009 hasta hoy
  - Filtros por país exportador, importador, producto (código HS), tipo de medida
- **Autenticación:** Pública (acceso libre a informes)
- **Relevancia para GTH:**
  - Detectar barreras no visibles en el arancel base (ej: medidas antidumping, cuotas especiales)
  - Alertar al usuario cuando su código HS está afectado por una medida reciente
  - Complementa WTO MFN y TARIC con información de medidas "en la práctica"
- **Nota GTH:** Monitorear mensualmente por país/sectores relevantes. Fuente ideal para agregar un módulo de "alertas comerciales" en el futuro.

---

---

## ⚖️ Marco Legal de Uso de Fuentes — LEER ANTES DE ESCALAR

> Este apartado documenta el estado legal del uso de cada fuente de datos en GTH.
> Debe revisarse cuando el volumen de usuarios supere los 500 usuarios activos mensuales
> o cuando GTH genere ingresos comerciales significativos.

---

### WTO API
- **Licencia:** Uso público permitido con API key registrada
- **Plan actual:** Gratuito (con rate limits)
- **Uso comercial:** Permitido citando la fuente
- **Acción al escalar:** Revisar plan pago en apiportal.wto.org
- **Cita requerida:** "Fuente: WTO Tariff Download Facility — api.wto.org"
- **Estado GTH:** ✅ En regla

### BrasilAPI / Siscomex
- **Licencia:** API pública del gobierno de Brasil, sin restricciones documentadas
- **Uso comercial:** Permitido (diseñada para uso empresarial)
- **Cita requerida:** "Fuente: Receita Federal do Brasil / Siscomex — brasilapi.com.br"
- **Estado GTH:** ✅ En regla

### TARIC — Comisión Europea
- **Licencia:** Datos públicos de la UE — pero la **redistribución comercial masiva** puede requerir acuerdo formal
- **Riesgo:** Alto si GTH escala y redistribuye la base TARIC completa
- **Acción inmediata al escalar:** Contactar TAXUD-DDS-TARIC@ec.europa.eu para confirmar uso comercial
- **Cita requerida:** "Fuente: TARIC — Comisión Europea / DG TAXUD"
- **Estrategia GTH adoptada:**
  - Las tasas MFN para destinos EU se obtienen vía **WTO API** (mismos datos, menor exposición)
  - Los datos TARIC se almacenan en Supabase y se sincronizan **1 vez por mes** (día 1, 10:00 hs UTC)
  - Sincronización mensual reduce tráfico hacia servidores EU al mínimo
  - GTH no redistribuye la base completa — consultas puntuales por código desde su propia DB
  - Banner informativo en la interfaz advierte al usuario que datos TARIC se actualizan mensualmente
- **Descarga masiva CIRCABC:** requiere registro institucional — pendiente para cuando GTH tenga volumen que lo justifique
- **Estado GTH:** ✅ Estrategia conservadora — bajo impacto en servidores EU, datos en DB propia

### Global Trade Alert
- **Licencia:** Datos públicos con acceso libre a informes
- **Uso comercial:** Consultar términos en globaltradealert.org antes de integrar
- **Estado GTH:** ⏳ Pendiente de integración — revisar términos antes de implementar

---

### Protecciones generales que GTH debe mantener siempre

1. **GTH es un intermediario de consulta, no un redistribuidor de bases de datos.**
   Esto debe estar explícito en los Términos de Uso del sitio.

2. **Nunca almacenar ni exponer la base completa de ninguna fuente** como descarga pública.
   GTH consulta bajo demanda, no exporta datasets.

3. **Citar siempre la fuente** en cada resultado y en los PDF exportados.
   Ya implementado en LegalDisclaimer y exportPDF.

4. **Términos de Uso de GTH deben incluir:**
   - Los datos son de referencia y provienen de fuentes oficiales públicas
   - GTH no garantiza exactitud ni actualización en tiempo real
   - El usuario es responsable de verificar con organismos oficiales antes de operar
   - GTH no emite documentos aduaneros ni certificados de ningún tipo

5. **Ante cualquier requerimiento legal de un organismo fuente:**
   Responder inmediatamente, suspender el uso de esa fuente si es necesario,
   y documentar la comunicación.

---

## Calendario de monitoreo sugerido

| Fuente | Frecuencia | Motivo |
|---|---|---|
| argentina.gob.ar importaciones | Mensual | Argentina cambia el sistema con frecuencia |
| MERCOSUR AEC | Trimestral | Cambios en tasas del AEC |
| TARIC (EU) | Mensual (día 1 de cada mes, cron automático) | Estrategia conservadora — datos en DB propia |
| WTO MFN rates | Anual | Datos del año anterior disponibles |
| Siscomex NCM Brasil | Semestral | Cambios de nomenclatura |
| Global Trade Alert | Mensual | Nuevas medidas proteccionistas, antidumping, cuotas |
