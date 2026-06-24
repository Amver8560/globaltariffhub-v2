# GTH — Marco Legal y Compliance

## Posicionamiento legal correcto
- GTH es una **herramienta de apoyo** para análisis de comercio internacional
- NO es: asesor aduanero, emisor de certificados, redistribuidor de bases de datos
- NO emite: certificados de origen, documentos aduaneros, liquidaciones aduaneras definitivas

## Frases prohibidas (engañosas)
❌ "Identificá el producto con IA" → implica certeza  
❌ "Fuentes oficiales" → implica validación oficial  
❌ Estadísticas de uso no verificables (+10.000 empresas, +2M consultas, 70% ahorro)

## Frases correctas
✅ "La IA analiza el producto y **sugiere** clasificaciones arancelarias"  
✅ "Fuentes de **referencia** utilizadas"  
✅ "Los resultados son **orientativos**"  
✅ Estadísticas reales y verificables únicamente

## Aviso IA (obligatorio en páginas de resultados)
> Los resultados generados mediante inteligencia artificial son orientativos y no constituyen asesoramiento legal, tributario o aduanero.

## Disclaimer principal (landing + legales)
> GTH proporciona herramientas de apoyo para análisis de comercio internacional. La clasificación arancelaria definitiva, la aplicación de acuerdos comerciales y los requisitos regulatorios deben ser verificados por profesionales competentes y/o las autoridades aduaneras correspondientes.

## Fuentes de referencia (no "fuentes oficiales")
| Fuente | Por qué "de referencia" |
|--------|------------------------|
| WTO API | Tasas MFN — pueden cambiar entre rondas de negociación |
| TARIC EU | Actualización mensual — puede no reflejar cambios recientes |
| Siscomex / BrasilAPI | NCM oficial pero sujeto a actualizaciones normativas |

## Registro de Propiedad Intelectual (Uruguay)
**Orden recomendado:**
1. **SAS Unipersonal** — AIN (ain.gub.uy) — 5-10 días hábiles online — ⛔ Bloquea lanzamiento público
2. **Marca "Global Tariff Hub"** — DNPI (dnpi.gub.uy) — Clase 42 — USD 200-400 — 6-12 meses
3. **Software como obra intelectual** — MEC / Biblioteca Nacional Uruguay
4. **Actualizar Términos** — reemplazar jurisdicción Argentina por Uruguay con razón social

**Evidencia de creación (guardar):**
- Commits de git con fechas desde junio 2025
- Emails y facturas de hosting desde junio 2025
- Fecha de fundación en código: © 2025 Global Tariff Hub

## Copyright correcto
```
© 2025 Global Tariff Hub. Todos los derechos reservados.
```
→ 2025 es el año de fundación/creación original (junio 2025)

## Jurisdicción actual
- Términos: República Argentina (provisional)
- Cambiar a Uruguay una vez constituida la SAS

## Pendientes legales al escalar
- **TAXUD:** Contactar para acuerdo formal uso TARIC — taxud-dds-taric@ec.europa.eu
- **WTO API Plan pago:** apiportal.wto.org (cuando supere rate limits gratuitos)
- **Términos formales:** Redactar con asesor legal (no solo IA)

## ROI — Fórmula correcta (M02)
```
savings.gross     = tariff_without.amount − tariff_with.amount
savings.net       = savings.gross − certificate_cost.amount
savings.roi_pct   = Math.round((savings.net / certificate_cost.amount) × 100)
```
Ejemplo: net=1315, cert_cost=85 → ROI = (1315/85)×100 = **1547%** ✅

## Checkboxes obligatorios en /register
1. ✅ Términos de Uso (/terminos)
2. ✅ Política de Privacidad (/privacidad)
3. ✅ Aviso Legal (/legales) — con mención explícita al despachante de aduana
→ Botón submit deshabilitado hasta que los tres estén marcados
