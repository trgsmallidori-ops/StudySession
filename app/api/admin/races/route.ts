import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/isAdmin';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const {
    start_date,
    end_date,
    race_type,
    title,
    description,
    prize_pool_1st,
    prize_pool_2nd,
    prize_pool_3rd,
  } = body;

  const validTypes = ['xp', 'typing'];
  const type = validTypes.includes(race_type) ? race_type : 'xp';

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('race_periods')
    .insert({
      start_date,
      end_date,
      status: 'upcoming',
      race_type: type,
      title: title || null,
      description: description || null,
      prize_pool_1st: prize_pool_1st ?? 100,
      prize_pool_2nd: prize_pool_2nd ?? 60,
      prize_pool_3rd: prize_pool_3rd ?? 40,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, status, title, description, prize_pool_1st, prize_pool_2nd, prize_pool_3rd } = body;

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    const validStatuses = ['upcoming', 'active', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'status must be upcoming, active, or completed' }, { status: 400 });
    }
    updates.status = status;
  }
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (prize_pool_1st !== undefined) updates.prize_pool_1st = prize_pool_1st;
  if (prize_pool_2nd !== undefined) updates.prize_pool_2nd = prize_pool_2nd;
  if (prize_pool_3rd !== undefined) updates.prize_pool_3rd = prize_pool_3rd;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('race_periods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const adminClient = createAdminClient();
  const { data: existing } = await adminClient
    .from('race_periods')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Race not found' }, { status: 404 });

  const { error } = await adminClient.from('race_periods').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
