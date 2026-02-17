import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');
  const creator = searchParams.get('creator');

  let query = supabase
    .from('courses')
    .select('*, creator:users!creator_id(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  if (creator) {
    query = query.eq('creator_id', creator);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, description, duration_days, difficulty, total_xp_reward, thumbnail_url } = body;

  const { data, error } = await supabase
    .from('courses')
    .insert({
      creator_id: user.id,
      title: title ?? '',
      description: description ?? null,
      duration_days: duration_days ?? 7,
      difficulty: difficulty ?? 'beginner',
      total_xp_reward: total_xp_reward ?? 100,
      thumbnail_url: thumbnail_url ?? null,
      is_published: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
