import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import RacePageClient from './RacePageClient';
import { isAdmin } from '@/lib/isAdmin';

export default async function RacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, is_admin')
    .eq('id', user.id)
    .single();

  const hasAccess =
    isAdmin(user, profile) ||
    profile?.subscription_tier === 'champion' ||
    profile?.subscription_tier === 'ultimate';
  if (!hasAccess) redirect('/pricing?feature=race');

  // Use service-role client for public race data — bypasses RLS/schema-cache issues
  const adminClient = createAdminClient();

  const { data: periods, error: periodsErr } = await adminClient
    .from('race_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(15);

  if (periodsErr) console.error('[race page] race_periods error:', periodsErr.message);

  // status is the single source of truth
  const activePeriod = (periods ?? []).find((p) => p.status === 'active') ?? null;
  const upcomingPeriod = (periods ?? []).find((p) => p.status === 'upcoming') ?? null;
  const pastPeriods = (periods ?? []).filter((p) => p.status === 'completed').slice(0, 5);

  const { data: announcements, error: annErr } = await adminClient
    .from('race_announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  if (annErr) console.error('[race page] race_announcements error:', annErr.message);
  const latestAnnouncement = annErr ? null : (announcements?.[0] ?? null);

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
      upcomingPeriod={upcomingPeriod}
      pastPeriods={pastPeriods}
      myEntry={myEntry}
      latestAnnouncement={latestAnnouncement}
    />
  );
}
