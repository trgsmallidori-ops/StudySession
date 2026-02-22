'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  published_at: string | null;
}

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'fr' ? fr : enUS;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12">{t.blog.title}</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article className="glass rounded-xl p-6 border border-white/5 hover:border-accent-cyan/20 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              <p className="text-foreground/60 text-sm mb-4">
                {post.published_at && format(new Date(post.published_at), 'd MMMM yyyy', { locale: dateLocale })}
              </p>
              <p className="text-foreground/80 line-clamp-2">
                {(post.content ?? '').slice(0, 200)}...
              </p>
            </article>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-center text-foreground/60 py-16">{t.blog.noPosts}</p>
      )}

      <footer className="mt-16 pt-12 border-t border-white/10 text-center">
        <p className="text-foreground/70 text-sm">
          {t.blog.poweredBy.split('Spaxio')[0]}
          <strong className="text-accent-cyan">Spaxio</strong>
          {t.blog.poweredBy.split('Spaxio')[1]}
        </p>
      </footer>
    </div>
  );
}
