'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Calendar, BookOpen, Trophy, Lock } from 'lucide-react';

export default function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const feature = searchParams.get('feature');
  const authRequired = searchParams.get('auth') === 'required';

  useEffect(() => {
    fetch('/api/user/subscription')
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated ?? false))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (feature === 'learn' || feature === 'race') {
      const el = document.getElementById('plans');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feature]);

  const plans = [
    {
      name: 'Scholar',
      price: '$30',
      period: '/year',
      description: 'AI Calendar parsing & unlimited uploads',
      features: [
        'AI-powered course outline parsing',
        'Unlimited calendar uploads',
        'Color-coded class schedules',
      ],
      icon: Calendar,
      color: 'accent-cyan',
      cta: 'Get Scholar',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR,
    },
    {
      name: 'Ultimate',
      price: '$11',
      period: '/month',
      description: 'Everything. Best value.',
      features: [
        'Everything in Champion',
        'All Scholar features',
        'Best value bundle',
      ],
      icon: Trophy,
      color: 'accent-purple',
      cta: 'Get Ultimate',
      popular: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE,
    },
    {
      name: 'Champion',
      price: '$10',
      period: '/month',
      description: 'Learn section & race eligibility',
      features: [
        'Everything in Scholar',
        'Full Learn section access',
        'Create & complete courses',
        'XP system & achievements',
        'Monthly race participation',
      ],
      icon: BookOpen,
      color: 'accent-pink',
      cta: 'Get Champion',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION,
    },
  ];

  return (
    <>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-foreground/70 text-lg">
          Level up your learning with AI-powered tools and gamified courses.
        </p>
      </div>

      {feature === 'learn' && (
        <div className="mb-10 p-5 rounded-xl border border-accent-pink/40 bg-accent-pink/10 text-center max-w-2xl mx-auto">
          {authRequired ? (
            <>
              <p className="font-semibold text-accent-pink mb-1">Sign in to get started</p>
              <p className="text-foreground/70 text-sm mb-4">
                You need an account before purchasing a plan. Create one for free — it only takes a second.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 text-sm font-semibold"
                >
                  Create Account
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-accent-pink mb-1">Unlock Learn &amp; XP</p>
              <p className="text-foreground/70 text-sm">
                The <strong>Champion</strong> or <strong>Ultimate</strong> plan gives you full access to the Learn section, course creation, XP, achievements, and monthly races.
              </p>
            </>
          )}
        </div>
      )}

      <div id="plans" className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              glass rounded-2xl p-8 border relative
              ${plan.popular ? 'border-accent-purple/50 shadow-neon-purple' : 'border-white/10'}
            `}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-sm font-semibold">
                Most Popular
              </div>
            )}
            <div className={`p-3 rounded-xl bg-${plan.color}/10 w-fit mb-6`}>
              <plan.icon className={`text-${plan.color}`} size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-foreground/60 mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-foreground/60">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="text-green-400 flex-shrink-0" size={18} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {authenticated === false ? (
              <Link
                href={`/signup?redirect=/pricing${feature ? `?feature=${feature}` : ''}`}
                className={`
                  block w-full py-3 rounded-lg text-center font-semibold transition-colors flex items-center justify-center gap-2
                  ${plan.popular
                    ? 'bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                <Lock size={15} />
                Sign in to purchase
              </Link>
            ) : plan.priceId ? (
              <button
                onClick={async () => {
                  setLoading(plan.name);
                  try {
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ price_id: plan.priceId }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } finally {
                    setLoading(null);
                  }
                }}
                disabled={loading !== null}
                className={`
                  block w-full py-3 rounded-lg text-center font-semibold transition-colors disabled:opacity-50
                  ${plan.popular
                    ? 'bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </button>
            ) : (
              <Link
                href="/signup"
                className={`
                  block w-full py-3 rounded-lg text-center font-semibold transition-colors
                  ${plan.popular
                    ? 'bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-foreground/50 mt-12 text-sm">
        All plans include a free trial. Cancel anytime.
      </p>
    </>
  );
}
