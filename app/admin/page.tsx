import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AdminTestPaymentCard from '@/components/admin/AdminTestPaymentCard';

export default async function AdminPage() {
  const supabase = await createClient();

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  const { data: activeRace } = await supabase
    .from('race_periods')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  const { count: contactCount } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users">
          <div className="glass rounded-xl p-6 border border-white/5 hover:border-accent-cyan/20 transition-colors">
            <p className="text-foreground/60 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{usersCount ?? 0}</p>
          </div>
        </Link>
        <Link href="/admin/blog">
          <div className="glass rounded-xl p-6 border border-white/5 hover:border-accent-cyan/20 transition-colors">
            <p className="text-foreground/60 text-sm">Courses</p>
            <p className="text-3xl font-bold">{coursesCount ?? 0}</p>
          </div>
        </Link>
        <Link href="/admin/races">
          <div className="glass rounded-xl p-6 border border-white/5 hover:border-accent-cyan/20 transition-colors">
            <p className="text-foreground/60 text-sm">Active Race</p>
            <p className="text-xl font-bold">{activeRace ? 'Yes' : 'No'}</p>
          </div>
        </Link>
        <div className="glass rounded-xl p-6 border border-white/5">
          <p className="text-foreground/60 text-sm">New Contact Messages</p>
          <p className="text-3xl font-bold">{contactCount ?? 0}</p>
        </div>
      </div>

      <AdminTestPaymentCard />
    </div>
  );
}
