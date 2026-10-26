import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/library/preview/", "/library/approved/sites/", "/library/approved/data/", "/imported/"] },
    sitemap: "https://migbits.com/sitemap.xml",
  };
}
