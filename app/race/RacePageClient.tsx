'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RacePeriod, RaceEntry } from '@/lib/database.types';
import { Trophy, Users, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RacePageClientProps {
  activePeriod: RacePeriod | null | undefined;
  myEntry: RaceEntry | null;
}

export default function RacePageClient({
  activePeriod,
  myEntry: initialMyEntry,
}: RacePageClientProps) {
  const [leaderboard, setLeaderboard] = useState<{ rank: number; user_id: string; display_name: string; xp_earned_during_race: number; opted_in_at: string }[]>([]);
  const [myEntry, setMyEntry] = useState(initialMyEntry);
  const [optingIn, setOptingIn] = useState(false);

  useEffect(() => {
    if (activePeriod?.id) {
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then(setLeaderboard)
        .catch(() => {});
    }
  }, [activePeriod?.id]);

  const handleOptIn = async () => {
    if (!activePeriod) return;
    setOptingIn(true);
    const res = await fetch('/api/race/opt-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race_period_id: activePeriod.id }),
    });
    setOptingIn(false);
    if (res.ok) {
      setMyEntry({} as RaceEntry);
      const data = await res.json();
      setMyEntry(data);
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then(setLeaderboard);
    }
  };

  const myRank = myEntry
    ? (leaderboard.find((e) => e.user_id === myEntry.user_id)?.rank ?? 0)
    : 0;

  const participantCount = leaderboard.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy className="text-accent-purple" size={48} />
          Monthly Productivity Challenge
        </h1>
        <p className="text-foreground/70 text-lg mb-4">
          100% skill-based. Free for Champion & Ultimate subscribers.
        </p>
        <Link
          href="/race/rules"
          className="text-accent-cyan hover:underline"
        >
          Official Rules →
        </Link>
      </div>

      {activePeriod && (
        <div className="glass rounded-2xl p-8 border border-accent-purple/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {format(new Date(activePeriod.start_date), 'MMMM yyyy')} Challenge
              </h2>
              <div className="flex items-center gap-4 text-foreground/60">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {format(new Date(activePeriod.start_date), 'MMM d')} - {format(new Date(activePeriod.end_date), 'MMM d')}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {participantCount} competitors
                </span>
              </div>
            </div>
            <div className="bg-accent-purple/10 rounded-xl p-6 border border-accent-purple/20">
              <p className="text-sm text-foreground/60 mb-2">This Month&apos;s Prizes (Funded by Spaxio)</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-accent-purple">1st</p>
                  <p className="text-lg">${activePeriod.prize_pool_1st}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-purple">2nd</p>
                  <p className="text-lg">${activePeriod.prize_pool_2nd}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-purple">3rd</p>
                  <p className="text-lg">${activePeriod.prize_pool_3rd}</p>
                </div>
              </div>
            </div>
          </div>

          {!myEntry && activePeriod.status === 'active' && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleOptIn}
                disabled={optingIn}
                className="w-full md:w-auto px-8 py-4 rounded-lg bg-accent-purple/20 text-accent-purple border-2 border-accent-purple/50 hover:bg-accent-purple/30 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                {optingIn ? 'Joining...' : "Join This Month's Productivity Challenge"}
              </button>
            </div>
          )}

          {myEntry && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-accent-purple font-semibold">
                You&apos;re in! Your Rank: #{myRank || '-'} • XP: {myEntry.xp_earned_during_race ?? 0}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-xl font-semibold mb-6">Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry, i) => (
            <div
              key={i}
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
          <p className="text-center text-foreground/60 py-8">No participants yet. Be the first!</p>
        )}
      </div>

      {!activePeriod && (
        <div className="text-center py-16 text-foreground/60">
          No active race period. Check back soon!
        </div>
      )}
    </div>
  );
}
