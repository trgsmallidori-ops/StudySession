import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ is_admin: false });

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ is_admin: data?.is_admin ?? false });
  } catch {
    return NextResponse.json({ is_admin: false });
  }
}
