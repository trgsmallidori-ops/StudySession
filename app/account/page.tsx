import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, full_name_updated_at, username, username_updated_at, subscription_tier, subscription_id')
    .eq('id', user.id)
    .single();

  return <AccountClient profile={profile} userEmail={user.email ?? ''} />;
}
