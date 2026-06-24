import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
