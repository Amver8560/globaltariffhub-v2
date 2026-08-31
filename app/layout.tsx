import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://globaltariffhub.com"),
  title: {
    default: "Global Tariff Hub — Inteligencia Arancelaria para Importadores y Exportadores",
    template: "%s | Global Tariff Hub",
  },
  description:
    "Plataforma de inteligencia arancelaria para emprendedores y pymes. Buscá códigos HS, NCM y TARIC, simulá ahorros con certificados de origen, calculá costos CIF y analizá la viabilidad de tu importación — con datos reales de la OMC.",
  keywords: [
    "aranceles importación",
    "código HS",
    "código NCM",
    "TARIC",
    "certificado de origen",
    "calculadora CIF",
    "viabilidad importación",
    "comercio exterior",
    "MERCOSUR",
    "tasa arancelaria",
    "WTO tariff",
    "import tariff calculator",
    "tariff code search",
    "trade agreement simulation",
    "Global Tariff Hub",
  ],
  authors: [{ name: "Global Tariff Hub", url: "https://globaltariffhub.com" }],
  creator: "Global Tariff Hub",
  publisher: "Global Tariff Hub",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    alternateLocale: "en_US",
    url: "https://globaltariffhub.com",
    siteName: "Global Tariff Hub",
    title: "Global Tariff Hub — Inteligencia Arancelaria",
    description:
      "Aranceles reales, costos exactos y simulaciones de ahorro para importadores y exportadores. Datos oficiales de la OMC, NCM y TARIC.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Global Tariff Hub — Plataforma de inteligencia arancelaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Tariff Hub — Inteligencia Arancelaria",
    description:
      "Aranceles reales, costos exactos y simulaciones de ahorro para importadores y exportadores.",
    images: ["/og-image.png"],
    creator: "@globaltariffhub",
  },
  alternates: {
    canonical: "https://globaltariffhub.com",
    languages: {
      "es-AR": "https://globaltariffhub.com",
      "en-US": "https://globaltariffhub.com/en",
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "business",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://globaltariffhub.com/#organization",
      "name": "Global Tariff Hub",
      "url": "https://globaltariffhub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://globaltariffhub.com/og-image.png",
        "width": 1200,
        "height": 630,
      },
      "description":
        "Plataforma de inteligencia arancelaria para emprendedores y pymes. Datos reales de la OMC, NCM y TARIC.",
      "foundingDate": "2025",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "analia@globaltariffhub.com",
        "contactType": "customer support",
        "availableLanguage": ["Spanish", "English"],
      },
      "sameAs": [
        "https://www.linkedin.com/company/globaltariffhub",
        "https://twitter.com/globaltariffhub",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://globaltariffhub.com/#website",
      "url": "https://globaltariffhub.com",
      "name": "Global Tariff Hub",
      "description":
        "Inteligencia arancelaria para importadores y exportadores. Códigos HS, NCM, TARIC, simulaciones y cálculo de costos CIF.",
      "publisher": { "@id": "https://globaltariffhub.com/#organization" },
      "inLanguage": ["es", "en"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://globaltariffhub.com/modulo01?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://globaltariffhub.com/#app",
      "name": "Global Tariff Hub",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://globaltariffhub.com",
      "description":
        "Plataforma SaaS de inteligencia arancelaria. Buscá códigos HS/NCM/TARIC, simulá ahorros con certificados de origen, calculá costos CIF y analizá viabilidad de importación con datos oficiales de la OMC.",
      "offers": [
        {
          "@type": "Offer",
          "name": "Plan Gratuito",
          "price": "0",
          "priceCurrency": "USD",
          "description": "3 consultas gratis sin tarjeta de crédito",
        },
        {
          "@type": "Offer",
          "name": "Plan Pro Anual",
          "price": "238",
          "priceCurrency": "USD",
          "description": "Acceso completo por 12 meses — oferta de lanzamiento",
        },
      ],
      "featureList": [
        "Búsqueda de códigos HS, NCM y TARIC",
        "Análisis de preferencia arancelaria por origen (con y sin certificado de origen)",
        "Calculadora CIF con Incoterms",
        "Análisis de viabilidad de importación con IA",
        "Datos reales de la OMC (WTO API)",
        "Exportación de informes en PDF",
        "Bilingüe español / inglés",
      ],
      "publisher": { "@id": "https://globaltariffhub.com/#organization" },
      "inLanguage": ["es", "en"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-inter), 'Helvetica Neue', Arial, sans-serif" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
