import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, tier: null });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    authenticated: true,
    tier: profile?.subscription_tier ?? 'free',
  });
}
