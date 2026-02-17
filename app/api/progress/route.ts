import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { course_id, progress_percentage, xp_earned, xp_delta, completed } = body;

  if (!course_id) {
    return NextResponse.json({ error: 'course_id required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (progress_percentage !== undefined) updates.progress_percentage = progress_percentage;
  if (xp_earned !== undefined) updates.xp_earned = xp_earned;
  if (completed) updates.completed_at = new Date().toISOString();

  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .update(updates)
    .eq('user_id', user.id)
    .eq('course_id', course_id)
    .select()
    .single();

  if (enrollError) return NextResponse.json({ error: enrollError.message }, { status: 500 });

  const amountToAdd = xp_delta ?? (xp_earned ? xp_earned - (enrollment?.xp_earned ?? 0) : 0);
  if (amountToAdd > 0) {
    const { data: profile } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', user.id)
      .single();

    const newTotal = (profile?.total_xp ?? 0) + amountToAdd;

    await supabase.from('users').update({ total_xp: newTotal }).eq('id', user.id);
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount: amountToAdd,
      source: 'course',
      source_id: course_id,
    });

    const now = new Date().toISOString();
    const { data: activeRace } = await supabase
      .from('race_periods')
      .select('id')
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .maybeSingle();

    if (activeRace) {
      const { data: entry } = await supabase
        .from('race_entries')
        .select('id, xp_earned_during_race')
        .eq('race_period_id', activeRace.id)
        .eq('user_id', user.id)
        .single();

      if (entry) {
        await supabase
          .from('race_entries')
          .update({
            xp_earned_during_race: (entry.xp_earned_during_race ?? 0) + amountToAdd,
          })
          .eq('id', entry.id);
      }
    }
  }

  return NextResponse.json(enrollment);
}
