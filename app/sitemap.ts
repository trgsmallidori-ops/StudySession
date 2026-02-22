import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
const baseUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/race`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
  ];

  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    blogPosts = (posts ?? []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // If Supabase fails, continue with static routes only
  }

  return [...staticRoutes, ...blogPosts];
}
