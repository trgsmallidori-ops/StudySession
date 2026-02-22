'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, ClipboardList } from 'lucide-react';
import { addMonths, subMonths, format, startOfWeek, addDays } from 'date-fns';
import type { CalendarEvent, Class } from '@/lib/database.types';
import { WEEK_STARTS_ON } from '@/lib/calendar/constants';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import MiniCalendar from './MiniCalendar';
import TestsPanel from './TestsPanel';

export type CalendarViewType = 'month' | 'week' | 'day' | 'tests';

interface CalendarViewProps {
  events: CalendarEvent[];
  classes: Class[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectDate?: (date: Date) => void;
  onSelectSlot?: (date: Date) => void;
  onGenerateStudyCourse?: (topic: string, fromTests?: boolean) => void;
  canGenerateStudyCourse?: boolean;
}

export default function CalendarView({
  events,
  classes,
  onSelectEvent,
  onSelectDate,
  onSelectSlot,
  onGenerateStudyCourse,
  canGenerateStudyCourse = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrev = () => {
    if (view === 'tests') return;
    if (view === 'month') setCurrentDate((d) => subMonths(d, 1));
    else setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - (view === 'week' ? 7 : 1));
      return next;
    });
  };

  const goToNext = () => {
    if (view === 'tests') return;
    if (view === 'month') setCurrentDate((d) => addMonths(d, 1));
    else setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + (view === 'week' ? 7 : 1));
      return next;
    });
  };

  const getHeaderTitle = () => {
    if (view === 'tests') return 'Tests & Grades';
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
      const end = addDays(start, 6);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'EEEE, MMMM d');
  };

  return (
    <div className="flex gap-6 flex-1 min-h-[calc(100dvh-200px)] h-full">
      {/* Sidebar with mini calendar */}
      <div className="hidden lg:block w-56 flex-shrink-0 relative z-10">
        <MiniCalendar
          currentDate={currentDate}
          onDateSelect={(date) => setCurrentDate(date)}
          onMonthChange={(date) => setCurrentDate(date)}
        />
      </div>

      {/* Main calendar area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrev}
              className="p-2 rounded-lg hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="text-xl font-semibold min-w-[200px]">{getHeaderTitle()}</h2>
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg text-sm bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-medium"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {(['month', 'week', 'day', 'tests'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                }`}
              >
                {v === 'month' && <LayoutGrid size={16} className="inline mr-1.5 -mt-0.5" />}
                {v === 'week' && <CalendarDays size={16} className="inline mr-1.5 -mt-0.5" />}
                {v === 'day' && <CalendarDays size={16} className="inline mr-1.5 -mt-0.5" />}
                {v === 'tests' && <ClipboardList size={16} className="inline mr-1.5 -mt-0.5" />}
                {v === 'tests' ? 'Tests & Grades' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 min-h-0 glass rounded-xl border border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4"
              >
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  classes={classes}
                  onSelectDate={(d) => {
                    setCurrentDate(d);
                    onSelectDate?.(d);
                  }}
                  onSelectEvent={onSelectEvent}
                />
              </motion.div>
            )}
            {view === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4 relative"
              >
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  classes={classes}
                  onSelectSlot={onSelectSlot}
                  onSelectEvent={onSelectEvent}
                />
              </motion.div>
            )}
            {view === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4 relative"
              >
                <DayView
                  currentDate={currentDate}
                  events={events}
                  classes={classes}
                  onSelectSlot={onSelectSlot}
                  onSelectEvent={onSelectEvent}
                />
              </motion.div>
            )}
            {view === 'tests' && (
              <motion.div
                key="tests"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TestsPanel
                  events={events}
                  classes={classes}
                  onGenerateStudyCourse={onGenerateStudyCourse ?? (() => {})}
                  onSelectEvent={onSelectEvent}
                  canGenerateStudyCourse={canGenerateStudyCourse}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
