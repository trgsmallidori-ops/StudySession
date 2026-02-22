import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let feedback: { reason_primary?: string; reason_secondary?: string; reason_other?: string } | null = null;
  try {
    const body = await request.json();
    if (body.feedback && typeof body.feedback === 'object') {
      feedback = {
        reason_primary: body.feedback.reason_primary,
        reason_secondary: body.feedback.reason_secondary,
        reason_other: body.feedback.reason_other,
      };
    }
  } catch {
    // No feedback provided
  }

  // Save feedback before deletion (so we keep it after user is gone)
  if (feedback) {
    await supabase.from('account_deletion_feedback').insert({
      user_id: user.id,
      user_email: user.email ?? undefined,
      reason_primary: feedback.reason_primary ?? null,
      reason_secondary: feedback.reason_secondary ?? null,
      reason_other: feedback.reason_other ?? null,
    });
  }

  // Cancel Stripe subscription if they have one
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_id')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_id) {
    const stripe = getStripe();
    if (stripe) {
      try {
        await stripe.subscriptions.cancel(profile.subscription_id);
      } catch (e) {
        console.error('Failed to cancel Stripe subscription:', e);
        // Continue with deletion - subscription may already be cancelled
      }
    }
  }

  // Delete auth user (cascades to public.users and all related data)
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
