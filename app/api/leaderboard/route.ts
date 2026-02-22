import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('users')
    .select('id, full_name, username, total_xp')
    .order('total_xp', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leaderboard = (data ?? []).map((user, i) => ({
    rank: i + 1,
    user_id: user.id,
    display_name: user.username ? `@${user.username}` : (user.full_name || `User#${String(user.id).slice(-4)}`),
    total_xp: user.total_xp ?? 0,
  }));

  return NextResponse.json(leaderboard);
}
