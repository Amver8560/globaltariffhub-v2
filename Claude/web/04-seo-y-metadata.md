# GTH — SEO y Metadata

## Configuración en app/layout.tsx
- **Title template:** `"%s | Global Tariff Hub"`
- **Title default:** "Global Tariff Hub — Inteligencia Arancelaria para Importadores y Exportadores"
- **Description:** optimizada con keywords ES/EN
- **Keywords (15):** aranceles importación, código HS, código NCM, TARIC, certificado de origen, calculadora CIF, viabilidad importación, comercio exterior, MERCOSUR, tasa arancelaria, WTO tariff, import tariff calculator, tariff code search, trade agreement simulation, Global Tariff Hub
- **Tipografía:** Inter via next/font/google (cero layout shift)

## Open Graph
- **og:type:** website
- **og:locale:** es_AR / alternateLocale: en_US
- **og:image:** /og-image.png (1200×630px) ⚠️ PENDIENTE — public/ está vacía
- **og:site_name:** Global Tariff Hub

## Twitter Card
- **card:** summary_large_image
- **creator:** @globaltariffhub
- **image:** /og-image.png

## Hreflang
- es-AR → https://globaltariffhub.com
- en-US → https://globaltariffhub.com/en

## JSON-LD (datos estructurados)
Tres schemas en app/layout.tsx:
1. **Organization** — nombre, logo, contacto, fundación 2025, sameAs redes
2. **WebSite** — SearchAction (habilita Sitelinks Search Box en Google)
3. **SoftwareApplication** — categoría, features, planes de precio

## Sitemap (app/sitemap.ts)
| URL | Frecuencia | Prioridad |
|-----|-----------|-----------|
| / | weekly | 1.0 |
| /en | weekly | 0.9 |
| /modulo01-04 | monthly | 0.8 |
| /register | monthly | 0.7 |
| /privacidad /privacy /terminos /legales | yearly | 0.3 |

## Robots
- index: true, follow: true
- googleBot: index: true, follow: true

## Imágenes pendientes (public/ vacía)
| Archivo | Tamaño | Uso |
|---------|--------|-----|
| og-image.png | 1200×630px | Open Graph / redes sociales |
| favicon.ico | 32×32px | Pestaña del browser |
| apple-touch-icon.png | 180×180px | iPhone pantalla de inicio |

## Herramienta de verificación
https://search.google.com/test/rich-results → pegar URL para ver qué lee Google
