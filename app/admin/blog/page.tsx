import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog Management</h1>
      <Link
        href="/admin/blog/create"
        className="inline-block px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 mb-6"
      >
        Create Post
      </Link>
      <div className="space-y-4">
        {(posts ?? []).map((p) => (
          <div
            key={p.id}
            className="glass rounded-xl p-4 border border-white/5 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-foreground/60">
                {p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : 'Draft'}
              </p>
            </div>
            <Link
              href={`/admin/blog/${p.id}/edit`}
              className="text-accent-cyan hover:underline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
