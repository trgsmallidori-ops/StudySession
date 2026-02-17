'use client';

import Link from 'next/link';
import { Course } from '@/lib/database.types';
import { BookOpen, Clock, Zap } from 'lucide-react';

interface CourseCardProps {
  course: Course & { creator?: { full_name?: string } };
  enrollment?: { progress_percentage?: number } | null;
}

const DIFFICULTY_COLORS = {
  beginner: 'text-green-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-red-400',
};

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const progress = enrollment?.progress_percentage ?? 0;

  return (
    <Link href={`/learn/${course.id}`}>
      <div className="glass rounded-xl p-6 border border-white/5 hover:border-accent-pink/30 transition-all group">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-lg bg-accent-pink/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="text-accent-pink" size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-accent-pink transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-foreground/60 line-clamp-2 mt-1">
              {course.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-foreground/60">
              <span className={`capitalize ${DIFFICULTY_COLORS[course.difficulty]}`}>
                {course.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {course.duration_days} days
              </span>
              <span className="flex items-center gap-1 text-xp-start">
                <Zap size={14} />
                {course.total_xp_reward} XP
              </span>
            </div>
            {progress > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-1">{progress}% complete</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
