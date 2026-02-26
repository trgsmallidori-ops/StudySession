import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, full_name_updated_at, username, username_updated_at')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { full_name, username, email } = body;

  const updates: Record<string, unknown> = {};
  const adminClient = createAdminClient();

  if (full_name !== undefined) {
    const trimmed = full_name.trim();
    const { data: currentUser } = await adminClient
      .from('users')
      .select('full_name_updated_at')
      .eq('id', user.id)
      .single();

    if (currentUser?.full_name_updated_at) {
      const lastChange = new Date(currentUser.full_name_updated_at);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (lastChange > oneWeekAgo) {
        const nextAllowed = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
        return NextResponse.json({
          error: `You can change your full name again on ${nextAllowed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        }, { status: 429 });
      }
    }

    updates.full_name = trimmed;
    updates.full_name_updated_at = new Date().toISOString();
  }

  if (username !== undefined) {
    const cleaned = username.trim().toLowerCase();

    if (cleaned.length < 3 || cleaned.length > 20) {
      return NextResponse.json({ error: 'Username must be 3–20 characters' }, { status: 400 });
    }
    if (!/^[a-z0-9_]+$/.test(cleaned)) {
      return NextResponse.json({ error: 'Only letters, numbers, and underscores allowed' }, { status: 400 });
    }

    // Check the 2-week cooldown
    const { data: current } = await adminClient
      .from('users')
      .select('username, username_updated_at')
      .eq('id', user.id)
      .single();

    if (current?.username_updated_at) {
      const lastChange = new Date(current.username_updated_at);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      if (lastChange > twoWeeksAgo) {
        const nextAllowed = new Date(lastChange.getTime() + 14 * 24 * 60 * 60 * 1000);
        return NextResponse.json({
          error: `You can change your username again on ${nextAllowed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        }, { status: 429 });
      }
    }

    // Check uniqueness
    const { data: existing } = await adminClient
      .from('users')
      .select('id')
      .eq('username', cleaned)
      .maybeSingle();

    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    updates.username = cleaned;
    updates.username_updated_at = new Date().toISOString();
  }

  if (email !== undefined && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) return NextResponse.json({ error: emailError.message }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { error: dbError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
