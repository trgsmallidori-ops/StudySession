import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'username required' }, { status: 400 });
  }

  const cleaned = username.trim().toLowerCase();
  if (cleaned.length < 3 || cleaned.length > 20) {
    return NextResponse.json({ available: false, reason: 'Username must be 3–20 characters' });
  }
  if (!/^[a-z0-9_]+$/.test(cleaned)) {
    return NextResponse.json({ available: false, reason: 'Only letters, numbers, and underscores allowed' });
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('users')
    .select('id')
    .eq('username', cleaned)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
