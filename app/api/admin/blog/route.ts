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
  const { title, slug, content, published_at } = body;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('blog_posts')
    .insert({
      title: title ?? '',
      slug: slug ?? title?.toLowerCase().replace(/\s+/g, '-') ?? '',
      content: content ?? '',
      author_id: user.id,
      published_at: published_at ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
