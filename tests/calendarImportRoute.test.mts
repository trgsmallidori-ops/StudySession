import test from 'node:test';
import assert from 'node:assert/strict';

import { processImportOutlineRequest } from '../lib/calendar/importOutlineRequest.ts';

function createSupabaseMock(options?: {
  userId?: string | null;
  classInsertError?: string | null;
  eventInsertError?: string | null;
}) {
  const calls: { table: string; action: string; payload?: unknown }[] = [];
  const userId = options?.userId === undefined ? 'user-1' : options.userId;

  const supabase = {
    auth: {
      getUser: async () => ({
        data: {
          user: userId ? { id: userId } : null,
        },
      }),
    },
    from(table: string) {
      return {
        insert(payload: unknown) {
          calls.push({ table, action: 'insert', payload });

          if (table === 'classes') {
            return {
              select() {
                return {
                  single: async () => {
                    if (options?.classInsertError) {
                      return { data: null, error: { message: options.classInsertError } };
                    }
                    const className = (payload as { name?: string })?.name ?? 'Imported Course';
                    return { data: { id: 'class-1', name: className }, error: null };
                  },
                };
              },
            };
          }

          if (table === 'calendar_events') {
            if (options?.eventInsertError) {
              return Promise.resolve({ error: { message: options.eventInsertError } });
            }
            return Promise.resolve({ error: null });
          }

          return Promise.resolve({ error: null });
        },
        delete() {
          calls.push({ table, action: 'delete' });
          return {
            eq() {
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  };

  return { supabase, calls };
}

test('import-outline returns 401 when user is missing', async () => {
  const { supabase } = createSupabaseMock({ userId: null });
  const response = await processImportOutlineRequest(supabase, {});

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'Unauthorized' });
});

test('import-outline returns 400 for invalid payload', async () => {
  const { supabase } = createSupabaseMock();
  const response = await processImportOutlineRequest(supabase, { courseName: '', schedule: {}, events: [] });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'Invalid import payload' });
});

test('import-outline creates class and only imports selected dated events', async () => {
  const { supabase, calls } = createSupabaseMock();
  const response = await processImportOutlineRequest(supabase, {
    courseName: 'Biology 101',
    schedule: { days: [1, 3], startTime: '09:00', endTime: '10:15' },
    events: [
      { date: '2026-03-10', description: 'Midterm Exam', type: 'test', include: true },
      { date: '', description: 'Final Exam', type: 'test', include: true },
      { date: '2026-04-01', description: 'Essay', type: 'assignment', include: false },
    ],
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    classId: 'class-1',
    className: 'Biology 101',
    eventsImported: 1,
  });

  const eventInsertCall = calls.find((call) => call.table === 'calendar_events' && call.action === 'insert');
  assert.ok(eventInsertCall);
  const payload = eventInsertCall?.payload as Array<{ title: string }>;
  assert.equal(payload.length, 1);
  assert.equal(payload[0].title, 'Midterm Exam');
});

test('import-outline imports dated lecture events extracted from syllabus topic rows', async () => {
  const { supabase, calls } = createSupabaseMock();
  const response = await processImportOutlineRequest(supabase, {
    courseName: 'Physics 101',
    schedule: { days: [1, 3], startTime: '10:00', endTime: '11:15' },
    events: [
      { date: '2026-01-10', description: 'Introduction', type: 'lecture', include: true },
      { date: '2026-01-17', description: 'Kinematics', type: 'lecture', include: true },
    ],
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    classId: 'class-1',
    className: 'Physics 101',
    eventsImported: 2,
  });

  const eventInsertCall = calls.find((call) => call.table === 'calendar_events' && call.action === 'insert');
  assert.ok(eventInsertCall);
  const payload = eventInsertCall?.payload as Array<{ title: string; event_type: string }>;
  assert.equal(payload.length, 2);
  assert.deepEqual(
    payload.map((item) => item.title),
    ['Introduction', 'Kinematics']
  );
  assert.ok(payload.every((item) => item.event_type === 'lecture'));
});

test('import-outline maps extended types and cleans date prefixes from titles', async () => {
  const { supabase, calls } = createSupabaseMock();
  const response = await processImportOutlineRequest(supabase, {
    courseName: 'Business Tech',
    schedule: { days: [2, 4], startTime: '13:00', endTime: '14:15' },
    events: [
      { date: '2026-02-26', description: 'Feb. 26 | TEST 1 |', type: 'exam', category: 'exam', include: true },
      { date: '2026-03-03', description: 'Mar. 3 Reading Chapter 4', type: 'reading', category: 'reading', include: true },
    ],
  });

  assert.equal(response.status, 200);
  const eventInsertCall = calls.find((call) => call.table === 'calendar_events' && call.action === 'insert');
  assert.ok(eventInsertCall);
  const payload = eventInsertCall?.payload as Array<{ title: string; event_type: string }>;

  assert.equal(payload[0].event_type, 'test');
  assert.equal(payload[0].title, 'Exam: TEST 1');
  assert.equal(payload[1].event_type, 'assignment');
  assert.equal(payload[1].title, 'Reading Chapter 4');
});

test('import-outline uses scheduleSlots to assign event times by weekday', async () => {
  const { supabase, calls } = createSupabaseMock();
  const response = await processImportOutlineRequest(supabase, {
    courseName: 'Stats 201',
    schedule: { days: [1], startTime: '09:00', endTime: '10:00' },
    scheduleSlots: [
      { days: [1], startTime: '09:00', endTime: '10:00' },
      { days: [3], startTime: '14:00', endTime: '15:00' },
    ],
    events: [
      { date: '2026-03-02', description: 'Lecture 1', type: 'lecture', include: true },
      { date: '2026-03-04', description: 'Lecture 2', type: 'lecture', include: true },
    ],
  });

  assert.equal(response.status, 200);
  const eventInsertCall = calls.find((call) => call.table === 'calendar_events' && call.action === 'insert');
  assert.ok(eventInsertCall);
  const payload = eventInsertCall?.payload as Array<{ due_date: string }>;

  const first = new Date(payload[0].due_date).getTime();
  const second = new Date(payload[1].due_date).getTime();
  assert.equal((second - first) / (1000 * 60 * 60), 53);
});
