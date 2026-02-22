'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STORAGE_KEY = 'cookie-consent';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShowBanner(true);
  }, []);

  const handleChoice = (choice: 'accept' | 'decline') => {
    localStorage.setItem(STORAGE_KEY, choice);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="glass rounded-2xl p-6 border border-accent-cyan/20 max-w-2xl mx-auto shadow-xl">
        <p className="text-foreground/90 mb-4">
          {t.cookie.message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => handleChoice('decline')}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors text-sm"
          >
            {t.cookie.decline}
          </button>
          <button
            onClick={() => handleChoice('accept')}
            className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors text-sm font-semibold"
          >
            {t.cookie.accept}
          </button>
        </div>
        <p className="mt-3 text-xs text-foreground/50">
          {t.cookie.details.split('{privacy}')[0]}
          <Link href="/privacy" className="text-accent-cyan hover:underline">{t.cookie.privacyLink}</Link>
          {t.cookie.details.split('{privacy}')[1]?.split('{terms}')[0]}
          <Link href="/terms" className="text-accent-cyan hover:underline">{t.cookie.termsLink}</Link>
          {t.cookie.details.split('{terms}')[1]}
        </p>
      </div>
    </div>
  );
}
