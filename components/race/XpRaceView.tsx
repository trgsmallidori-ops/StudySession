'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { RacePeriod, RaceEntry } from '@/lib/database.types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  xp_earned_during_race: number;
  opted_in_at: string;
  final_rank?: number;
}

interface XpRaceViewProps {
  activePeriod: RacePeriod;
  myEntry: RaceEntry | null;
}

export default function XpRaceView({ activePeriod, myEntry: initialMyEntry }: XpRaceViewProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState(initialMyEntry);
  const [optingIn, setOptingIn] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (activePeriod?.id) {
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setLeaderboard(data); })
        .catch(() => {});
    }
  }, [activePeriod?.id]);

  const handleOptIn = async () => {
    if (!activePeriod) return;
    setShowTermsModal(false);
    setOptingIn(true);
    const res = await fetch('/api/race/opt-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race_period_id: activePeriod.id }),
    });
    setOptingIn(false);
    if (res.ok) {
      const data = await res.json();
      setMyEntry(data);
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setLeaderboard(data); });
    }
  };

  const { t } = useLanguage();
  const myRank = myEntry
    ? leaderboard.find((e) => e.user_id === myEntry.user_id)?.rank ?? 0
    : 0;
  const participantCount = leaderboard.length;
  const title = activePeriod.title || `${format(new Date(activePeriod.start_date), 'MMMM yyyy')} XP Challenge`;

  return (
    <>
      <div className="glass rounded-2xl p-8 border border-accent-purple/20 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {activePeriod.description && (
              <p className="text-foreground/70 mb-2">{activePeriod.description}</p>
            )}
            <div className="flex items-center gap-4 text-foreground/60">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {format(new Date(activePeriod.start_date), 'MMM d')} -{' '}
                {format(new Date(activePeriod.end_date), 'MMM d')}
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {participantCount} {t.race.competitors}
              </span>
            </div>
          </div>
          <div className="bg-accent-purple/10 rounded-xl p-6 border border-accent-purple/20">
            <p className="text-sm text-foreground/60 mb-2">{t.race.cashPrizes}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-accent-purple">{t.race.first}</p>
                <p className="text-lg">${activePeriod.prize_pool_1st}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-purple">{t.race.second}</p>
                <p className="text-lg">${activePeriod.prize_pool_2nd}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-purple">{t.race.third}</p>
                <p className="text-lg">${activePeriod.prize_pool_3rd}</p>
              </div>
            </div>
          </div>
        </div>

        {!myEntry && activePeriod.status === 'active' && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowTermsModal(true)}
              disabled={optingIn}
              className="w-full md:w-auto px-8 py-4 rounded-lg bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              {optingIn ? t.race.joining : t.race.joinChallenge}
            </button>
          </div>
        )}

        {myEntry && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-accent-purple font-semibold">
              {t.race.youAreIn.replace('{rank}', String(myRank || '-')).replace('{xp}', String(myEntry.xp_earned_during_race ?? 0))}
            </p>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Trophy size={24} />
          {t.race.leaderboard}
        </h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry, i) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                i < 3 ? 'bg-accent-purple/10 border border-accent-purple/20' : 'bg-white/5'
              }`}
            >
              <span className="w-8 font-bold text-foreground/60">#{entry.rank}</span>
              <span className="flex-1 font-mono">{entry.display_name}</span>
              <span className="text-accent-purple font-semibold">{entry.xp_earned_during_race} XP</span>
            </div>
          ))}
        </div>
        {leaderboard.length === 0 && (
          <p className="text-center text-foreground/60 py-8">{t.race.noParticipants}</p>
        )}
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 border border-accent-purple/20 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{t.race.howItWorks}</h3>
            <div className="space-y-4 text-foreground/80 mb-6">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>{t.race.earnXp}</strong> — {t.race.xpDesc}</li>
                <li><strong>{t.race.prizesDesc}</strong></li>
                <li>{t.race.trackingDesc}</li>
              </ul>
            </div>
            <h3 className="text-xl font-bold mb-4">{t.race.termsTitle}</h3>
            <div className="space-y-4 text-foreground/80 mb-6">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{t.race.participationNote}</li>
                <li>{t.race.subscriptionRequired}</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5"
              >
                {t.race.cancelButton}
              </button>
              <button
                onClick={handleOptIn}
                disabled={optingIn}
                className="px-6 py-2 rounded-lg bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30 font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={18} />
                {t.race.agreeJoin}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
