import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clasificación arancelaria con IA",
  description: "Identificá el código HS, NCM o TARIC de tu producto con IA y explorá aranceles, acuerdos comerciales y documentación de origen y destino.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
