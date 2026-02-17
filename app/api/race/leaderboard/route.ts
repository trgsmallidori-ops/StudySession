import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const racePeriodId = searchParams.get('race_period_id');

  if (!racePeriodId) {
    return NextResponse.json({ error: 'race_period_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('race_entries')
    .select('*, user:users!user_id(id, full_name)')
    .eq('race_period_id', racePeriodId)
    .order('xp_earned_during_race', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const anonymized = (data ?? []).map((entry, i) => ({
    rank: i + 1,
    user_id: entry.user_id,
    display_name: `User#${String(entry.user_id).slice(-4)}`,
    xp_earned_during_race: entry.xp_earned_during_race,
    opted_in_at: entry.opted_in_at,
    final_rank: entry.final_rank,
  }));

  return NextResponse.json(anonymized);
}
