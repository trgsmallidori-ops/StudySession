'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react';
import StartEarningXpButton from '@/components/StartEarningXpButton';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HomePageClient() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/logo.png"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">{t.home.heroTitle1}</span>
            <br />
            <span className="bg-gradient-to-r from-accent-cyan via-accent-pink to-accent-purple bg-clip-text text-transparent">
              {t.home.heroTitle2}
            </span>
          </h1>
          <p className="text-xl text-foreground/80 mb-10 max-w-2xl mx-auto">
            {t.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-lg bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan/50 hover:bg-accent-cyan/30 hover:shadow-neon-cyan transition-all font-semibold flex items-center justify-center gap-2"
            >
              {t.home.getStarted}
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
            >
              {t.home.viewPlans}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-wider uppercase">
            {t.home.threeWays} <span className="text-accent-cyan">{t.home.excel}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-cyan/10 w-fit mb-6">
                <Calendar className="text-accent-cyan" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.home.smartCalendar}</h3>
              <p className="text-foreground/70 mb-4">
                {t.home.smartCalendarDesc}
              </p>
              <Link href="/calendar" className="text-accent-cyan hover:underline flex items-center gap-2">
                {t.home.tryCalendar} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="glass rounded-2xl p-8 border border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-pink/10 w-fit mb-6">
                <BookOpen className="text-accent-pink" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.home.learnEarnXp}</h3>
              <p className="text-foreground/70 mb-4">
                {t.home.learnEarnXpDesc}
              </p>
              <Link href="/learn" className="text-accent-pink hover:underline flex items-center gap-2">
                {t.home.exploreCourses} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="glass rounded-2xl p-8 border border-accent-purple/20 hover:border-accent-purple/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-purple/10 w-fit mb-6">
                <Trophy className="text-accent-purple" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.home.monthlyRace}</h3>
              <p className="text-foreground/70 mb-4">
                {t.home.monthlyRaceDesc}
              </p>
              <Link href="/race" className="text-accent-purple hover:underline flex items-center gap-2">
                {t.home.joinRace} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-accent-cyan/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6">
            <Zap className="text-accent-cyan" size={20} />
            <span className="text-accent-cyan font-medium">{t.home.gamifiedLearning}</span>
          </div>
          <h2 className="text-3xl font-bold mb-6">
            {t.home.yourProgress}
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-10">
            {t.home.progressDesc}
          </p>
          <StartEarningXpButton />
        </div>
      </section>
    </div>
  );
}
