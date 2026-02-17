import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('race_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(3);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
