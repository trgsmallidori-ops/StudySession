import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      <div className="space-y-8">
        {(posts ?? []).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article className="glass rounded-xl p-6 border border-white/5 hover:border-accent-cyan/20 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              <p className="text-foreground/60 text-sm mb-4">
                {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
              </p>
              <p className="text-foreground/80 line-clamp-2">
                {(post.content ?? '').slice(0, 200)}...
              </p>
            </article>
          </Link>
        ))}
      </div>
      {(!posts || posts.length === 0) && (
        <p className="text-center text-foreground/60 py-16">No posts yet. Check back soon!</p>
      )}
    </div>
  );
}
