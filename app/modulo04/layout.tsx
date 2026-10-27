import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viabilidad de importación",
  description: "Analizá los números de una importación: costos estimados, arancel de referencia y requisitos a tener en cuenta.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
