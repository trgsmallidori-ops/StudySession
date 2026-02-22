'use client';

import Link from 'next/link';
import { Calendar, BookOpen, Trophy, Zap, Check, CreditCard } from 'lucide-react';
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Profile {
  full_name?: string | null;
  total_xp?: number | null;
  subscription_tier?: string | null;
  calendar_uploads_used?: number | null;
}

interface DashboardClientProps {
  profile: Profile | null;
  email: string | undefined;
}

export default function DashboardClient({ profile, email }: DashboardClientProps) {
  const { t } = useLanguage();

  const level = profile?.total_xp ? Math.floor(profile.total_xp / 100) + 1 : 1;
  const xpInLevel = profile?.total_xp ? profile.total_xp % 100 : 0;
  const tier = (profile?.subscription_tier ?? 'free') as 'free' | 'scholar' | 'champion' | 'ultimate';

  const features = t.dashboard.planFeatures[tier] ?? t.dashboard.planFeatures.free;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {t.dashboard.welcomeBack}{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-foreground/70 mb-8">{email}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <Zap className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">{t.dashboard.level}</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full transition-all"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
          <p className="text-sm text-foreground/60 mt-2">{profile?.total_xp ?? 0} {t.dashboard.xpTotal}</p>
        </div>

        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <Calendar className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">{t.dashboard.subscription}</p>
              <p className="text-xl font-bold capitalize">{profile?.subscription_tier ?? 'free'}</p>
            </div>
          </div>
          {profile?.subscription_tier !== 'free' ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="text-accent-cyan text-sm hover:underline"
            >
              {t.dashboard.upgradePlan}
            </Link>
          )}
        </div>

        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <BookOpen className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">{t.dashboard.calendarUploads}</p>
              <p className="text-xl font-bold">{profile?.calendar_uploads_used ?? 0} {t.dashboard.used}</p>
            </div>
          </div>
          <p className="text-sm text-foreground/60">
            {profile?.subscription_tier === 'free' ? t.dashboard.freeUploads : t.dashboard.unlimited}
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-accent-cyan/20 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent-cyan/20">
            <CreditCard className="text-accent-cyan" size={24} />
          </div>
          <h2 className="text-xl font-semibold">{t.dashboard.subscription}</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize bg-accent-cyan/20 text-accent-cyan mb-4">
              {tier}
            </span>
            <ul className="space-y-2">
              {features.map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="text-green-400 flex-shrink-0" size={16} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            {tier !== 'free' ? (
              <ManageSubscriptionButton />
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30"
              >
                {t.dashboard.upgradePlan}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/calendar"
          className="glass rounded-xl p-6 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors group"
        >
          <Calendar className="text-accent-cyan mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">{t.nav.calendar}</h3>
          <p className="text-sm text-foreground/60">
            {t.dashboard.calendarDesc}
          </p>
        </Link>
        <Link
          href="/learn"
          className="glass rounded-xl p-6 border border-accent-pink/20 hover:border-accent-pink/40 transition-colors group"
        >
          <BookOpen className="text-accent-pink mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">{t.nav.learn}</h3>
          <p className="text-sm text-foreground/60">
            {t.dashboard.learnDesc}
          </p>
        </Link>
        <Link
          href="/race"
          className="glass rounded-xl p-6 border border-accent-purple/20 hover:border-accent-purple/40 transition-colors group"
        >
          <Trophy className="text-accent-purple mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">{t.nav.race}</h3>
          <p className="text-sm text-foreground/60">
            {t.dashboard.raceDesc}
          </p>
        </Link>
      </div>
    </div>
  );
}
