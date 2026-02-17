'use client';

import { useState } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/learn/CourseCard';
import XPBar from '@/components/learn/XPBar';
import { Course } from '@/lib/database.types';

interface LearnPageClientProps {
  courses: (Course & { creator?: { full_name?: string } })[];
  enrollmentMap: Record<string, { progress_percentage?: number }>;
  totalXP: number;
}

export default function LearnPageClient({
  courses: initialCourses,
  enrollmentMap,
  totalXP,
}: LearnPageClientProps) {
  const [courses] = useState(initialCourses);
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all'
      ? courses
      : courses.filter((c) => c.difficulty === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learn</h1>
          <p className="text-foreground/70">
            Browse courses, earn XP, and unlock achievements.
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-accent-pink/20 w-full md:w-80">
          <XPBar currentXP={totalXP} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
        {['all', 'beginner', 'intermediate', 'advanced'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/50'
                : 'bg-white/5 border border-white/10 hover:border-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        </div>
        <Link
          href="/learn/create"
          className="px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold"
        >
          Create Course
        </Link>
      </div>

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
          No courses found. Check back soon or create your own!
        </div>
      )}
    </div>
  );
}
