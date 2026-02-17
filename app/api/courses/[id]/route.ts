import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from('courses')
    .select('*, creator:users!creator_id(id, full_name, email)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.duration_days !== undefined) updates.duration_days = body.duration_days;
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
  if (body.total_xp_reward !== undefined) updates.total_xp_reward = body.total_xp_reward;
  if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url;
  if (body.is_published !== undefined) updates.is_published = body.is_published;

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .eq('creator_id', user.id)
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

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
