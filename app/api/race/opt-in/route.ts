import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { race_period_id } = body;

  if (!race_period_id) {
    return NextResponse.json({ error: 'race_period_id required' }, { status: 400 });
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
    .select('*')
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

  const { data, error } = await supabase
    .from('race_entries')
    .upsert(
      {
        race_period_id,
        user_id: user.id,
        opted_in_at: new Date().toISOString(),
        xp_earned_during_race: 0,
      },
      { onConflict: 'user_id,race_period_id' }
    )
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already opted in' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
