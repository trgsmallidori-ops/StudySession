'use client';

import { useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { BookOpen } from 'lucide-react';
import type { CalendarEvent, Class } from '@/lib/database.types';

interface TestsPanelProps {
  events: CalendarEvent[];
  classes: Class[];
  onGenerateStudyCourse: (topic: string, fromTests?: boolean) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  canGenerateStudyCourse?: boolean;
}

export default function TestsPanel({
  events,
  classes,
  onGenerateStudyCourse,
  onSelectEvent,
  canGenerateStudyCourse = false,
}: TestsPanelProps) {
  const testEvents = useMemo(() => {
    return events
      .filter((e) => e.event_type === 'test')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [events]);

  const byClass = useMemo(() => {
    const map = new Map<string | null, CalendarEvent[]>();
    for (const e of testEvents) {
      const key = e.class_id ?? 'uncategorized';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [testEvents]);

  const getClassName = (classId: string | null) => {
    if (!classId || classId === 'uncategorized') return 'Other';
    return classes.find((c) => c.id === classId)?.name ?? 'Unknown';
  };

  const getDaysUntil = (dueDate: string) => {
    const due = parseISO(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return differenceInDays(due, today);
  };

  if (testEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-foreground/70 mb-2">No tests or exams on your calendar yet.</p>
        <p className="text-sm text-foreground/50">
          Upload a course syllabus to automatically add tests, or add them manually.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {Array.from(byClass.entries()).map(([classId, evts]) => (
          <div key={classId ?? 'uncategorized'} className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              {getClassName(classId)}
            </h3>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-left">
                    <th className="px-4 py-3 font-medium text-foreground/80">Test</th>
                    <th className="px-4 py-3 font-medium text-foreground/80">Date</th>
                    <th className="px-4 py-3 font-medium text-foreground/80">Days until</th>
                    <th className="px-4 py-3 font-medium text-foreground/80">Weight</th>
                    {canGenerateStudyCourse && (
                      <th className="px-4 py-3 font-medium text-foreground/80 w-40">Study</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {evts.map((event) => {
                    const daysUntil = getDaysUntil(event.due_date);
                    const weight = event.weight != null ? `${event.weight}%` : '?';
                    return (
                      <tr
                        key={event.id}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onSelectEvent?.(event)}
                            className="text-left text-foreground hover:text-accent-cyan hover:underline"
                          >
                            {event.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {format(parseISO(event.due_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              daysUntil < 0
                                ? 'text-red-400'
                                : daysUntil <= 7
                                  ? 'text-amber-400 font-medium'
                                  : 'text-foreground/70'
                            }
                          >
                            {daysUntil < 0 ? 'Past' : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{weight}</td>
                        {canGenerateStudyCourse && (
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => onGenerateStudyCourse(event.title, true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 text-xs font-medium transition-colors"
                            >
                              <BookOpen size={14} />
                              Generate Study Course
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
