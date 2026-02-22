'use client';

import Link from 'next/link';
import { Trophy, Zap } from 'lucide-react';
import { format } from 'date-fns';
import type { RacePeriod, RaceEntry, RaceAnnouncement } from '@/lib/database.types';
import XpRaceView from '@/components/race/XpRaceView';
import TypingRaceView from '@/components/race/TypingRaceView';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RacePageClientProps {
  activePeriod: RacePeriod | null;
  upcomingPeriod: RacePeriod | null;
  pastPeriods: RacePeriod[];
  myEntry: RaceEntry | null;
  latestAnnouncement: RaceAnnouncement | null;
}

export default function RacePageClient({
  activePeriod,
  upcomingPeriod,
  pastPeriods,
  myEntry,
  latestAnnouncement,
}: RacePageClientProps) {
  const raceType = activePeriod?.race_type ?? 'xp';
  const typeIcon = raceType === 'typing' ? Zap : Trophy;
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy className="text-accent-purple" size={48} />
          {t.race.title}
        </h1>
        <p className="text-foreground/70 text-lg mb-4">
          {t.race.subtitle}
        </p>
        <Link href="/race/rules" className="text-accent-cyan hover:underline">
          {t.race.officialRules}
        </Link>
      </div>

      {latestAnnouncement && (
        <div className="glass rounded-xl p-4 mb-8 border border-accent-cyan/20">
          <p className="text-sm font-semibold text-accent-cyan mb-1">{latestAnnouncement.title}</p>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{latestAnnouncement.message}</p>
        </div>
      )}

      {activePeriod ? (
        <>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs px-2 py-1 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/40 flex items-center gap-1 w-fit">
              {typeIcon === Zap ? <Zap size={12} /> : <Trophy size={12} />}
              {raceType === 'typing' ? t.race.typingSpeed : t.race.xp}
            </span>
          </div>

          {raceType === 'xp' && (
            <XpRaceView activePeriod={activePeriod} myEntry={myEntry} />
          )}
          {raceType === 'typing' && (
            <TypingRaceView activePeriod={activePeriod} myEntry={myEntry} />
          )}
        </>
      ) : (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center mb-8">
          {upcomingPeriod ? (
            <>
              <h2 className="text-xl font-bold mb-2">{t.race.upcomingRace}</h2>
              <p className="text-foreground/70 mb-4">
                {upcomingPeriod.title ||
                  `${format(new Date(upcomingPeriod.start_date), 'MMMM yyyy')} ${upcomingPeriod.race_type === 'typing' ? t.race.typingSpeed : t.race.xp}`}
              </p>
              <p className="text-sm text-foreground/60">
                {format(new Date(upcomingPeriod.start_date), 'MMM d')} –{' '}
                {format(new Date(upcomingPeriod.end_date), 'MMM d')}
              </p>
              <p className="text-sm text-foreground/60 mt-2">
                {t.race.prizes
                  .replace('${first}', String(upcomingPeriod.prize_pool_1st))
                  .replace('${second}', String(upcomingPeriod.prize_pool_2nd))
                  .replace('${third}', String(upcomingPeriod.prize_pool_3rd))}
              </p>
            </>
          ) : (
            <p className="text-foreground/60">{t.race.noActiveRace}</p>
          )}
        </div>
      )}

      {pastPeriods.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">{t.race.pastRaces}</h3>
          <div className="space-y-3">
            {pastPeriods.map((p) => (
              <div
                key={p.id}
                className="glass rounded-xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">
                    {p.title || `${format(new Date(p.start_date), 'MMMM yyyy')} ${p.race_type === 'typing' ? t.race.typingSpeed : t.race.xp}`}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {format(new Date(p.start_date), 'MMM d')} – {format(new Date(p.end_date), 'MMM d')} • {p.participant_count} {t.race.participants}
                  </p>
                </div>
                <div className="text-sm">
                  {t.race.prizes
                    .replace('${first}', String(p.prize_pool_1st))
                    .replace('${second}', String(p.prize_pool_2nd))
                    .replace('${third}', String(p.prize_pool_3rd))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
