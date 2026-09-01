import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://globaltariffhub.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/biblioteca`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/biblioteca/como-empezar-a-importar-un-producto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
