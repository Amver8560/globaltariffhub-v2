# GTH — Arquitectura del Proyecto

## Stack técnico
- **Framework:** Next.js 14 App Router (TypeScript)
- **Base de datos:** Supabase (PostgreSQL) con Row Level Security (RLS)
- **Auth:** Supabase Auth
- **IA:** Anthropic Claude (claude-sonnet-4-5)
- **PDF:** jsPDF
- **Deploy:** Vercel
- **Repo:** https://github.com/Amver8560/globaltariffhub-v2

## Estructura de módulos
| Módulo | Ruta | Función |
|--------|------|---------|
| M01 | /modulo01 | Buscador HS / NCM / TARIC + Acuerdos Comerciales |
| M02 | /modulo02 | Simulador de Operaciones con Certificado de Origen |
| M03 | /modulo03 | Calculadora CIF (Incoterms + tributos + costo nacionalizado) |
| M04 | /modulo04 | Viabilidad de Importación (foto o descripción → IA) |

## APIs internas
| Endpoint | Módulo | Descripción |
|----------|--------|-------------|
| /api/search | M01 | Búsqueda HS/NCM/TARIC vía IA + WTO API |
| /api/certificate | M02 | Simulación certificado de origen (Claude AI) |
| /api/cif | M03 | Cálculo CIF con Incoterms |
| /api/viability | M04 | Análisis viabilidad con imagen o descripción |
| /api/subscribe | Landing | Captura de email pre-lanzamiento |
| /api/sync-taric | Cron | Sincronización mensual TARIC (día 1 de cada mes) |

## Fuentes de datos
| Fuente | Uso | Estado legal |
|--------|-----|-------------|
| WTO API (apiportal.wto.org) | Tasas MFN por código HS | ✅ API key activa: 4808500da73a4a63ab64731ddea9a0fb |
| BrasilAPI / Siscomex | Nomenclatura NCM | ✅ Uso libre |
| TARIC EU | Base arancelaria europea | ⚠️ Uso referencial, sync mensual para minimizar exposición |
| Anthropic Claude | Clasificación IA, simulaciones | ✅ API activa |

## Variables de entorno (.env.local)
```
WTO_API_KEY=4808500da73a4a63ab64731ddea9a0fb
ANTHROPIC_API_KEY=[configurada]
NEXT_PUBLIC_SUPABASE_URL=[configurada]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurada]
SUPABASE_SERVICE_ROLE_KEY=[configurada]
```

## Cron jobs (vercel.json)
- **Sync TARIC:** `0 10 1 * *` — día 1 de cada mes, 10hs UTC

## Páginas legales
| Ruta | Descripción |
|------|-------------|
| /terminos | Términos de Uso (11 cláusulas) |
| /privacidad | Política de Privacidad |
| /legales | Aviso Legal + Copyright |
| /privacy | Política de Privacidad EN |
