import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, username, username_updated_at')
    .eq('id', user.id)
    .single();

  return <AccountClient profile={profile} userEmail={user.email ?? ''} />;
}
