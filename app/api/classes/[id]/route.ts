import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, color, days_of_week, start_time, end_time } = body;

  const { data, error } = await supabase
    .from('classes')
    .update({
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(days_of_week !== undefined && { days_of_week }),
      ...(start_time !== undefined && { start_time: start_time || null }),
      ...(end_time !== undefined && { end_time: end_time || null }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Delete all events belonging to this class first
  const { error: eventsError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('class_id', id)
    .eq('user_id', user.id);

  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 });

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
