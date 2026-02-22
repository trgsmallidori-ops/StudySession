'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  format,
  setHours,
  setMinutes,
} from 'date-fns';
import type { CalendarEvent, Class } from '@/lib/database.types';
import { FileText, ClipboardList, BookOpen, Circle } from 'lucide-react';
import { WEEK_STARTS_ON } from '@/lib/calendar/constants';

const EVENT_ICONS = {
  test: FileText,
  assignment: ClipboardList,
  lecture: BookOpen,
  other: Circle,
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7am to 11pm

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  classes: Class[];
  onSelectSlot?: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function WeekView({
  currentDate,
  events,
  classes,
  onSelectSlot,
  onSelectEvent,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getEventPosition = (event: CalendarEvent) => {
    const d = new Date(event.due_date);
    const hours = d.getHours() + d.getMinutes() / 60;
    const topPercent = ((hours - 7) / 16) * 100;
    return Math.max(0, Math.min(100, topPercent));
  };

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.due_date), date));

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-white/5 flex-shrink-0">
        <div className="w-14 border-r border-white/5" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`py-2 text-center text-sm border-r border-white/5 last:border-r-0 ${
              isToday(day) ? 'bg-accent-cyan/10 text-accent-cyan font-semibold' : 'text-foreground'
            }`}
          >
            <div>{format(day, 'EEE')}</div>
            <div className="text-xs text-foreground/60">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Time grid with events - use grid for alignment */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="grid grid-cols-8" style={{ minHeight: HOURS.length * 64 }}>
          {/* Time column */}
          <div className="flex flex-col">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-white/5 flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-xs text-foreground/50">
                  {format(setMinutes(setHours(new Date(), hour), 0), 'h a')}
                </span>
              </div>
            ))}
          </div>
          {/* Day columns with slots and events */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative flex flex-col border-l border-white/5">
              {HOURS.map((hour) => {
                const slotDate = setMinutes(setHours(day, hour), 0);
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => onSelectSlot?.(slotDate)}
                    className="h-16 border-b border-white/5 hover:bg-white/5 transition-colors"
                  />
                );
              })}
              {/* Events overlay for this day */}
              <div className="absolute inset-0 pointer-events-none pt-0">
                <div className="relative h-full pointer-events-auto">
                  {getEventsForDay(day).map((event) => {
                    const topPx = (getEventPosition(event) / 100) * HOURS.length * 64;
                    const Icon = EVENT_ICONS[event.event_type] ?? Circle;
                    const classLabel = event.class_id ? classes.find((c) => c.id === event.class_id)?.name : null;
                    return (
                      <motion.button
                        key={event.id}
                        type="button"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectEvent?.(event)}
                        className="absolute left-1 right-1 rounded px-2 py-1 text-xs
                          overflow-hidden border-l-2
                          hover:bg-white/10 transition-colors"
                        style={{
                          top: topPx,
                          height: 48,
                          backgroundColor: `${event.color}20`,
                          borderLeftColor: event.color,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className="flex-shrink-0 text-foreground/60" />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <div className="text-[10px] text-foreground/60 truncate flex items-center gap-1">
                          {classLabel && <span>{classLabel}</span>}
                          <span>{format(new Date(event.due_date), 'h:mm a')}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
