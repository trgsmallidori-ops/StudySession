import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { course_id } = body;

  if (!course_id) {
    return NextResponse.json({ error: 'course_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('course_enrollments')
    .upsert(
      { user_id: user.id, course_id, progress_percentage: 0, xp_earned: 0 },
      { onConflict: 'user_id,course_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
