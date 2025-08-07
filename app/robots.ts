import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://ali-sh.com/sitemap.xml",
    host: "https://ali-sh.com",
  };
}
