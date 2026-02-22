import { createClient } from '@/lib/supabase/server';
import BlogClient from './BlogClient';

function getCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  const base = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  return `${base}${path}`;
}

export const metadata = {
  title: "Blog — Study Tips, Learning Strategies & Productivity",
  description:
    "Study tips, learning strategies, productivity for students, AI calendar insights, and gamified learning updates. Created by Spaxio.",
  keywords: [
    "study tips",
    "learning strategies",
    "productivity for students",
    "AI calendar",
    "gamified learning",
    "online courses blog",
    "student productivity",
  ],
  alternates: { canonical: getCanonicalUrl("/blog") },
  openGraph: {
    title: "StudySession Blog — Study Tips & Learning Insights",
    description:
      "Study tips, learning strategies, productivity for students, and gamified learning updates.",
    url: "/blog",
    images: ["/og-image.png"],
  },
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(20);

  return <BlogClient posts={posts ?? []} />;
}
