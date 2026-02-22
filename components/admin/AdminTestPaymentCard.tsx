'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

const TEST_PLANS = [
  {
    name: 'Scholar',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR,
  },
  {
    name: 'Champion',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION,
  },
  {
    name: 'Ultimate',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE,
  },
];

export default function AdminTestPaymentCard() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTestCheckout = async (planName: string, priceId: string) => {
    setLoading(planName);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-accent-cyan/20 mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CreditCard size={24} />
        Test Stripe Payments
      </h2>
      <p className="text-sm text-foreground/60 mb-4">
        Use Stripe test card: <code className="bg-white/10 px-2 py-0.5 rounded">4242 4242 4242 4242</code>. Expiry: any future date. CVC: any 3 digits.
      </p>
      <p className="text-sm text-foreground/50 mb-4">
        Uses your live/test Stripe keys from .env. As admin your site access is unaffected by checkout results.
      </p>
      <div className="flex flex-wrap gap-3">
        {TEST_PLANS.map((plan) => (
          <button
            key={plan.name}
            onClick={() => plan.priceId && handleTestCheckout(plan.name, plan.priceId)}
            disabled={!plan.priceId || loading !== null}
            className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading === plan.name ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            Test {plan.name} Checkout
          </button>
        ))}
      </div>
      {!TEST_PLANS.some((p) => p.priceId) && (
        <p className="text-sm text-amber-400 mt-3">
          Set NEXT_PUBLIC_STRIPE_PRICE_* env vars to enable test checkouts.
        </p>
      )}
    </div>
  );
}
