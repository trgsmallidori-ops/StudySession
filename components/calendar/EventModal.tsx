'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { CalendarEvent } from '@/lib/database.types';
import type { Class } from '@/lib/database.types';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  due_date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  event_type: z.enum(['test', 'assignment', 'lecture', 'other']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  class_id: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

const EVENT_TYPES = [
  { value: 'test' as const, label: 'Test' },
  { value: 'assignment' as const, label: 'Assignment' },
  { value: 'lecture' as const, label: 'Lecture' },
  { value: 'other' as const, label: 'Other' },
];

const COLORS = [
  '#00f0ff', '#ff006e', '#9d4edd', '#ffbe0b', '#fb5607',
  '#3a86ff', '#06d6a0', '#ef476f',
];

export interface EventFormPayload {
  title: string;
  due_date: string;
  description?: string;
  event_type: 'test' | 'assignment' | 'lecture' | 'other';
  color: string;
  class_id: string | null;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date | null;
  classes: Class[];
  onSubmit: (data: EventFormPayload) => Promise<void>;
  onDelete?: (event: CalendarEvent) => Promise<void>;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  initialDate,
  classes,
  onSubmit,
  onDelete,
}: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const defaultDueDate = event
    ? new Date(event.due_date)
    : initialDate ?? new Date();
  const defaultDateTime = format(defaultDueDate, "yyyy-MM-dd'T'HH:mm");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      due_date: defaultDateTime,
      description: event?.description ?? '',
      event_type: event?.event_type ?? 'other',
      color: event?.color ?? '#00f0ff',
      class_id: event?.class_id ?? '',
    },
  });

  const color = watch('color');

  const handleFormSubmit = async (data: EventFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        title: data.title,
        due_date: new Date(data.due_date).toISOString(),
        description: data.description || undefined,
        event_type: data.event_type,
        color: data.color,
        class_id: data.class_id || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    if (!confirm('Delete this event?')) return;
    setDeleting(true);
    try {
      await onDelete(event);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-xl p-6 max-w-md w-full border border-accent-cyan/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {event ? 'Edit Event' : 'New Event'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-foreground/80 mb-2">Title</label>
              <input
                {...register('title')}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                placeholder="Event title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                {...register('due_date')}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
              />
              {errors.due_date && (
                <p className="text-red-400 text-sm mt-1">{errors.due_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">Type</label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('event_type', value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      watch('event_type') === value
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50'
                        : 'bg-white/5 border border-white/10 text-foreground/60 hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">Class</label>
              <select
                {...register('class_id')}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
              >
                <option value="">None</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none resize-none"
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Saving...' : event ? 'Update' : 'Create'}
              </button>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 disabled:opacity-50 font-semibold"
                >
                  {deleting ? '...' : 'Delete'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
