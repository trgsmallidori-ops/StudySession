import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CalendarPageClient from './CalendarPageClient';

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, calendar_uploads_used')
    .eq('id', user.id)
    .single();

  const uploadLimit = profile?.subscription_tier === 'free' ? 2 : 999;
  const uploadsUsed = profile?.calendar_uploads_used ?? 0;

  return (
    <CalendarPageClient
      uploadsUsed={uploadsUsed}
      uploadLimit={uploadLimit}
    />
  );
}
