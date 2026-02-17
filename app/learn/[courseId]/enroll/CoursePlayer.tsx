'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Course, CourseModule, CourseEnrollment } from '@/lib/database.types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
  modules: CourseModule[];
  enrollment: CourseEnrollment;
}

export default function CoursePlayer({
  course,
  modules,
  enrollment,
}: CoursePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [xpGained, setXpGained] = useState(0);

  const currentModule = modules[currentIndex];
  const moduleContent = (currentModule?.content as { type?: string; text?: string; quiz?: unknown }) ?? {};

  const handleCompleteModule = async () => {
    if (!currentModule) return;
    const newCompleted = new Set(completedModules);
    newCompleted.add(currentModule.id);
    setCompletedModules(newCompleted);

    const moduleXP = 25;
    const newProgress = Math.round(
      ((newCompleted.size / modules.length) * 100)
    );

    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: course.id,
        progress_percentage: newProgress,
        xp_earned: enrollment.xp_earned + moduleXP,
        xp_delta: moduleXP,
      }),
    });

    if (res.ok) {
      setXpGained((x) => x + moduleXP);
    }

    if (newProgress >= 100) {
      const completionBonus = Math.max(0, course.total_xp_reward - (enrollment.xp_earned + moduleXP));
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          progress_percentage: 100,
          xp_earned: course.total_xp_reward,
          xp_delta: completionBonus,
          completed: true,
        }),
      });
      setXpGained((x) => x + completionBonus);
    }
  };

  const progress = Math.round((completedModules.size / Math.max(modules.length, 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/learn/${course.id}`}
          className="flex items-center gap-2 text-foreground/70 hover:text-accent-pink"
        >
          <ChevronLeft size={20} />
          Back to course
        </Link>
        <div className="text-sm">
          <span className="text-foreground/60">Progress: </span>
          <span className="font-semibold text-accent-pink">{progress}%</span>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentModule ? (
        <div className="glass rounded-2xl p-8 border border-accent-pink/20">
          <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
          <div className="prose prose-invert max-w-none mb-8">
            {moduleContent.text ? (
              <p className="whitespace-pre-wrap">{moduleContent.text}</p>
            ) : (
              <p className="text-foreground/60">No content in this module yet.</p>
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            {completedModules.has(currentModule.id) ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={20} />
                Completed
              </div>
            ) : (
              <button
                onClick={handleCompleteModule}
                className="px-6 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold"
              >
                Mark Complete (+25 XP)
              </button>
            )}
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i < modules.length - 1 ? i + 1 : i
                )
              }
              disabled={currentIndex >= modules.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 border border-accent-pink/20 text-center">
          <p className="text-foreground/60 mb-4">No modules in this course yet.</p>
          <Link
            href={`/learn/${course.id}`}
            className="text-accent-pink hover:underline"
          >
            Back to course
          </Link>
        </div>
      )}

      {xpGained > 0 && (
        <div className="mt-4 text-center text-xp-start font-semibold">
          +{xpGained} XP earned this session!
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground/60 mb-2">Modules</h3>
        <div className="flex flex-wrap gap-2">
          {modules.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentIndex === i
                  ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                  : completedModules.has(m.id)
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-white/5 border border-white/10'
              }`}
            >
              {i + 1}. {m.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
