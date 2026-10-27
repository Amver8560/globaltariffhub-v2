import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Podés pagar menos aranceles?",
  description: "Compará el arancel con y sin certificado de origen según el acuerdo comercial entre los países, con una estimación referencial del ahorro.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
