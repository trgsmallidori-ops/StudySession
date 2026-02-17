import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RacePageClient from './RacePageClient';

export default async function RacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const hasAccess = profile?.subscription_tier === 'champion' || profile?.subscription_tier === 'ultimate';
  if (!hasAccess) redirect('/pricing?feature=race');

  const { data: periods } = await supabase
    .from('race_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(5);

  const activePeriod = (periods ?? []).find(
    (p) =>
      p.status === 'active' &&
      new Date(p.start_date) <= new Date() &&
      new Date(p.end_date) >= new Date()
  ) ?? periods?.[0];

  let myEntry = null;
  if (activePeriod && user) {
    const { data } = await supabase
      .from('race_entries')
      .select('*')
      .eq('race_period_id', activePeriod.id)
      .eq('user_id', user.id)
      .single();
    myEntry = data;
  }

  return (
    <RacePageClient
      activePeriod={activePeriod}
      myEntry={myEntry}
    />
  );
}
