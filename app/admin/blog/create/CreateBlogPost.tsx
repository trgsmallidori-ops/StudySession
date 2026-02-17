'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const slug = (form.elements.namedItem('slug') as HTMLInputElement).value;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
    const published = (form.elements.namedItem('published') as HTMLInputElement).checked;

    setLoading(true);
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        content,
        published_at: published ? new Date().toISOString() : null,
      }),
    });
    setLoading(false);
    if (res.ok) router.push('/admin/blog');
  };

  return (
    <div>
      <Link href="/admin/blog" className="text-foreground/70 hover:text-accent-cyan mb-6 inline-block">
        ← Back to Blog
      </Link>
      <h1 className="text-2xl font-bold mb-6">Create Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm text-foreground/80 mb-2">Title</label>
          <input
            name="title"
            required
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">Slug</label>
          <input
            name="slug"
            placeholder="auto-generated from title"
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">Content</label>
          <textarea
            name="content"
            rows={10}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="published" id="published" />
          <label htmlFor="published">Publish immediately</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
