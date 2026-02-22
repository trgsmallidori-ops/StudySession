import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
const baseUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/dashboard"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
