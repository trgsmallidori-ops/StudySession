'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30"
    >
      {loading ? t.dashboard.managingSubscription : t.dashboard.manageSubscription}
    </button>
  );
}
