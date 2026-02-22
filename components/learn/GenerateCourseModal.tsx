'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const GENERATION_TIMER_SECONDS = 60;

interface GenerateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  fromTests?: boolean;
}

const DURATIONS = [3, 4, 7, 10] as const;

export default function GenerateCourseModal({
  isOpen,
  onClose,
  initialTopic = '',
  fromTests = false,
}: GenerateCourseModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [difficulty, setDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [loading, setLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(GENERATION_TIMER_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && initialTopic) setTopic(initialTopic);
  }, [isOpen, initialTopic]);

  useEffect(() => {
    if (!loading) {
      setTimerSeconds(GENERATION_TIMER_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!topic.trim() || topic.trim().length < 3) {
      setError(t.generateCourse.topicError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          duration_days: durationDays,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.generateCourse.failed);
        return;
      }

      onClose();
      router.push(`/learn/${data.courseId}/enroll`);
    } catch {
      setError(t.generateCourse.tryAgain);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative glass rounded-2xl border border-accent-pink/30 p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-accent-pink" size={24} />
            {t.generateCourse.title}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-foreground/80 mb-2"
            >
              {fromTests ? t.generateCourse.testTopicLabel : t.generateCourse.topicLabel}
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.generateCourse.topicPlaceholder}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-accent-pink/50 focus:ring-1 focus:ring-accent-pink/30 outline-none transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              {t.generateCourse.courseLength}
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    durationDays === d
                      ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {t.learn.days.replace('{n}', String(d))}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              {t.generateCourse.difficulty}
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    difficulty === d
                      ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {d === 'beginner' ? t.learn.beginner : d === 'intermediate' ? t.learn.intermediate : t.learn.advanced}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full transition-all duration-1000"
                  style={{
                    width: `${((GENERATION_TIMER_SECONDS - timerSeconds) / GENERATION_TIMER_SECONDS) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-center text-foreground/70">
                {timerSeconds > 0
                  ? t.generateCourse.generating.replace('{n}', String(timerSeconds))
                  : t.generateCourse.almostThere}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-pulse">{t.generateCourse.buildingCourse}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {t.generateCourse.generateButton}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
