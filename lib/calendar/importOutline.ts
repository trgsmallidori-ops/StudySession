import { z } from 'zod';

const ImportedTypeSchema = z.enum([
  'test',
  'assignment',
  'lecture',
  'other',
  'quiz',
  'reading',
  'exam',
  'final',
  'midterm',
  'lab',
  'project',
  'homework',
]);
const ImportedCategorySchema = z.enum([
  'quiz',
  'reading',
  'exam',
  'final',
  'midterm',
  'assignment',
  'lecture',
  'lab',
  'other',
]);

const ImportedEventSchema = z.object({
  date: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  description: z.string().trim().min(1),
  type: ImportedTypeSchema,
  category: ImportedCategorySchema.optional(),
  include: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  weight: z.number().min(0).max(100).optional(),
});

const ScheduleSlotSchema = z.object({
  days: z.array(z.number().int().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const ImportOutlineSchema = z.object({
  courseName: z.string().trim().min(1),
  courseCode: z.string().trim().nullable().optional(),
  assignmentWeights: z.record(z.string(), z.number()).optional(),
  termStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  termEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  schedule: ScheduleSlotSchema,
  scheduleSlots: z.array(ScheduleSlotSchema).min(1).optional(),
  events: z.array(ImportedEventSchema).default([]),
});

type ImportOutlinePayload = z.infer<typeof ImportOutlineSchema>;

export interface ImportOutlineSuccess {
  classId: string;
  className: string;
  eventsImported: number;
}

type ImportOutlineResult =
  | { ok: true; data: ImportOutlineSuccess }
  | { ok: false; status: number; error: string };

function mapTypeToBase(type: z.infer<typeof ImportedTypeSchema>): 'test' | 'assignment' | 'lecture' | 'other' {
  if (type === 'quiz' || type === 'exam' || type === 'final' || type === 'midterm' || type === 'test') return 'test';
  if (type === 'reading' || type === 'homework' || type === 'project' || type === 'assignment') return 'assignment';
  if (type === 'lecture' || type === 'lab') return 'lecture';
  return 'other';
}

function normalizeImportedTitle(raw: string): string {
  const compact = raw.replace(/\s+/g, ' ').trim();
  const cells = compact
    .split(/\||\t/g)
    .map((v) => v.trim())
    .filter(Boolean);
  if (cells.length > 1) {
    const filtered = cells.filter(
      (value) =>
        !/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.]?\s*\d{1,2}\b|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/i.test(
          value
        ) && !/^\d+%$/.test(value)
    );
    if (filtered.length) return filtered.join(' - ').slice(0, 180);
  }
  return compact
    .replace(
      /^\s*(?:\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.]?\s*\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?\b|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b)(?:\s*[,&/]\s*\d{1,2})?\s*[:|,-]?\s*/i,
      ''
    )
    .trim()
    .slice(0, 180);
}

function applyCategoryLabel(title: string, category?: z.infer<typeof ImportedCategorySchema>): string {
  const labelMap: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final: 'Final',
    midterm: 'Midterm',
    reading: 'Reading',
    lab: 'Lab',
  };
  if (!category || !labelMap[category]) return title;
  const label = labelMap[category];
  if (new RegExp(`\\b${label}\\b`, 'i').test(title)) return title;
  return `${label}: ${title}`;
}

export function validateImportOutlinePayload(payload: unknown) {
  return ImportOutlineSchema.safeParse(payload);
}

export async function importOutlineForUser(
  supabase: any,
  userId: string,
  payload: ImportOutlinePayload
): Promise<ImportOutlineResult> {
  const parsed = ImportOutlineSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, status: 400, error: 'Invalid import payload' };
  }

  const data = parsed.data;
  const scheduleSlots = data.scheduleSlots?.length ? data.scheduleSlots : [data.schedule];
  const combinedDays = [...new Set(scheduleSlots.flatMap((slot) => slot.days))].sort((a, b) => a - b);
  const primarySlot = scheduleSlots[0];
  const selectedEvents = data.events.filter((event) => event.include && /^\d{4}-\d{2}-\d{2}$/.test(event.date));

  const classInsert: Record<string, unknown> = {
    user_id: userId,
    name: data.courseName,
    color: '#00f0ff',
    days_of_week: combinedDays,
    start_time: primarySlot.startTime,
    end_time: primarySlot.endTime,
  };
  if (data.courseCode != null && data.courseCode !== '') {
    classInsert.course_code = data.courseCode;
  }
  if (data.termStartDate != null && data.termStartDate !== '') {
    classInsert.term_start_date = data.termStartDate;
  }
  if (data.termEndDate != null && data.termEndDate !== '') {
    classInsert.term_end_date = data.termEndDate;
  }
  if (data.assignmentWeights != null && Object.keys(data.assignmentWeights).length > 0) {
    classInsert.assignment_weights = data.assignmentWeights;
  }

  const { data: insertedClass, error: classError } = await supabase
    .from('classes')
    .insert(classInsert)
    .select('id, name')
    .single();

  if (classError || !insertedClass) {
    return { ok: false, status: 500, error: classError?.message ?? 'Failed to create class' };
  }

  if (selectedEvents.length > 0) {
    const resolveEventTime = (eventDate: string, eventTime?: string) => {
      if (eventTime && /^\d{2}:\d{2}$/.test(eventTime)) return eventTime;
      const weekday = new Date(`${eventDate}T00:00:00`).getDay();
      const matchingSlot = scheduleSlots.find((slot) => slot.days.includes(weekday));
      return matchingSlot?.startTime ?? primarySlot.startTime;
    };

    const eventRows = selectedEvents.map((event) => ({
      user_id: userId,
      class_id: insertedClass.id,
      title: applyCategoryLabel(normalizeImportedTitle(event.description), event.category),
      description: null,
      event_type: mapTypeToBase(event.type),
      due_date: new Date(`${event.date}T${resolveEventTime(event.date, event.time)}:00`).toISOString(),
      color: event.color ?? '#00f0ff',
      ...(event.weight != null && { weight: event.weight }),
    }));

    const { error: eventError } = await supabase.from('calendar_events').insert(eventRows);
    if (eventError) {
      await supabase.from('classes').delete().eq('id', insertedClass.id);
      return { ok: false, status: 500, error: eventError.message ?? 'Failed to create events' };
    }
  }

  return {
    ok: true,
    data: {
      classId: insertedClass.id,
      className: insertedClass.name,
      eventsImported: selectedEvents.length,
    },
  };
}
