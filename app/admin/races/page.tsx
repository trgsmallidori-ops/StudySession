import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminRacesClient from './AdminRacesClient';
import { isAdmin } from '@/lib/isAdmin';

export default async function AdminRacesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return null;

  const adminClient = createAdminClient();
  const { data: periods } = await adminClient
    .from('race_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(20);

  return <AdminRacesClient periods={periods ?? []} />;
}
