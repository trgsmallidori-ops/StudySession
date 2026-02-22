'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Users, Clock, Trophy, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { RacePeriod, RaceEntry } from '@/lib/database.types';
import TypingTest, { type TypingScore } from './TypingTest';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  typing_speed_wpm: number;
  typing_accuracy?: number;
  opted_in_at: string;
  final_rank?: number;
}

interface TypingRaceViewProps {
  activePeriod: RacePeriod;
  myEntry: RaceEntry | null;
}

export default function TypingRaceView({ activePeriod, myEntry: initialMyEntry }: TypingRaceViewProps) {
  const MAX_PRACTICE_RUNS = 5;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState(initialMyEntry);
  const [lastScore, setLastScore] = useState<TypingScore | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingScore, setPendingScore] = useState<TypingScore | null>(null);
  const [practiceRunsUsed, setPracticeRunsUsed] = useState(0);
  // Once practice runs are exhausted the next completion is the final run
  const isFinalRun = practiceRunsUsed >= MAX_PRACTICE_RUNS;

  useEffect(() => {
    if (activePeriod?.id) {
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setLeaderboard(data); })
        .catch(() => {});
    }
  }, [activePeriod?.id]);

  const handleRunComplete = (score: TypingScore) => {
    setLastScore(score);
    if (isFinalRun) {
      setPendingScore(score);
      setShowConfirm(true);
    } else {
      setPracticeRunsUsed((n) => n + 1);
    }
  };

  const handleFinalSubmitClick = (score: TypingScore) => {
    setPendingScore(score);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingScore || !activePeriod) return;
    setSubmitting(true);
    const res = await fetch('/api/race/typing/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race_period_id: activePeriod.id,
        typing_speed_wpm: pendingScore.wpm,
        typing_accuracy: pendingScore.accuracy,
      }),
    });
    setSubmitting(false);
    setShowConfirm(false);
    setPendingScore(null);
    if (res.ok) {
      const data = await res.json();
      setMyEntry(data);
      fetch(`/api/race/leaderboard?race_period_id=${activePeriod.id}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setLeaderboard(data); });
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to submit');
    }
  };

  const myRank = myEntry
    ? leaderboard.find((e) => e.user_id === myEntry.user_id)?.rank ?? 0
    : 0;
  const participantCount = leaderboard.length;
  const title = activePeriod.title || `${format(new Date(activePeriod.start_date), 'MMMM yyyy')} Typing Challenge`;
  const hasSubmitted = myEntry?.is_final_submission ?? false;

  return (
    <>
      <div className="glass rounded-2xl p-8 border border-accent-cyan/20 mb-8">
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
                {participantCount} competitors
              </span>
            </div>
          </div>
          <div className="bg-accent-cyan/10 rounded-xl p-6 border border-accent-cyan/20">
            <p className="text-sm text-foreground/60 mb-2">Cash Prizes</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-accent-cyan">1st</p>
                <p className="text-lg">${activePeriod.prize_pool_1st}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-cyan">2nd</p>
                <p className="text-lg">${activePeriod.prize_pool_2nd}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-cyan">3rd</p>
                <p className="text-lg">${activePeriod.prize_pool_3rd}</p>
              </div>
            </div>
          </div>
        </div>

        {hasSubmitted && myEntry && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-accent-cyan font-semibold">
              Your final score: {myEntry.typing_speed_wpm} WPM ({myEntry.typing_accuracy ?? 0}% accuracy) • Rank: #{myRank || '-'}
            </p>
          </div>
        )}
      </div>

      {!hasSubmitted && activePeriod.status === 'active' && (
        <div className="glass rounded-2xl p-8 border border-accent-cyan/20 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap size={24} />
            Typing Speed Test
          </h3>
          <p className="text-foreground/70 mb-6">
            You get <strong>5 practice runs</strong> to warm up. After that, your 6th run is automatically your final submission — no take-backs! You can also submit any practice score early if you&apos;re happy with it.
          </p>

          {isFinalRun && (
            <div className="mb-4 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-semibold">
              All 5 practice runs used. This is your final run — it will be submitted automatically when you finish!
            </div>
          )}

          <TypingTest
            key={isFinalRun ? 'final' : `practice-${practiceRunsUsed}`}
            isPractice={!isFinalRun}
            practiceRunsUsed={practiceRunsUsed}
            maxPracticeRuns={MAX_PRACTICE_RUNS}
            onComplete={handleRunComplete}
          />

          {lastScore && !isFinalRun && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-foreground/70 mb-2">
                Last practice run: {lastScore.wpm} WPM, {lastScore.accuracy}% accuracy
              </p>
              <button
                onClick={() => handleFinalSubmitClick(lastScore)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold"
              >
                <Send size={18} />
                Submit This Score as Final
              </button>
            </div>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Trophy size={24} />
          Leaderboard
        </h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry, i) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                i < 3 ? 'bg-accent-cyan/10 border border-accent-cyan/20' : 'bg-white/5'
              }`}
            >
              <span className="w-8 font-bold text-foreground/60">#{entry.rank}</span>
              <span className="flex-1 font-mono">{entry.display_name}</span>
              <span className="text-accent-cyan font-semibold">{entry.typing_speed_wpm} WPM</span>
              {entry.typing_accuracy != null && (
                <span className="text-foreground/60 text-sm">{entry.typing_accuracy}%</span>
              )}
            </div>
          ))}
        </div>
        {leaderboard.length === 0 && (
          <p className="text-center text-foreground/60 py-8">No submissions yet. Be the first!</p>
        )}
      </div>

      {showConfirm && pendingScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 border border-accent-cyan/20 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">Submit Final Score?</h3>
            <p className="text-foreground/80 mb-6">
              You will submit <strong>{pendingScore.wpm} WPM</strong> ({pendingScore.accuracy}% accuracy) as your final score. This cannot be changed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingScore(null);
                }}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
