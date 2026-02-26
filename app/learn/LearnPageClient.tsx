'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import CourseCard from '@/components/learn/CourseCard';
import XPBar from '@/components/learn/XPBar';
import GenerateCourseModal from '@/components/learn/GenerateCourseModal';
import { Course } from '@/lib/database.types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GlobalLeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  total_xp: number;
}

interface RaceLeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  xp_earned_during_race: number;
}

interface LearnPageClientProps {
  courses: (Course & { creator?: { full_name?: string } })[];
  myCourses: (Course & { creator?: { full_name?: string } })[];
  enrollmentMap: Record<string, { progress_percentage?: number }>;
  totalXP: number;
  userId?: string;
  activeRacePeriodId?: string | null;
  canCreateMoreCourses?: boolean;
  courseLimitReached?: boolean;
}

export default function LearnPageClient({
  courses: initialCourses,
  myCourses: initialMyCourses,
  enrollmentMap,
  totalXP,
  userId,
  activeRacePeriodId,
  canCreateMoreCourses = true,
  courseLimitReached = false,
}: LearnPageClientProps) {
  const [courses] = useState(initialCourses);
  const [myCourses] = useState(initialMyCourses);
  const [filter, setFilter] = useState<string>('all');
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'race'>('global');
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(true);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [raceLeaderboard, setRaceLeaderboard] = useState<RaceLeaderboardEntry[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then(setGlobalLeaderboard)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeRacePeriodId) {
      fetch(`/api/race/leaderboard?race_period_id=${activeRacePeriodId}`)
        .then((r) => r.json())
        .then(setRaceLeaderboard)
        .catch(() => {});
    } else {
      setRaceLeaderboard([]);
    }
  }, [activeRacePeriodId]);

  const filtered =
    filter === 'all'
      ? courses
      : courses.filter((c) => c.difficulty === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.learn.title}</h1>
          <p className="text-foreground/70">
            {t.learn.subtitle}
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-accent-pink/20 w-full md:w-80">
          <XPBar currentXP={totalXP} />
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setLeaderboardExpanded(!leaderboardExpanded)}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          <Trophy className="text-accent-pink" size={24} />
          <h2 className="text-xl font-semibold">{t.learn.leaderboard}</h2>
          {leaderboardExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {leaderboardExpanded && (
          <div className="glass rounded-xl p-6 border border-accent-pink/20">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setLeaderboardTab('global')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  leaderboardTab === 'global'
                    ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {t.learn.globalXp}
              </button>
              {activeRacePeriodId && (
                <button
                  onClick={() => setLeaderboardTab('race')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    leaderboardTab === 'race'
                      ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {t.learn.raceLeaderboard}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {leaderboardTab === 'global' &&
                globalLeaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.user_id === userId
                        ? 'bg-accent-pink/20 border border-accent-pink/30'
                        : 'bg-white/5'
                    } ${entry.rank <= 3 ? 'border border-accent-pink/20' : ''}`}
                  >
                    <span className="w-8 font-bold text-foreground/60">#{entry.rank}</span>
                    <span className="flex-1 truncate">{entry.display_name}</span>
                    <span className="text-accent-pink font-semibold">{entry.total_xp} XP</span>
                  </div>
                ))}
              {leaderboardTab === 'race' &&
                raceLeaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.user_id === userId
                        ? 'bg-accent-pink/20 border border-accent-pink/30'
                        : 'bg-white/5'
                    } ${entry.rank <= 3 ? 'border border-accent-pink/20' : ''}`}
                  >
                    <span className="w-8 font-bold text-foreground/60">#{entry.rank}</span>
                    <span className="flex-1 truncate font-mono">{entry.display_name}</span>
                    <span className="text-accent-pink font-semibold">{entry.xp_earned_during_race} XP</span>
                  </div>
                ))}
            </div>
            {leaderboardTab === 'global' && globalLeaderboard.length === 0 && (
              <p className="text-center text-foreground/60 py-6">{t.learn.noUsers}</p>
            )}
            {leaderboardTab === 'race' && raceLeaderboard.length === 0 && (
              <p className="text-center text-foreground/60 py-6">{t.learn.noParticipants}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                : 'bg-white/5 border border-white/10 hover:border-white/20'
            }`}
          >
            {f === 'all' ? t.learn.all : f === 'beginner' ? t.learn.beginner : f === 'intermediate' ? t.learn.intermediate : t.learn.advanced}
          </button>
        ))}
        </div>
        <button
          onClick={() => {
            if (courseLimitReached || !canCreateMoreCourses) {
              setShowUpgradeModal(true);
            } else {
              setModalOpen(true);
            }
          }}
          className="px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold"
        >
          {t.learn.generateCourse}
        </button>
      </div>

      {myCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.learn.myCourses}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollmentMap[course.id]}
              />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">{t.learn.allCourses}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrollment={enrollmentMap[course.id]}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-foreground/60">
          {t.learn.noCourses}
        </div>
      )}

      <GenerateCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpgradeRequired={() => {
          setModalOpen(false);
          setShowUpgradeModal(true);
        }}
      />

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
            aria-hidden
          />
          <div className="relative glass rounded-2xl border border-accent-pink/30 p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="text-accent-pink" size={22} />
                {t.learn.courseLimitReached}
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-foreground/80 mb-6">{t.learn.upgradeToCreateMore}</p>
            <Link
              href="/pricing?feature=learn"
              className="block w-full py-3 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold text-center transition-colors"
            >
              {t.dashboard.upgradePlan}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
