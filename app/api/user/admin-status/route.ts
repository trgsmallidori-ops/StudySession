import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/isAdmin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ is_admin: false });

  return NextResponse.json({ is_admin: isAdmin(user) });
}
