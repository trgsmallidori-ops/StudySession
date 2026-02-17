import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date');

  if (start) {
    query = query.gte('due_date', start);
  }
  if (end) {
    query = query.lte('due_date', end);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { class_id, title, description, event_type, due_date, color } = body;

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      class_id: class_id || null,
      title: title ?? '',
      description: description || null,
      event_type: event_type ?? 'other',
      due_date: due_date,
      color: color ?? '#00f0ff',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
