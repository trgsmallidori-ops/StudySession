import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCalculation();
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCalculation();
}

async function runCalculation() {

  const supabase = await createClient();

  const { data: completedPeriods } = await supabase
    .from('race_periods')
    .select('*')
    .eq('status', 'active')
    .lte('end_date', new Date().toISOString());

  if (!completedPeriods?.length) {
    return NextResponse.json({ message: 'No completed race periods' });
  }

  for (const period of completedPeriods) {
    const { data: entries } = await supabase
      .from('race_entries')
      .select('*')
      .eq('race_period_id', period.id)
      .order('xp_earned_during_race', { ascending: false })
      .order('opted_in_at', { ascending: true });

    if (!entries?.length) continue;

    const winners = entries.slice(0, 3);
    const prizes = [period.prize_pool_1st, period.prize_pool_2nd, period.prize_pool_3rd];

    for (let i = 0; i < winners.length; i++) {
      await supabase
        .from('race_entries')
        .update({
          final_rank: i + 1,
          payout_amount: prizes[i],
        })
        .eq('id', winners[i].id);
    }

    await supabase
      .from('race_periods')
      .update({ status: 'completed' })
      .eq('id', period.id);
  }

  return NextResponse.json({ success: true });
}

