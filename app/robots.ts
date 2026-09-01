import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/login",
        "/register",
        "/recuperar",
        "/actualizar-clave",
        "/acceso",
        "/auth/",
        "/modulo01",
        "/modulo02",
        "/modulo03",
        "/modulo04",
        "/modulo05",
        "/modulos",
        "/pricing",
        "/en/pricing",
      ],
    },
    sitemap: "https://globaltariffhub.com/sitemap.xml",
  };
}
