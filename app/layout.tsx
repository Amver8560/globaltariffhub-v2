import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://globaltariffhub.com"),
  title: {
    default: "Global Tariff Hub | Simulá operaciones de comercio exterior",
    template: "%s | Global Tariff Hub",
  },
  description:
    "Explorá una importación o exportación desde tu producto. Clasificación arancelaria, acuerdos, requisitos, costos y viabilidad con apoyo de inteligencia artificial.",
  keywords: [
    "operación de comercio exterior",
    "importar producto",
    "exportar producto",
    "clasificación arancelaria",
    "costos de importación",
    "aranceles",
    "acuerdos comerciales",
    "simular importación",
    "simular exportación",
    "comercio exterior para pymes",
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
    url: "https://globaltariffhub.com/",
    siteName: "Global Tariff Hub",
    title: "Global Tariff Hub — De un producto a una operación de comercio exterior",
    description:
      "Explorá clasificación, aranceles, acuerdos, requisitos y costos para comprender una operación antes de avanzar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Global Tariff Hub — From Product to Trade Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Tariff Hub — De un producto a una operación de comercio exterior",
    description:
      "Explorá clasificación, aranceles, acuerdos, requisitos y costos para comprender una operación antes de avanzar.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://globaltariffhub.com/",
    languages: {
      "es-AR": "https://globaltariffhub.com/",
      "en-US": "https://globaltariffhub.com/en",
      "x-default": "https://globaltariffhub.com/",
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
        "Herramienta para explorar y evaluar operaciones de comercio exterior desde un producto: clasificación arancelaria, acuerdos, requisitos, costos y viabilidad, con apoyo de inteligencia artificial.",
      "foundingDate": "2025",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "analia@globaltariffhub.com",
        "contactType": "customer support",
        "availableLanguage": ["Spanish", "English"],
      },
      "sameAs": ["https://www.linkedin.com/company/globaltariffhub"],
    },
    {
      "@type": "WebSite",
      "@id": "https://globaltariffhub.com/#website",
      "url": "https://globaltariffhub.com",
      "name": "Global Tariff Hub",
      "description":
        "Explorá una operación de comercio exterior desde tu producto: clasificación, aranceles, acuerdos, requisitos y costos.",
      "publisher": { "@id": "https://globaltariffhub.com/#organization" },
      "inLanguage": ["es", "en"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://globaltariffhub.com/#app",
      "name": "Global Tariff Hub",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://globaltariffhub.com",
      "description":
        "Plataforma para explorar y analizar operaciones de comercio exterior: clasificación arancelaria (HS/NCM/TARIC), análisis de preferencia arancelaria por origen, cálculo de costos CIF y viabilidad de importación, con apoyo de inteligencia artificial.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Acceso anticipado gratuito, sin tarjeta de crédito.",
      },
      "featureList": [
        "Clasificación arancelaria de productos (HS, NCM, TARIC) asistida por IA",
        "Análisis de preferencia arancelaria por país de origen (con y sin certificado de origen)",
        "Calculadora CIF con Incoterms y tipo de cambio",
        "Análisis de viabilidad de una importación",
        "Tasas MFN y preferenciales de WITS / UNCTAD TRAINS con año de referencia",
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
