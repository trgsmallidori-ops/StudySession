import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Use service role to bypass RLS - ensures we get the actual is_admin value
  try {
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) redirect('/dashboard');
  } catch {
    redirect('/dashboard');
  }

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
      </nav>
      {children}
    </div>
  );
}
