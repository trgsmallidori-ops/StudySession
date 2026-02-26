import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key);
};

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_SCHOLAR!]: 'scholar',
  [process.env.STRIPE_PRICE_CHAMPION!]: 'champion',
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { price_id } = body;

  if (!price_id) {
    return NextResponse.json({ error: 'price_id required' }, { status: 400 });
  }

  const tier = PRICE_TO_TIER[price_id];
  if (!tier) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  // Vercel sets this header automatically based on the visitor's IP
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    '';
  const currency = country === 'US' ? 'usd' : undefined;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: user.email ?? undefined,
      ...(currency ? { currency } : {}),
      ...(tier === 'champion' ? { subscription_data: { trial_period_days: 14 } } : {}),
      metadata: {
        user_id: user.id,
        tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
