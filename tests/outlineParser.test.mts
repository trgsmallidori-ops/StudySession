import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectSlashDateOrder,
  normalizeDate,
  normalizeTime,
  parseDaysFromText,
  parseOutlineHybrid,
} from '../lib/calendar/outlineParser.ts';

test('normalizeDate handles common formats', () => {
  assert.equal(normalizeDate('Jan 5', 2026), '2026-01-05');
  assert.equal(normalizeDate('January 5, 2026', 2025), '2026-01-05');
  assert.equal(normalizeDate('9/7', 2026), '2026-09-07');
  assert.equal(normalizeDate('09/07/26', 2025), '2026-09-07');
  assert.equal(normalizeDate('13/42/26', 2026), null);
});

test('normalizeTime handles 12h and 24h formats', () => {
  assert.equal(normalizeTime('9am'), '09:00');
  assert.equal(normalizeTime('9:30 PM'), '21:30');
  assert.equal(normalizeTime('09:30'), '09:30');
  assert.equal(normalizeTime('27:10'), null);
});

test('parseDaysFromText handles compact and full day patterns', () => {
  assert.deepEqual(parseDaysFromText('Class meets MWF 9:00-9:50'), [1, 3, 5]);
  assert.deepEqual(parseDaysFromText('Lecture Tue/Thu 2pm to 3:15pm'), [2, 4]);
  assert.deepEqual(parseDaysFromText('Schedule: Monday and Wednesday'), [1, 3]);
});

test('parseOutlineHybrid returns v3-hybrid with metrics for clear schedule/events', async () => {
  const rawText = `
Course: Biology 101
Class Schedule: Mon/Wed/Fri 9:00 AM - 9:50 AM
Important Dates
Feb 10 Quiz 1
Mar 14 Midterm Exam
Apr 20 Assignment 2 due
`;

  const parsed = await parseOutlineHybrid({ rawText });

  assert.equal(parsed.meta.parserVersion, 'v3-hybrid');
  assert.ok(parsed.events.length >= 3);
  assert.notEqual(parsed.schedule.days, 'NEEDS_INPUT');
  assert.notEqual(parsed.schedule.startTime, 'NEEDS_INPUT');
  assert.notEqual(parsed.schedule.endTime, 'NEEDS_INPUT');
  assert.ok(parsed.meta.parseMetrics);
});

test('parseOutlineHybrid flags missing schedule for review', async () => {
  const rawText = `
Course: History 220
Important Dates
Jan 15 Assignment 1 due
Feb 20 Midterm Exam
Mar 30 Final paper due
`;

  const parsed = await parseOutlineHybrid({ rawText });
  assert.equal(parsed.schedule.needsReview, true);
  assert.equal(parsed.schedule.days, 'NEEDS_INPUT');
  assert.ok(parsed.events.length >= 2);
});

test('parseOutlineHybrid runs rule-only mode when AI extractor is absent', async () => {
  const rawText = `
MATH 301 SYLLABUS
Meeting Times: Tue/Thu 11:00am - 12:15pm
Weekly Outline
Week 2 - Jan 24 Quiz
Week 5 - Feb 14 Project due
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  assert.equal(parsed.meta.parserVersion, 'v3-hybrid');
  assert.ok(parsed.meta.warnings.some((w) => w.includes('rule-only mode')));
  assert.ok(parsed.meta.parseMetrics);
});

test('parseOutlineHybrid preserves undated extracted events for manual review', async () => {
  const rawText = `
Course: Chemistry 120
Class Schedule: Mon/Wed 10:00 AM - 11:15 AM
Important Dates
Midterm Exam
Final Project due
`;

  const parsed = await parseOutlineHybrid({ rawText });
  const undated = parsed.events.filter((event) => !event.date);

  assert.ok(undated.length >= 2);
  assert.ok(undated.every((event) => event.needsReview));
  assert.ok(parsed.meta.warnings.some((warning) => warning.includes('need dates before import')));
});

test('parseOutlineHybrid extracts multiple events from one-line tentative schedule text', async () => {
  const rawText =
    'Tentative Schedule Jan 10 Lecture: Intro to Course Jan 17 Quiz 1 Jan 24 Assignment 1 Due Feb 7 Midterm Exam';

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const dated = parsed.events.filter((event) => Boolean(event.date));

  assert.ok(dated.length >= 4);
  assert.ok(dated.some((event) => /lecture/i.test(event.description)));
  assert.ok(dated.some((event) => /quiz/i.test(event.description)));
  assert.ok(dated.some((event) => /assignment/i.test(event.description)));
  assert.ok(dated.some((event) => /midterm/i.test(event.description)));
});

test('parseOutlineHybrid extracts lecture events from pipe table rows without explicit keywords', async () => {
  const rawText = `
Course: Calculus I
Date | Topic
01/10 | Limits and continuity
01/17 | Derivatives
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const datedLectures = parsed.events.filter((event) => event.date && event.type === 'lecture');

  assert.ok(datedLectures.some((event) => event.description === 'Limits and continuity'));
  assert.ok(datedLectures.some((event) => event.description === 'Derivatives'));
});

test('parseOutlineHybrid extracts lecture events from date plus topic rows', async () => {
  const rawText = `
Course: Physics 101
Weekly Outline
01/10 Introduction
01/17 Kinematics
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const dated = parsed.events.filter((event) => event.date);

  assert.ok(dated.some((event) => event.type === 'lecture' && /Introduction/i.test(event.description)));
  assert.ok(dated.some((event) => event.type === 'lecture' && /Kinematics/i.test(event.description)));
});

test('parseOutlineHybrid keeps explicit test classification in table rows', async () => {
  const rawText = `
Course: Chemistry
Date | Item
02/14 | Test 1
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const event = parsed.events.find((value) => value.date === '2026-02-14');

  assert.ok(event);
  assert.equal(event?.type, 'test');
});

test('parseOutlineHybrid extracts event times when present', async () => {
  const rawText = `
Course: Chemistry
Important Dates
03/05 Midterm Exam at 2:30 PM
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const event = parsed.events.find((value) => value.date === '2026-03-05');

  assert.ok(event);
  assert.equal(event?.time, '14:30');
});

test('detectSlashDateOrder and normalizeDate support dd/mm inference', () => {
  const rawText = `
Course calendar
15/09 Intro
22/09 Methods
29/09 Review
`;

  const order = detectSlashDateOrder(rawText);
  assert.equal(order, 'dmy');
  assert.equal(normalizeDate('15/09', 2026, order), '2026-09-15');
  assert.equal(normalizeDate('09/10', 2026), '2026-09-10');
});

test('normalizeDate handles compact month-day OCR text', () => {
  assert.equal(normalizeDate('February26th', 2026), '2026-02-26');
  assert.equal(normalizeDate('Jan.20', 2026), '2026-01-20');
});

test('parseOutlineHybrid expands multi-day rows in table date cells', async () => {
  const rawText = `
Date | Topic
Jan. 20 & 22 | Introduction
May 12 & 14 | TEST 3
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const dated = parsed.events.filter((event) => Boolean(event.date));

  assert.ok(dated.some((event) => event.date === '2026-01-20' && event.type === 'lecture'));
  assert.ok(dated.some((event) => event.date === '2026-01-22' && event.type === 'lecture'));
  assert.ok(dated.some((event) => event.date === '2026-05-12' && event.type === 'test'));
  assert.ok(dated.some((event) => event.date === '2026-05-14' && event.type === 'test'));
});

test('parseOutlineHybrid removes leading date text from inferred descriptions', async () => {
  const rawText = `
Date | Topic | Content
Jan.20&22 | Introduction & Course Outline Review Exercise | Excel, Word & PowerPoint
`;

  const parsed = await parseOutlineHybrid({ rawText, aiExtractor: undefined });
  const event = parsed.events.find((value) => value.date === '2026-01-20');

  assert.ok(event);
  assert.equal(event?.description, 'Introduction & Course Outline Review Exercise - Excel, Word & PowerPoint');
});

test('parseOutlineHybrid ignores placeholder AI courseName and uses detected course title', async () => {
  const rawText = `
Course Name: Business Applications 11
Date | Topic
Feb 26 | Test 1
`;

  const parsed = await parseOutlineHybrid({
    rawText,
    aiExtractor: async () => ({
      courseName: 'optional',
      events: [{ date: 'Feb 26', description: 'Test 1', type: 'test' }],
    }),
  });

  assert.equal(parsed.courseName, 'Business Applications 11');
});
