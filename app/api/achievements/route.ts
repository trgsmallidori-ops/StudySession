import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_requirement', { ascending: true, nullsFirst: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
