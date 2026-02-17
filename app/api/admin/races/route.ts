import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { start_date, end_date, prize_pool_1st, prize_pool_2nd, prize_pool_3rd } = body;

  const { data, error } = await supabase
    .from('race_periods')
    .insert({
      start_date,
      end_date,
      status: 'upcoming',
      prize_pool_1st: prize_pool_1st ?? 100,
      prize_pool_2nd: prize_pool_2nd ?? 60,
      prize_pool_3rd: prize_pool_3rd ?? 40,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
