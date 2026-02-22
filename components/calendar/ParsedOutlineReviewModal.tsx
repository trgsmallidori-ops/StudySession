'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { WEEKDAY_OPTIONS, sortDaysByWeekStart } from '@/lib/calendar/constants';

type ParsedEventType =
  | 'test'
  | 'assignment'
  | 'lecture'
  | 'other'
  | 'quiz'
  | 'reading'
  | 'exam'
  | 'final'
  | 'midterm'
  | 'lab'
  | 'project'
  | 'homework';

type ParsedOutline = {
  courseName: string;
  courseCode?: string | null;
  assignmentWeights?: Record<string, number>;
  termStartDate?: string | null;
  termEndDate?: string | null;
  events?: {
    date: string;
    time?: string;
    description: string;
    type: ParsedEventType;
    category?: 'quiz' | 'reading' | 'exam' | 'final' | 'midterm' | 'assignment' | 'lecture' | 'lab' | 'other';
    confidence: number;
    needsReview: boolean;
    sourceSnippet: string;
    include?: boolean;
    weight?: number;
  }[];
  scheduleSlots?: Array<{
    days: number[];
    startTime: string;
    endTime: string;
  }>;
  schedule: {
    days: number[] | 'NEEDS_INPUT';
    startTime: string | 'NEEDS_INPUT';
    endTime: string | 'NEEDS_INPUT';
    confidence?: number;
    needsReview?: boolean;
  };
  meta?: {
    parserVersion?: string;
    warnings?: string[];
    extractedSections?: string[];
  };
};

interface ReviewModalProps {
  isOpen: boolean;
  parsed: ParsedOutline | null;
  isSubmitting?: boolean;
  onConfirm: (reviewed: ParsedOutline) => void;
  onCancel: () => void;
}

type EditableSlot = {
  days: number[];
  startTime: string;
  endTime: string;
};

type EditableEvent = {
  date: string;
  time: string;
  description: string;
  type: ParsedEventType;
  category?: 'quiz' | 'reading' | 'exam' | 'final' | 'midterm' | 'assignment' | 'lecture' | 'lab' | 'other';
  confidence: number;
  needsReview: boolean;
  sourceSnippet: string;
  include: boolean;
  weight: number | '';
};

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

function toWeekday(dateText: string): number | null {
  if (!isValidDate(dateText)) return null;
  const parsed = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getDay();
}

export default function ParsedOutlineReviewModal({
  isOpen,
  parsed,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ReviewModalProps) {
  const [courseName, setCourseName] = useState('');
  const [slots, setSlots] = useState<EditableSlot[]>([]);
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !parsed) return;
    setError(null);
    setCourseName(parsed.courseName || 'Imported Course');

    const nextSlots = (parsed.scheduleSlots && parsed.scheduleSlots.length > 0
      ? parsed.scheduleSlots
      : [
          {
            days: parsed.schedule.days !== 'NEEDS_INPUT' ? sortDaysByWeekStart(parsed.schedule.days) : [],
            startTime:
              parsed.schedule.startTime !== 'NEEDS_INPUT' && isValidTime(String(parsed.schedule.startTime).slice(0, 5))
                ? String(parsed.schedule.startTime).slice(0, 5)
                : '09:00',
            endTime:
              parsed.schedule.endTime !== 'NEEDS_INPUT' && isValidTime(String(parsed.schedule.endTime).slice(0, 5))
                ? String(parsed.schedule.endTime).slice(0, 5)
                : '10:00',
          },
        ]);

    setSlots(nextSlots);

    const fallbackStart = nextSlots[0]?.startTime && isValidTime(nextSlots[0].startTime) ? nextSlots[0].startTime : '';
    const keyEvents = (parsed.events ?? []).filter((e) => e.date);
    setEvents(
      keyEvents.map((event) => ({
        ...event,
        time: event.time && isValidTime(event.time) ? event.time : fallbackStart,
        include: event.include ?? true,
        weight: event.weight ?? '',
      }))
    );
  }, [isOpen, parsed]);

  const validSlots = useMemo(
    () =>
      slots
        .map((slot) => ({
          days: sortDaysByWeekStart(slot.days.filter((value) => value >= 0 && value <= 6)),
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
        .filter((slot) => slot.days.length > 0 && isValidTime(slot.startTime) && isValidTime(slot.endTime)),
    [slots]
  );

  if (!isOpen || !parsed) return null;

  const toggleSlotDay = (slotIndex: number, day: number) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === slotIndex
          ? {
              ...slot,
              days: slot.days.includes(day)
                ? slot.days.filter((d) => d !== day)
                : sortDaysByWeekStart([...slot.days, day]),
            }
          : slot
      )
    );
  };

  const updateSlot = (slotIndex: number, key: keyof EditableSlot, value: string | number[]) => {
    setSlots((prev) => prev.map((slot, i) => (i === slotIndex ? { ...slot, [key]: value } : slot)));
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { days: [], startTime: '09:00', endTime: '10:00' }]);
  };

  const removeSlot = (slotIndex: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== slotIndex));
  };

  const updateEvent = (index: number, key: keyof EditableEvent, value: string | boolean | number) => {
    setEvents((prev) => prev.map((event, i) => (i === index ? { ...event, [key]: value } : event)));
  };

  const getFallbackEventTime = (dateText: string): string | null => {
    const day = toWeekday(dateText);
    if (day !== null) {
      const match = validSlots.find((slot) => slot.days.includes(day));
      if (match) return match.startTime;
    }
    return validSlots[0]?.startTime ?? null;
  };

  const handleConfirm = () => {
    setError(null);

    if (!courseName.trim()) {
      setError('Course name is required.');
      return;
    }

    if (!validSlots.length) {
      setError('Add at least one valid class schedule slot with day and time.');
      return;
    }

    const included = events.filter((event) => event.include);
    if (events.length > 0 && !included.length) {
      setError('Select at least one event to import.');
      return;
    }

    const resolvedEvents: EditableEvent[] = [];
    for (const event of events) {
      if (!event.include) {
        resolvedEvents.push(event);
        continue;
      }

      if (!isValidDate(event.date)) {
        setError('Every included event needs a date in YYYY-MM-DD format.');
        return;
      }

      const fallbackTime = getFallbackEventTime(event.date);
      const resolvedTime = isValidTime(event.time) ? event.time : fallbackTime;
      if (!resolvedTime || !isValidTime(resolvedTime)) {
        setError('Enter a time for included events or provide a class slot that matches the event day.');
        return;
      }

      const weight = typeof event.weight === 'number' && event.weight >= 0 && event.weight <= 100 ? event.weight : undefined;
      resolvedEvents.push({ ...event, time: resolvedTime, ...(weight != null && { weight }) });
    }

    onConfirm({
      ...parsed,
      courseName: courseName.trim(),
      scheduleSlots: validSlots,
      schedule: {
        ...parsed.schedule,
        days: validSlots[0].days,
        startTime: validSlots[0].startTime,
        endTime: validSlots[0].endTime,
        needsReview: false,
      },
      events: resolvedEvents.map((e) => {
        const { weight, ...rest } = e;
        return { ...rest, ...(typeof weight === 'number' && weight >= 0 && weight <= 100 && { weight }) };
      }),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 max-w-5xl w-full border border-accent-cyan/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">Review extracted syllabus data</h3>
            <p className="text-foreground/70 text-sm mt-1">
              Confirm schedule slots and fill any missing event date/time before import.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 text-foreground/70"
          >
            <X size={20} />
          </button>
        </div>

        {parsed.meta?.warnings?.length ? (
          <div className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            {parsed.meta.warnings.join(' ')}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="font-semibold">Course and class schedule</h4>
            <div>
              <label className="block text-sm text-foreground/80 mb-2">Course name</label>
              <input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
              />
            </div>

            {slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="p-3 rounded-lg bg-background/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Slot {slotIndex + 1}</span>
                  {slots.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSlot(slotIndex)}
                      className="text-red-300 hover:text-red-200"
                      aria-label="Remove slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={`${slotIndex}-${value}`}
                      type="button"
                      onClick={() => toggleSlotDay(slotIndex, value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        slot.days.includes(value)
                          ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50'
                          : 'bg-white/5 border border-white/10 text-foreground/60 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(slotIndex, 'startTime', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(slotIndex, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSlot}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-accent-cyan"
            >
              <Plus size={16} /> Add another class time slot
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-semibold mb-3">What you&apos;ll be doing each day</h4>
            {events.length === 0 ? (
              <p className="text-sm text-foreground/60">No dated events were found in the tentative schedule.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={`${event.description}-${event.date}-${index}`} className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 p-2 rounded-lg bg-background/40 border border-white/10 items-center">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={event.include}
                        onChange={(e) => updateEvent(index, 'include', e.target.checked)}
                      />
                      <span className="text-foreground/70">Use</span>
                    </label>
                    <div className="text-sm text-foreground/90">{event.description}</div>
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateEvent(index, 'date', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error ? <p className="text-red-400 text-sm mt-4">{error}</p> : null}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save and import'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
