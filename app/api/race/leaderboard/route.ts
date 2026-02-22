import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const racePeriodId = searchParams.get('race_period_id');

  if (!racePeriodId) {
    return NextResponse.json({ error: 'race_period_id required' }, { status: 400 });
  }

  const { data: period } = await supabase
    .from('race_periods')
    .select('race_type')
    .eq('id', racePeriodId)
    .single();

  const raceType = period?.race_type ?? 'xp';

  let query = supabase
    .from('race_entries')
    .select('*, user:users!user_id(id, full_name)')
    .eq('race_period_id', racePeriodId);

  if (raceType === 'typing') {
    query = query.eq('is_final_submission', true).order('typing_speed_wpm', { ascending: false });
  } else {
    query = query.order('xp_earned_during_race', { ascending: false });
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const anonymized = (data ?? []).map((entry, i) => {
    const base = {
      rank: i + 1,
      user_id: entry.user_id,
      display_name: `User#${String(entry.user_id).slice(-4)}`,
      opted_in_at: entry.opted_in_at,
      final_rank: entry.final_rank,
    };
    if (raceType === 'typing') {
      return {
        ...base,
        typing_speed_wpm: entry.typing_speed_wpm,
        typing_accuracy: entry.typing_accuracy,
      };
    }
    return {
      ...base,
      xp_earned_during_race: entry.xp_earned_during_race,
    };
  });

  return NextResponse.json(anonymized);
}
