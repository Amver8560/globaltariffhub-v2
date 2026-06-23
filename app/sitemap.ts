import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://globaltariffhub.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/modulo01`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modulo03`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modulo04`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modulo05`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
