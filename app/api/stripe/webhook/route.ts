import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') return null;
  return new Stripe(key);
};

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key === 'placeholder' || url.includes('placeholder')) {
    throw new Error('Supabase admin not configured');
  }
  return createClient(url, key);
};

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handler is idempotent: same event processed twice (e.g. Stripe retry) yields same DB state.
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier as string;
        const subscriptionId = session.subscription as string;

        if (userId && tier) {
          const supabaseAdmin = getSupabaseAdmin();
          await supabaseAdmin
            .from('users')
            .update({
              subscription_tier: tier,
              subscription_id: subscriptionId,
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;

        const tierMap: Record<string, string> = {
          [process.env.STRIPE_PRICE_SCHOLAR!]: 'scholar',
          [process.env.STRIPE_PRICE_CHAMPION!]: 'champion',
          [process.env.STRIPE_PRICE_ULTIMATE!]: 'ultimate',
        };
        const tier = tierMap[priceId];

        if (tier) {
          const supabaseAdmin = getSupabaseAdmin();
          const { data: users } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('subscription_id', sub.id);

          if (users?.length) {
            await getSupabaseAdmin()
              .from('users')
              .update({ subscription_tier: tier })
              .eq('id', users[0].id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const supabaseAdmin = getSupabaseAdmin();
        const { data: users } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('subscription_id', sub.id);

          if (users?.length) {
            await getSupabaseAdmin()
              .from('users')
              .update({
                subscription_tier: 'free',
                subscription_id: null,
              })
              .eq('id', users[0].id);
          }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return generic message so we don't leak internal details to callers.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
