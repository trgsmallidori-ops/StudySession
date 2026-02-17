import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const body = await request.json();

  const { data: course } = await supabase
    .from('courses')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (!course || course.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.order_index !== undefined) updates.order_index = body.order_index;
  if (body.content !== undefined) updates.content = body.content;

  const { data, error } = await supabase
    .from('course_modules')
    .update(updates)
    .eq('id', moduleId)
    .eq('course_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;

  const { data: course } = await supabase
    .from('courses')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (!course || course.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', moduleId)
    .eq('course_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
