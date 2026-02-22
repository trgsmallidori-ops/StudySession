import { createClient } from '@/lib/supabase/server';
import BlogClient from './BlogClient';

export const metadata = {
  title: "Blog — Tips, Updates & Learning Insights",
  description:
    "The StudySession Blog: productivity tips, AI calendar insights, gamified learning updates, and course recommendations. Created by Spaxio.",
  keywords: [
    "blog",
    "productivity",
    "AI calendar",
    "learn",
    "courses",
    "gamified learning",
    "Spaxio",
    "StudySession",
  ],
  openGraph: {
    title: "StudySession Blog — Tips, Updates & Learning Insights",
    description:
      "Productivity tips, AI calendar insights, and gamified learning updates. Created by Spaxio.",
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
