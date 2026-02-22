import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error: eventsError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('user_id', user.id);

  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 });

  const { error: classesError } = await supabase
    .from('classes')
    .delete()
    .eq('user_id', user.id);

  if (classesError) return NextResponse.json({ error: classesError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
