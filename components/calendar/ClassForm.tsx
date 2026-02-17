'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  days_of_week: z.array(z.number().min(0).max(6)),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const COLORS = [
  '#00f0ff', '#ff006e', '#9d4edd', '#ffbe0b', '#fb5607',
  '#3a86ff', '#06d6a0', '#ef476f',
];

interface ClassFormProps {
  initialData?: Partial<ClassFormData> & { id?: string };
  onSubmit: (data: ClassFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ClassForm({ initialData, onSubmit, onCancel }: ClassFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      color: initialData?.color ?? '#00f0ff',
      days_of_week: initialData?.days_of_week ?? [],
      start_time: initialData?.start_time ?? undefined,
      end_time: initialData?.end_time ?? undefined,
    },
  });

  const color = watch('color');
  const daysOfWeek = watch('days_of_week') ?? [];

  const toggleDay = (day: number) => {
    const current = daysOfWeek as number[];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    setValue('days_of_week', next);
  };

  const handleFormSubmit = async (data: ClassFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-foreground/80 mb-2">Class Name</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
          placeholder="e.g. Calculus 101"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
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
        <input
          type="text"
          {...register('color')}
          className="mt-2 w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground/80 mb-2">Days of Week</label>
        <div className="flex gap-2">
          {DAYS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                (daysOfWeek as number[]).includes(value)
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
          <label className="block text-sm text-foreground/80 mb-2">Start Time</label>
          <input
            type="time"
            {...register('start_time')}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">End Time</label>
          <input
            type="time"
            {...register('end_time')}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 disabled:opacity-50 font-semibold"
        >
          {loading ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
