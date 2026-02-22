import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, content, published_at')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single();

  if (!post) return { title: "Blog Post" };

  const description = (post.content ?? "").slice(0, 160).trim() + (post.content?.length > 160 ? "..." : "");
  const keywords = post.title
    ? [post.title, "StudySession", "Spaxio", "blog", "learn", "courses"]
    : undefined;

  return {
    title: post.title,
    description: description || "A post from the StudySession blog. Created by Spaxio.",
    keywords,
    openGraph: {
      title: post.title,
      description: description || "A post from the StudySession blog.",
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description || "A post from the StudySession blog.",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single();

  if (error || !post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-foreground/60">
          {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
        </p>
      </header>
      <div className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
    </article>
  );
}
