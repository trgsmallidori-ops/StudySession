'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              src="/logo.png"
              alt="StudySession"
              width={160}
              height={48}
              className="h-9 w-auto mb-2 rounded-lg"
            />
            <p className="mt-2 text-sm text-foreground/60">
              {t.footer.tagline}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/calendar" className="hover:text-accent-cyan transition-colors">{t.nav.calendar}</Link></li>
              <li><Link href="/learn" className="hover:text-accent-cyan transition-colors">{t.nav.learn}</Link></li>
              <li><Link href="/race" className="hover:text-accent-cyan transition-colors">{t.nav.race}</Link></li>
              <li><Link href="/pricing" className="hover:text-accent-cyan transition-colors">{t.nav.pricing}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/privacy" className="hover:text-accent-cyan transition-colors">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-accent-cyan transition-colors">{t.footer.terms}</Link></li>
              <li><Link href="/refund" className="hover:text-accent-cyan transition-colors">{t.footer.refund}</Link></li>
              <li><Link href="/race/rules" className="hover:text-accent-cyan transition-colors">{t.footer.rules}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.connect}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/blog" className="hover:text-accent-cyan transition-colors">{t.footer.blog}</Link></li>
              <li><Link href="/contact" className="hover:text-accent-cyan transition-colors">{t.footer.contact}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-foreground/50">
          {t.footer.copyright.replace('{year}', String(year))}
        </div>
      </div>
    </footer>
  );
}
