'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { WEEKDAY_OPTIONS, sortDaysByWeekStart } from '@/lib/calendar/constants';

export interface ScheduleSlot {
  days: number[];
  startTime: string;
  endTime: string;
}

interface ScheduleInputModalProps {
  isOpen: boolean;
  courseName: string;
  isSubmitting?: boolean;
  /** When true, AI found the schedule - user can confirm or override */
  scheduleFoundByAI?: boolean;
  /** Pre-filled values from AI when partially or fully found */
  initialDays?: number[];
  initialStartTime?: string;
  initialEndTime?: string;
  onConfirm: (slots: ScheduleSlot[]) => void;
  onCancel: () => void;
}

export default function ScheduleInputModal({
  isOpen,
  courseName,
  isSubmitting = false,
  scheduleFoundByAI = false,
  initialDays = [],
  initialStartTime = '09:00',
  initialEndTime = '10:00',
  onConfirm,
  onCancel,
}: ScheduleInputModalProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const [slots, setSlots] = useState<ScheduleSlot[]>([
    {
      days: initialDays,
      startTime: initialStartTime,
      endTime: initialEndTime,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setSlots([
        {
          days: initialDays,
          startTime: initialStartTime,
          endTime: initialEndTime,
        },
      ]);
    }
  }, [isOpen, initialDays, initialStartTime, initialEndTime]);

  const toggleDay = (slotIndex: number, day: number) => {
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

  const updateSlot = (slotIndex: number, field: keyof ScheduleSlot, value: number[] | string) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === slotIndex ? { ...slot, [field]: value } : slot))
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { days: [], startTime: '09:00', endTime: '10:00' }]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const validSlots = slots.filter(
      (s) => s.days.length > 0 && s.startTime && s.endTime
    );
    if (validSlots.length > 0) {
      onConfirm(validSlots);
    } else {
      setValidationError('Please select at least one day and enter start and end times.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 max-w-lg w-full border border-accent-cyan/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">
              {scheduleFoundByAI ? 'Confirm or edit schedule' : 'Schedule not found'}
            </h3>
            <p className="text-foreground/70 text-sm mt-1">
              {scheduleFoundByAI ? (
                <>
                  Review the schedule for <strong>{courseName}</strong>. Your selections will override
                  what the AI found.
                </>
              ) : (
                <>
                  The AI couldn&apos;t find when <strong>{courseName}</strong> meets. Please enter
                  the days and times.
                </>
              )}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {validationError && (
            <p className="text-red-400 text-sm">{validationError}</p>
          )}
          {/* Primary schedule form - shown first */}
          {slots.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground/80">
                  {slotIndex === 0
                    ? 'When does this class meet?'
                    : `Time slot ${slotIndex + 1}`}
                </span>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(slotIndex)}
                    className="text-red-400 hover:text-red-300 p-1"
                    aria-label="Remove slot"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm text-foreground/80 mb-2">Days</label>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleDay(slotIndex, value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        slot.days.includes(value)
                          ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50'
                          : 'bg-white/5 border border-white/10 text-foreground/60 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground/80 mb-2">Start time</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(slotIndex, 'startTime', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 mb-2">End time</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(slotIndex, 'endTime', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={addSlot}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-accent-cyan transition-colors"
            >
              <Plus size={16} />
              Add another time slot
            </button>
            <p className="text-xs text-foreground/50 mt-1">
              For classes with different days or times (e.g. Mon 9am and Wed 2pm)
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding to calendar...' : 'Continue'}
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
        </form>
      </div>
    </div>
  );
}
