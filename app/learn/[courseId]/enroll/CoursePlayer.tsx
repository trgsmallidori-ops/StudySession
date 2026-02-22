'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course, CourseModule, CourseEnrollment } from '@/lib/database.types';
import { ChevronLeft, ChevronRight, Check, Lock, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  question?: string;
  options?: string[];
  correct_index?: number;
  explanation?: string;
}

interface Section {
  type?: string;
  title?: string;
  content?: string;
  instructions?: string;
  question?: string;
  options?: string[];
  correct_index?: number;
  explanation?: string;
  questions?: QuizQuestion[];
}

interface ModuleContent {
  sections?: Section[];
  text?: string;
  type?: string;
}

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
  const completedCount = Math.round(
    (Number(enrollment.progress_percentage) / 100) * modules.length
  );
  const [localCompletedCount, setLocalCompletedCount] = useState(completedCount);
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(completedCount, modules.length - 1)
  );
  const [xpGained, setXpGained] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const currentModule = modules[currentIndex];
  const moduleContent = (currentModule?.content as ModuleContent) ?? {};
  const sections = moduleContent.sections ?? [];
  const hasAIContent = sections.length > 0;

  const quizSection = sections.find((s) => s.type === 'quiz');
  const quizQuestions: QuizQuestion[] = quizSection?.questions?.length
    ? quizSection.questions
    : quizSection?.question
      ? [
          {
            question: quizSection.question,
            options: quizSection.options ?? [],
            correct_index: quizSection.correct_index ?? 0,
            explanation: quizSection.explanation,
          },
        ]
      : [];

  useEffect(() => {
    setQuizAnswers(quizQuestions.map(() => null));
    setIsReviewMode(false);
  }, [currentIndex]);

  const unlockedIndex = Math.min(localCompletedCount, modules.length - 1);
  const isModuleUnlocked = (i: number) => i <= unlockedIndex;
  const isModuleCompleted = (i: number) => i < localCompletedCount;

  const xpPerDay = Math.ceil(
    course.total_xp_reward / Math.max(modules.length, 1)
  );
  const xpPerQuestion = Math.ceil(xpPerDay / Math.max(quizQuestions.length, 1));

  const calculateEarnedXP = () => {
    let earned = 0;
    quizQuestions.forEach((q, i) => {
      const ans = quizAnswers[i];
      if (ans === null) return;
      const correct = q.correct_index ?? 0;
      if (ans === correct) {
        earned += xpPerQuestion;
      } else {
        earned += Math.floor(xpPerQuestion / 2);
      }
    });
    return earned;
  };

  const handleCompleteModule = async () => {
    if (!currentModule || isReviewMode) return;
    const earnedXP = calculateEarnedXP();
    const newCompletedCount = localCompletedCount + 1;
    setLocalCompletedCount(newCompletedCount);

    const newProgress = Math.round(
      (newCompletedCount / modules.length) * 100
    );

    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: course.id,
        progress_percentage: newProgress,
        xp_earned: enrollment.xp_earned + earnedXP,
        xp_delta: earnedXP,
      }),
    });

    if (res.ok) {
      setXpGained((x) => x + earnedXP);
    }

    if (newProgress >= 100) {
      const completionBonus = Math.max(
        0,
        course.total_xp_reward - (enrollment.xp_earned + earnedXP)
      );
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

    setQuizAnswers(quizQuestions.map(() => null));
    if (currentIndex < modules.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReviewDay = () => {
    setIsReviewMode(true);
    setQuizAnswers(quizQuestions.map(() => null));
  };

  const progress = Math.round(
    (localCompletedCount / Math.max(modules.length, 1)) * 100
  );

  const allQuizAnswered =
    quizQuestions.length === 0 ||
    (quizAnswers.length === quizQuestions.length &&
      quizAnswers.every((a) => a !== null));

  const canComplete =
    !isReviewMode &&
    (quizSection ? allQuizAnswered : true);

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

          {hasAIContent ? (
            <div className="space-y-6 mb-8">
              {sections.map((section, idx) => {
                if (section.type === 'lesson') {
                  return (
                    <div
                      key={idx}
                      className="prose prose-invert max-w-none rounded-lg p-4 bg-white/5 border border-white/10"
                    >
                      {section.title && (
                        <h3 className="text-lg font-semibold mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="whitespace-pre-wrap text-foreground/90">
                        {section.content}
                      </p>
                    </div>
                  );
                }
                if (section.type === 'exercise') {
                  return (
                    <div
                      key={idx}
                      className="rounded-lg p-4 bg-accent-cyan/10 border border-accent-cyan/30"
                    >
                      {section.title && (
                        <h3 className="text-lg font-semibold mb-2 text-accent-cyan">
                          {section.title}
                        </h3>
                      )}
                      <p className="whitespace-pre-wrap text-foreground/90">
                        {section.instructions}
                      </p>
                    </div>
                  );
                }
                if (section.type === 'quiz') {
                  return (
                    <QuizSection
                      key={idx}
                      section={section}
                      questions={quizQuestions}
                      answers={quizAnswers}
                      onSelect={(qIdx, optIdx) =>
                        setQuizAnswers((prev) => {
                          const next = [...prev];
                          if (qIdx >= next.length) return next;
                          next[qIdx] = optIdx;
                          return next;
                        })
                      }
                    />
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none mb-8">
              {moduleContent.text ? (
                <p className="whitespace-pre-wrap">{moduleContent.text}</p>
              ) : (
                <p className="text-foreground/60">
                  No content in this module yet.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            {isReviewMode ? (
              <button
                onClick={() => setIsReviewMode(false)}
                className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 font-semibold"
              >
                Done
              </button>
            ) : isModuleCompleted(currentIndex) ? (
              <button
                onClick={handleReviewDay}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold"
              >
                <RotateCcw size={18} />
                Review Day (no XP)
              </button>
            ) : (
              <button
                onClick={handleCompleteModule}
                disabled={!canComplete}
                className="px-6 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Day (+
                {allQuizAnswered ? calculateEarnedXP() : '?'} XP)
              </button>
            )}
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i < modules.length - 1 && isModuleUnlocked(i + 1)
                    ? i + 1
                    : i
                )
              }
              disabled={
                currentIndex >= modules.length - 1 ||
                !isModuleUnlocked(currentIndex + 1)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 border border-accent-pink/20 text-center">
          <p className="text-foreground/60 mb-4">
            No modules in this course yet.
          </p>
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
        <h3 className="text-sm font-semibold text-foreground/60 mb-2">
          Days
        </h3>
        <div className="flex flex-wrap gap-2">
          {modules.map((m, i) => {
            const unlocked = isModuleUnlocked(i);
            const completed = isModuleCompleted(i);
            return (
              <button
                key={m.id}
                onClick={() => unlocked && setCurrentIndex(i)}
                disabled={!unlocked}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  currentIndex === i
                    ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                    : completed
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : unlocked
                        ? 'bg-white/5 border border-white/10 hover:border-white/20'
                        : 'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {!unlocked && <Lock size={14} />}
                Day {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuizSection({
  section,
  questions,
  answers,
  onSelect,
}: {
  section: Section;
  questions: QuizQuestion[];
  answers: (number | null)[];
  onSelect: (questionIndex: number, optionIndex: number) => void;
}) {
  return (
    <div className="rounded-lg p-4 bg-accent-pink/10 border border-accent-pink/30 space-y-6">
      {section.title && (
        <h3 className="text-lg font-semibold mb-4 text-accent-pink">
          {section.title}
        </h3>
      )}
      {questions.map((q, qIdx) => {
        const options = q.options ?? [];
        const correctIndex = q.correct_index ?? 0;
        const selectedIndex = answers[qIdx] ?? null;
        const showResult = selectedIndex !== null;

        return (
          <div key={qIdx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
            <p className="font-medium mb-3">
              {qIdx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = idx === correctIndex;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      selectedIndex === null && onSelect(qIdx, idx)
                    }
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      showCorrect
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : showWrong
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : isSelected
                            ? 'bg-accent-pink/20 border-accent-pink/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResult && q.explanation && (
              <p className="mt-3 text-sm text-foreground/70">{q.explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
