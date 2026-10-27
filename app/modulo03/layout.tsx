import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de costos de importación",
  description: "Estimá la base del arancel y el costo de la operación a partir del precio cotizado y el Incoterm.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
