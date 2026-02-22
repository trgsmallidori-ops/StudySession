'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, setHours, setMinutes, isSameDay } from 'date-fns';
import type { CalendarEvent, Class } from '@/lib/database.types';
import { FileText, ClipboardList, BookOpen, Circle } from 'lucide-react';

const EVENT_ICONS = {
  test: FileText,
  assignment: ClipboardList,
  lecture: BookOpen,
  other: Circle,
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7am to 11pm

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  classes: Class[];
  onSelectSlot?: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function DayView({
  currentDate,
  events,
  classes,
  onSelectSlot,
  onSelectEvent,
}: DayViewProps) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(new Date(e.due_date), currentDate)),
    [events, currentDate]
  );

  const getEventPosition = (event: CalendarEvent) => {
    const d = new Date(event.due_date);
    const hours = d.getHours() + d.getMinutes() / 60;
    const topPercent = ((hours - 7) / 16) * 100;
    return Math.max(0, Math.min(100, topPercent));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="py-3 px-4 border-b border-white/5 flex-shrink-0">
        <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d')}</h3>
      </div>

      {/* Time slots */}
      <div className="flex-1 overflow-auto min-h-0 relative">
        {HOURS.map((hour) => {
          const slotDate = setMinutes(setHours(currentDate, hour), 0);
          return (
            <div
              key={hour}
              className="flex h-16 border-b border-white/5"
            >
              <div className="w-20 flex-shrink-0 py-1 pr-2 text-right text-sm text-foreground/50">
                {format(slotDate, 'h a')}
              </div>
              <button
                type="button"
                onClick={() => onSelectSlot?.(slotDate)}
                className="flex-1 hover:bg-white/5 transition-colors"
              />
            </div>
          );
        })}

        {/* Events overlay */}
        <div className="absolute inset-0 pointer-events-none pl-20 pt-0">
          <div className="relative h-full">
            {dayEvents.map((event) => {
              const topPercent = getEventPosition(event);
              const Icon = EVENT_ICONS[event.event_type] ?? Circle;
              const classLabel = event.class_id ? classes.find((c) => c.id === event.class_id)?.name : null;
              return (
                <motion.button
                  key={event.id}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectEvent?.(event)}
                  className="absolute left-2 right-2 rounded-lg px-3 py-2
                    overflow-hidden border-l-4 pointer-events-auto
                    hover:bg-white/10 transition-colors"
                  style={{
                    top: `${topPercent}%`,
                    backgroundColor: `${event.color}20`,
                    borderLeftColor: event.color,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="flex-shrink-0 text-foreground/60" />
                    <span className="font-medium truncate">{event.title}</span>
                  </div>
                  <div className="text-sm text-foreground/60 mt-0.5 flex items-center gap-2">
                    {classLabel && <span>{classLabel}</span>}
                    <span>{format(new Date(event.due_date), 'h:mm a')}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
