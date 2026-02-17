'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import type { CalendarEvent } from '@/lib/database.types';
import { FileText, ClipboardList, BookOpen, Circle } from 'lucide-react';

const EVENT_ICONS = {
  test: FileText,
  assignment: ClipboardList,
  lecture: BookOpen,
  other: Circle,
};

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectDate?: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function MonthView({
  currentDate,
  events,
  onSelectDate,
  onSelectEvent,
}: MonthViewProps) {
  const { weeks, monthStart } = useMemo(() => {
    const monthStartDate = startOfMonth(currentDate);
    const monthEndDate = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStartDate, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEndDate, { weekStartsOn: 1 });

    const weeks: Date[][] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }

    return { weeks, monthStart: monthStartDate };
  }, [currentDate]);

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.due_date), date));

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-white/5 mb-2">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-sm font-medium text-foreground/60"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
        {weeks.map((week, weekIdx) =>
          week.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: weekIdx * 0.02 }}
                className={`
                  min-h-[80px] border border-white/5 flex flex-col overflow-hidden
                  ${!isCurrentMonth ? 'bg-white/[0.02]' : ''}
                `}
              >
                <button
                  type="button"
                  onClick={() => onSelectDate?.(day)}
                  className={`
                    w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center
                    flex-shrink-0 mt-1 ml-1 transition-all
                    ${isTodayDate ? 'bg-accent-cyan/30 text-accent-cyan neon-cyan' : ''}
                    ${!isCurrentMonth ? 'text-foreground/40' : 'text-foreground'}
                    hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50
                  `}
                >
                  {format(day, 'd')}
                </button>

                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const Icon = EVENT_ICONS[event.event_type] ?? Circle;
                    return (
                      <motion.button
                        key={event.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent?.(event);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs truncate flex items-center gap-1.5
                          hover:bg-white/10 transition-colors border-l-2"
                        style={{ borderLeftColor: event.color }}
                      >
                        <Icon size={12} className="flex-shrink-0 text-foreground/60" />
                        <span className="truncate">{event.title}</span>
                      </motion.button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-foreground/50 px-2">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
