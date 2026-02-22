import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { isAdmin } from '@/lib/isAdmin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!isAdmin(user, profile)) redirect('/dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex gap-6 mb-8 border-b border-white/10 pb-4">
        <Link href="/admin" className="text-foreground/80 hover:text-accent-cyan">
          Overview
        </Link>
        <Link href="/admin/users" className="text-foreground/80 hover:text-accent-cyan">
          Users
        </Link>
        <Link href="/admin/races" className="text-foreground/80 hover:text-accent-cyan">
          Races
        </Link>
        <Link href="/admin/blog" className="text-foreground/80 hover:text-accent-cyan">
          Blog
        </Link>
        <Link href="/admin/deletion-feedback" className="text-foreground/80 hover:text-accent-cyan">
          Deletion Feedback
        </Link>
      </nav>
      {children}
    </div>
  );
}
