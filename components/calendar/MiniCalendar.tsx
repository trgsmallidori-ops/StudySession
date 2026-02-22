'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isToday,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { WEEKDAY_MIN, WEEK_STARTS_ON } from '@/lib/calendar/constants';

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

export default function MiniCalendar({
  currentDate,
  onDateSelect,
  onMonthChange,
}: MiniCalendarProps) {
  const { weeks, monthStart } = useMemo(() => {
    const monthStartDate = startOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStartDate, { weekStartsOn: WEEK_STARTS_ON });

    const weeks: Date[][] = [];
    let day = calendarStart;

    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }

    return { weeks, monthStart: monthStartDate };
  }, [currentDate]);

  return (
    <div className="glass rounded-xl p-4 border border-white/5 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMonthChange?.(subMonths(currentDate, 1))}
          className="p-1 rounded hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm font-semibold">{format(currentDate, 'MMMM yyyy')}</span>
        <button
          type="button"
          onClick={() => onMonthChange?.(addMonths(currentDate, 1))}
          className="p-1 rounded hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {WEEKDAY_MIN.map((name, i) => (
          <div key={i} className="text-center text-[10px] text-foreground/50 font-medium">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weeks.flat().map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square min-w-[28px] min-h-[28px] rounded-md text-xs flex items-center justify-center
                cursor-pointer transition-colors select-none
                ${!isCurrentMonth ? 'text-foreground/40' : 'text-foreground'}
                ${isTodayDate ? 'bg-accent-cyan/30 text-accent-cyan font-semibold' : 'hover:bg-white/10'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
