import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Tariff Hub",
  description: "The tariff intelligence platform for international trade | La plataforma de inteligencia arancelaria para el comercio internacional",
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
