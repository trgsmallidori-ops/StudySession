'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Course, CourseModule } from '@/lib/database.types';
import { BookOpen, Play, Edit, Zap } from 'lucide-react';

interface CourseDetailClientProps {
  course: Course & { creator?: { full_name?: string } };
  modules: CourseModule[];
  enrollment: { progress_percentage?: number } | null;
  isCreator: boolean;
}

export default function CourseDetailClient({
  course,
  modules,
  enrollment,
  isCreator,
}: CourseDetailClientProps) {
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();
  const progress = enrollment?.progress_percentage ?? 0;

  const handleEnroll = async () => {
    setEnrolling(true);
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: course.id }),
    });
    setEnrolling(false);
    if (res.ok) router.push(`/learn/${course.id}/enroll`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-2xl p-8 border border-accent-pink/20 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-xl bg-accent-pink/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-accent-pink" size={48} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-foreground/70">{course.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-foreground/60">
                  <span className="capitalize">{course.difficulty}</span>
                  <span>{course.duration_days} days</span>
                  <span className="flex items-center gap-1 text-xp-start">
                    <Zap size={16} />
                    {course.total_xp_reward} XP
                  </span>
                </div>
              </div>
              {isCreator && (
                <Link
                  href={`/learn/${course.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cyan/50"
                >
                  <Edit size={18} />
                  Edit
                </Link>
              )}
            </div>
            {progress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="mt-6">
              {enrollment ? (
                <Link
                  href={`/learn/${course.id}/enroll`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold"
                >
                  <Play size={20} />
                  {progress > 0 ? 'Continue' : 'Start'} Course
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold disabled:opacity-50"
                >
                  <Play size={20} />
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <div className="space-y-3">
          {modules.map((m, i) => (
            <div
              key={m.id}
              className="glass rounded-lg p-4 border border-white/5 flex items-center gap-4"
            >
              <span className="w-8 h-8 rounded-full bg-accent-pink/20 flex items-center justify-center text-accent-pink font-bold text-sm">
                {i + 1}
              </span>
              <span className="font-medium">{m.title}</span>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="text-foreground/60">No modules yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
