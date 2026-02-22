'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StartEarningXpButton() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const { t } = useLanguage();

  const handleClick = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/user/subscription');
      const data = await res.json();

      if (!data.authenticated) {
        router.push('/pricing?feature=learn&auth=required');
        return;
      }

      const tier = data.tier as string;
      if (tier === 'champion' || tier === 'ultimate') {
        router.push('/learn');
      } else {
        router.push('/pricing?feature=learn');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={checking}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors font-semibold disabled:opacity-60"
    >
      {checking ? t.home.loading : t.home.startEarning}
      {!checking && <ArrowRight size={20} />}
    </button>
  );
}
