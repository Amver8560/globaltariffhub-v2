import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Global Tariff Hub | Simulate foreign trade operations",
  description:
    "Explore an import or export starting from your product. Tariff classification, agreements, requirements, costs and viability with AI support.",
  alternates: {
    canonical: "https://globaltariffhub.com/en",
    languages: {
      "es-AR": "https://globaltariffhub.com/",
      "en-US": "https://globaltariffhub.com/en",
      "x-default": "https://globaltariffhub.com/",
    },
  },
  openGraph: {
    title: "Global Tariff Hub — From a product to a foreign trade operation",
    description:
      "Explore classification, tariffs, agreements, requirements and costs to understand an operation before moving forward.",
    url: "https://globaltariffhub.com/en",
    locale: "en_US",
  },
};

export default function EnglishHomePage() {
  return <HomeContent lang="en" />;
}
