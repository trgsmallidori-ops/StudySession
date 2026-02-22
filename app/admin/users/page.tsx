import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/isAdmin';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return null; // Layout already redirects, but guard for safety

  const adminClient = createAdminClient();
  const { data: users } = await adminClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase());

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">Tier</th>
              <th className="p-4">XP</th>
              <th className="p-4">Admin</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.full_name ?? '-'}</td>
                <td className="p-4 capitalize">{u.subscription_tier}</td>
                <td className="p-4">{u.total_xp}</td>
                <td className="p-4">
                  {adminEmails.includes((u.email ?? '').toLowerCase()) ? 'Yes (env)' : u.is_admin ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
