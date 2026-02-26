import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { race_period_id, typing_speed_wpm, typing_accuracy } = body;

  if (!race_period_id || typing_speed_wpm == null) {
    return NextResponse.json(
      { error: 'race_period_id and typing_speed_wpm required' },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier ?? 'free';
  if (tier !== 'champion' && tier !== 'ultimate') {
    return NextResponse.json(
      { error: 'Champion subscription required' },
      { status: 403 }
    );
  }

  const { data: period } = await supabase
    .from('race_periods')
    .select('id, status, race_type')
    .eq('id', race_period_id)
    .single();

  if (!period) {
    return NextResponse.json({ error: 'Race period not found' }, { status: 404 });
  }

  if (period.status !== 'active') {
    return NextResponse.json(
      { error: 'Race period is not active' },
      { status: 400 }
    );
  }

  if (period.race_type !== 'typing') {
    return NextResponse.json(
      { error: 'This race is not a typing speed race' },
      { status: 400 }
    );
  }

  const wpm = Math.round(Number(typing_speed_wpm));
  const accuracy = typing_accuracy != null ? Math.min(100, Math.max(0, Number(typing_accuracy))) : null;

  if (wpm < 0) {
    return NextResponse.json({ error: 'Invalid WPM' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('race_entries')
    .select('id, is_final_submission')
    .eq('race_period_id', race_period_id)
    .eq('user_id', user.id)
    .single();

  if (existing?.is_final_submission) {
    return NextResponse.json(
      { error: 'You have already submitted your final score' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('race_entries')
    .upsert(
      {
        race_period_id,
        user_id: user.id,
        opted_in_at: new Date().toISOString(),
        xp_earned_during_race: 0,
        typing_speed_wpm: wpm,
        typing_accuracy: accuracy,
        is_final_submission: true,
      },
      { onConflict: 'user_id,race_period_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
