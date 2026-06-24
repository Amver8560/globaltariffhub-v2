# GTH — Diseño del Landing Page (V2)

## Concepto de marca
- **Nombre:** Global Tariff Hub
- **Tagline:** From Product to Trade Intelligence™
- **Sub-tagline navbar:** Inteligencia para el Comercio Global
- **Posicionamiento:** El usuario no entra buscando un código arancelario; entra con un producto. GTH convierte ese producto en inteligencia comercial accionable.

## Paleta de colores V2
| Variable | Hex | Uso |
|----------|-----|-----|
| Fondo | `#07152F` | Background principal |
| Card | `#0B1E3D` | Cards y paneles |
| Card hover | `#0D2247` | Estado hover |
| Azul principal | `#2563EB` | Bordes, botones secundarios |
| Azul brillante | `#3B82F6` | Íconos, checks |
| Dorado | `#F4C542` | CTA primario, acentos, eyebrow |
| Texto principal | `#FFFFFF` | Títulos |
| Texto secundario | `#B8C4D9` | Cuerpo de texto |
| Texto muted | `rgba(184,196,217,0.5)` | Texto de apoyo |
| Borde | `rgba(59,130,246,0.25)` | Bordes generales |
| Borde dorado | `rgba(244,197,66,0.35)` | Top bar oferta |

## Tipografía
- **Familia:** Inter (Google Fonts via next/font/google)
- **Títulos H1:** 72px, font-weight 800, letter-spacing -2px
- **Títulos H2:** 28px, font-weight 800
- **Cuerpo:** 14px, font-weight 400-500
- **Labels/eyebrow:** 12px, font-weight 800, letter-spacing 2.5px, UPPERCASE

## Inspiración visual
- Flexport · Stripe · Vercel · Palantir · Bloomberg Terminal (versión moderna)
- Categoría: SaaS B2B / TradeTech / Logistics Tech / Enterprise Software

## Layout Hero (65/35)
```
[65% — Contenido]          [35% — Ilustración]
- Eyebrow dorado           - Globo compacto 220px
- H1 72px                  - Órbitas decorativas
- Subtítulo                - Stats reales (4 cards 2x2)
- Tagline marca
- Card FOTO (foco principal)
  └ Ícono cámara grande
  └ Título con "foto" en dorado
  └ Descripción IA
  └ Checklist 3×2
- CTA dorado "→ Comenzar análisis"
- CTA outline "▷ Ver cómo funciona"
```

## Secciones del landing (orden)
1. **Top bar** — oferta de lanzamiento (dorado, condicional por días restantes)
2. **Navbar** — sticky, blur, logo + links centro + login + CTA dorado
3. **Hero** — 65/35, card foto como diferenciador principal
4. **Módulos** — 4 cards en grid, cada una con color propio + glow hover
5. **Cobertura** — barra horizontal: HS · NCM · TARIC · Datos · PDF
6. **Trust bar** — 4 valores de confianza
7. **CTA central** — email capture con tagline de marca
8. **Footer** — links legales + tagline de marca + disclaimer legal

## Estado: Pre-lanzamiento
- Sin botones directos a /register
- Email capture form como CTA principal
- Badge "Próximamente / Coming soon"
- Módulos funcionales pero solo accesibles para admin

## Módulos — Cards en landing
| # | Ícono | Color | Título |
|---|-------|-------|--------|
| 1 | 📷 | #3B82F6 azul | Clasificación Inteligente de Productos |
| 2 | 📄 | #F4C542 dorado | Impacto del Certificado de Origen |
| 3 | 🧮 | #22c55e verde | Calculadora CIF |
| 4 | 🛡 | #a78bfa violeta | Viabilidad de Importación |

## Stats (datos reales solamente)
- 164 — Países miembro de la OMC
- 3 — Sistemas arancelarios integrados
- 4 — Módulos especializados
- IA — Foto → Clasificación

⚠️ NUNCA usar estadísticas inventadas (usuarios, consultas, ahorro %). Constituye publicidad engañosa.

## Disclaimers obligatorios en footer
> GTH proporciona herramientas de apoyo para análisis de comercio internacional. La clasificación arancelaria definitiva y los requisitos regulatorios deben ser verificados por profesionales competentes y/o autoridades aduaneras. Los resultados generados por IA son orientativos y no constituyen asesoramiento legal, tributario ni aduanero.
