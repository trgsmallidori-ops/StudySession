import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/isAdmin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';

type PdfParseFn = (
  dataBuffer: Buffer,
  options?: { pagerender?: (pageData: unknown) => Promise<string> }
) => Promise<{ text: string }>;

const DAY_TO_NUM: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const EXTRACT_PROMPT = `You are parsing a course syllabus with EXTREME ACCURACY. Your goal is to populate a student's calendar with every important dated event. Extract the following and return ONLY valid JSON with no markdown or extra text.

Return this exact structure:
{
  "courseName": "string - full course name",
  "courseCode": "string or null - e.g. CS 101",
  "assignmentWeights": { "Assignment type": number (percent), ... },
  "tentativeSchedule": [
    { "date": "YYYY-MM-DD", "title": "string", "type": "assignment|test|exam|other" }
  ],
  "classSchedule": [ { "days": ["Mon","Tue",...], "start": "HH:MM", "end": "HH:MM" }, ... ],
  "termStartDate": "YYYY-MM-DD or null",
  "termEndDate": "YYYY-MM-DD or null"
}

CRITICAL RULES:

0) termStartDate and termEndDate - TRY HARD to find the first and last day of the term/course:
   - Look for: "first day of class", "classes begin", "semester begins", "start date", "course runs", "Jan 15 - May 10", "through May 10", "last day of class", "last day of classes", "final exam period", "exam week", academic calendar section, semester dates.
   - If the syllabus gives a date range (e.g. "Spring 2025: Jan 15 to May 10"), use those as termStartDate and termEndDate.
   - If you only find one end (e.g. "Final exam May 15"), set termEndDate to that date and termStartDate to null (or infer from context).
   - Use the SAME year as the tentative schedule dates. If no year is given anywhere, use the current academic year (e.g. 2025 for spring).
   - Return null only when you truly cannot find any indication of term start or end in the document.

1) tentativeSchedule - BE EXTREMELY THOROUGH. Extract EVERYTHING that has a date or can be assigned a date. Include:

   ASSESSMENTS (use type "test" or "exam" or "assignment" as below):
   - Quizzes, pop quizzes, surprise quizzes → type "test". Title e.g. "Quiz on Ch. 2", "Pop quiz", "Week 4 Quiz".
   - Practice tests, mock exams, review tests → type "test". Title e.g. "Practice midterm", "Mock exam".
   - Tests, in-class tests, unit tests → type "test".
   - Midterms, mid-term exams, half-term exam → type "exam".
   - Final exam, final, comprehensive exam → type "exam".
   - Any "assessment", "evaluation" with a date → choose test or exam by scope.

   ASSIGNMENTS (type "assignment"):
   - Assignment due dates, homework due, problem set due, essay due, paper due.
   - Project due date, group project deadline, presentation due, lab report due.
   - Any "due", "deadline", "submit by" with a date → type "assignment".

   IN-CLASS CONTENT / LECTURE TOPICS (type "other"):
   - Week-by-week or day-by-day schedule: "Week 3: Introduction to X", "Demand Forecasting", "Product & Service Design". Use type "other" with a descriptive title (e.g. "Ch. 3: Introduction to Loops", "Process Design and Facility Layout"). These are for calendar visibility only.
   - "Guest speaker", "Field trip", "Review session", "Workshop", "Discussion of Ch. 5" → type "other".
   - NEVER add an event titled "Class" or with type "class". If a day already has an important event (test, quiz, assignment, review, feedback), do NOT add a separate "Class" or generic lecture event for that same date. Only add the important event(s). You may add the lecture topic as type "other" with a descriptive title on the same or adjacent date, but the primary entry for that day must be the test/quiz/assignment/review/feedback—never "Class".
   - Important events (tests, quizzes, assignments, review, feedback, study break) always take priority: use type "test", "exam", or "assignment". Regular lecture topics (e.g. "Demand Forecasting", "Strategic Capacity Planning") are type "other" only.

   CLASS DAYS CONSTRAINT (CRITICAL):
   - If the syllabus states that class meets only on specific days (e.g. "Tuesday and Thursday", "T/Th", "Tues/Thurs", "MWF", "Mon Wed Fri"), you MUST assign in-class topics (type "other") ONLY to those weekdays. Never assign a lecture topic to a day that is not a class day. Example: if the syllabus says "Class meets Tuesday and Thursday only", then every topic from the schedule table goes on a Tuesday or Thursday—never on Monday, Wednesday, or Friday.
   - Use the classSchedule you extract (or explicit text like "T/Th", "Tuesday and Thursday") to determine allowed weekdays. When distributing multiple topic lines across dates, only use dates that fall on those allowed weekdays. If a date range spans a non-class day, skip that day when assigning topics.

   TABLE PARSING (Week / Date / Topic / Readings):
   - When the syllabus has a table with dates (e.g. "Jan 22-Jan 24" or "Jan 20 - 22") and a Topic column:
     - DATE NOTATION: "Jan 22-Jan 24" (two dates with a hyphen) usually means ONLY those two days—Jan 22 AND Jan 24—NOT "Jan 22 through Jan 24" including the day in between. So do NOT assign any topic to Jan 23 unless Jan 23 is explicitly listed elsewhere. Same for "Jan 20 - 22": often it means just Jan 20 and Jan 22 (the class days in that week), not Jan 21. Prefer interpreting hyphenated date pairs as "on these dates" (list of class days) rather than "every day from first to last". When in doubt and the course meets only on specific days (e.g. T/Th), use only the dates that fall on those weekdays.
     - Distribute topic lines to the dates that are actually class days for that row. E.g. "Jan 22-Jan 24" with two topic lines → first topic → Jan 22, second topic → Jan 24 (not Jan 23). If there are three lines and only two dates listed, put two topics on the two dates and the third on the next class day (e.g. next Tuesday or Thursday).
     - Exception: if the lines are clearly one sentence split across two lines (e.g. "Course Introduction" and "Introduction to Operations Management" as one intro), treat as ONE topic and use the first listed date.
   - Items in blue, bold, or with keywords "Test", "Review", "Feedback", "Study Break", "Quiz", "Due" are important events → use type "test", "exam", or "assignment". Do not duplicate that day with a "Class" event.
   - Blank "Readings" for a row often means the Topic is an event (test, review) rather than a reading-based lecture—use that as a hint.

   DATE HANDLING (CRITICAL - ACCURACY IS ESSENTIAL):
   - YEAR: Use the year provided in the "Today's date" line below for ALL dates. If the syllabus says "Jan 22" or "January 22nd", convert to that exact calendar date in that year (e.g. 2026-01-22). Jan 22, 2026 is a Thursday—verify your dates against the real calendar.
   - SPECIFIC DATE PRIORITY: When the syllabus gives an EXPLICIT calendar date (e.g. "Jan 22", "Jan 22nd", "January 22", "1/22", "Jan 22 2026", "Jan 22-Jan 24"), use that EXACT date. Do NOT substitute a different date based on day-of-week. "Jan 22" means 2026-01-22—put the event on that date, not on "the next Tuesday" or any other day. The syllabus author chose that date; honor it.
   - CLASS DAYS: When distributing topics across weeks without specific dates, use ONLY the course's class days (e.g. T/Th). But when the syllabus explicitly lists "Jan 22" or "Jan 22-Jan 24", those ARE the specific dates—use them as-is, even if that date falls on a class day (it should, since the professor scheduled it).
   - Search the ENTIRE document: "Tentative Schedule", "Course Calendar", "Important Dates", "Weekly Schedule", tables, bullet lists, paragraphs, and any phrase like "class meets", "T/Th", "Tuesday and Thursday".
   - Convert "Oct 15", "10/15", "October 15", "March 10th", "Week 7" to YYYY-MM-DD. For hyphenated pairs like "Jan 22-Jan 24", use only the listed dates (Jan 22 and Jan 24), not the days in between. For "Week N", use termStartDate: first day of that week (e.g. Week 1 = termStartDate, Week 2 = termStartDate + 7 days).
   - When the syllabus uses vague durations like "roughly 4 weeks" or "Weeks 4–7: work on Assignment 1" without exact day-by-day dates, anchor that span to calendar weeks using termStartDate AND place the related topics/assignment ONLY on the actual class meeting days from the lecture schedule (e.g. the Tue/Thu or MWF pattern in classSchedule). Do NOT invent extra non-class days; repeat the item on each class day across that span instead of sprinkling it on random weekdays.
   - When one row has both an important event and a lecture topic (e.g. "Review & Test #1" and "Test #1", or "Feedback on Test #1" and "Process Design and Facility Layout"), create separate entries with the correct dates; do not add "Class" for that day.
   - Do NOT include recurring weekly "class" or "lecture" meetings in tentativeSchedule. Do NOT add any event titled "Class". Reminders are only sent for assignment, test, and exam—never for type "other".

2) classSchedule - different times on different days:
   - If the syllabus says e.g. "Lecture MWF 9:00-9:50" and "Lab Tue 14:00-15:30", return TWO blocks: [ { "days": ["Mon","Wed","Fri"], "start": "09:00", "end": "09:50" }, { "days": ["Tue"], "start": "14:00", "end": "15:30" } ].
   - Use exactly: "Mon","Tue","Wed","Thu","Fri","Sat","Sun". Map T/Th, MWF, etc. to these.
   - If there is only one meeting pattern, return one block. If no schedule found, return [].

3) assignmentWeights: keys like "Assignments", "Midterm", "Final", "Participation", "Quizzes". Values 0-100.`;

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
  const pdfParse = (pdfParseModule.default ?? pdfParseModule) as PdfParseFn;

  const parsed = await pdfParse(buffer, {
    pagerender: async (pageData: unknown) => {
      const pd = pageData as { getTextContent: () => Promise<{ items: Array<{ str: string; transform?: number[] }> }> };
      const textContent = await pd.getTextContent();
      let lastY: number | null = null;
      let text = '';

      for (const item of textContent.items) {
        const y = item.transform?.[5] ?? null;
        if (lastY !== null && y !== null && Math.abs(lastY - y) > 1.5) {
          text += '\n';
        }
        text += `${item.str} `;
        lastY = y;
      }

      return text;
    },
  });

  return parsed.text;
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const isDocx = file.type === DOCX_MIME || ext === '.docx';
  const isPdf = file.type === PDF_MIME || ext === '.pdf';

  if (isDocx) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (isPdf) {
    return extractTextFromPdf(file);
  }

  return file.text();
}

function mapClassScheduleToSlots(
  classSchedule: Array<{ days?: string[]; start?: string; end?: string }> | null
): { days: number[]; startTime: string; endTime: string }[] {
  if (!Array.isArray(classSchedule) || classSchedule.length === 0) {
    return [{ days: [], startTime: '09:00', endTime: '10:00' }];
  }

  return classSchedule
    .filter((b) => Array.isArray(b?.days) && b.days.length > 0 && b?.start && b?.end)
    .map((b) => {
      const days = (b.days as string[])
        .map((d) => DAY_TO_NUM[d] ?? DAY_TO_NUM[d as keyof typeof DAY_TO_NUM])
        .filter((n) => n !== undefined);
      const start = String(b.start).trim().slice(0, 5);
      const end = String(b.end).trim().slice(0, 5);
      return {
        days,
        startTime: /^\d{2}:\d{2}$/.test(start) ? start : '09:00',
        endTime: /^\d{2}:\d{2}$/.test(end) ? end : '10:00',
      };
    });
}

type SpaxioParsed = {
  courseName?: string | null;
  courseCode?: string | null;
  assignmentWeights?: Record<string, number> | null;
  tentativeSchedule?: Array<{ date?: string; title?: string; type?: string }> | null;
  classSchedule?: Array<{ days?: string[]; start?: string; end?: string }> | null;
  termStartDate?: string | null;
  termEndDate?: string | null;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SCHOLAR_UPLOAD_LIMIT = 30;
    const currentYear = new Date().getFullYear();

    const { data: profile } = await supabase
      .from('users')
      .select('subscription_tier, calendar_uploads_used, calendar_uploads_year')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier ?? 'free';
    const admin = isAdmin(user);
    let uploadsUsed = profile?.calendar_uploads_used ?? 0;
    let calendarUploadsYear = profile?.calendar_uploads_year ?? null;

    if (!admin && tier === 'scholar' && (calendarUploadsYear === null || calendarUploadsYear !== currentYear)) {
      await supabase
        .from('users')
        .update({ calendar_uploads_used: 0, calendar_uploads_year: currentYear })
        .eq('id', user.id);
      uploadsUsed = 0;
      calendarUploadsYear = currentYear;
    }

    // Free: 2 uploads; Scholar: 30/year. Both can use AI parsing.
    if (!admin && tier === 'free' && uploadsUsed >= 2) {
      return NextResponse.json({ error: 'Upload limit reached', limitReached: true }, { status: 403 });
    }
    if (!admin && tier === 'scholar' && uploadsUsed >= SCHOLAR_UPLOAD_LIMIT) {
      return NextResponse.json(
        { error: 'Annual upload limit reached (30 per year). Resets each year.', limitReached: true },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const validExt = ['.pdf', '.txt', '.md', '.docx'];
    const validMimes = [PDF_MIME, 'text/plain', 'text/markdown', DOCX_MIME];

    if (!validExt.includes(ext) && !validMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, TXT, MD, or DOCX.' }, { status: 400 });
    }

    const rawText = await extractTextFromFile(file);
    const text = (rawText || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!text) {
      return NextResponse.json({ error: 'File is empty or could not be read' }, { status: 400 });
    }

    const openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    if (!openai) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACT_PROMPT },
        {
          role: 'user',
          content: `Today's date: ${todayStr} (use this year for all dates unless the syllabus explicitly states a different year).

Syllabus text:

${text.slice(0, 12000)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: 'AI could not parse syllabus' }, { status: 500 });
    }

    let parsed: SpaxioParsed;
    try {
      parsed = JSON.parse(raw) as SpaxioParsed;
    } catch {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }

    const scheduleSlots = mapClassScheduleToSlots(parsed.classSchedule ?? null);
    const firstSlot = scheduleSlots[0] ?? { days: [], startTime: '09:00', endTime: '10:00' };

    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const events = (parsed.tentativeSchedule ?? [])
      .filter((item) => item?.date && dateOnly.test(String(item.date).trim()))
      .map((item) => ({
        date: String(item!.date).trim(),
        description: (item!.title && String(item.title).trim()) || 'Event',
        type: (['assignment', 'test', 'exam', 'other'].includes(String(item!.type || '').toLowerCase())
          ? String(item!.type).toLowerCase()
          : 'other') as 'assignment' | 'test' | 'exam' | 'other',
        confidence: 0.9,
        needsReview: false,
        sourceSnippet: '',
      }));

    const result = {
      courseName: (parsed.courseName && String(parsed.courseName).trim()) || 'Imported Course',
      courseCode: parsed.courseCode != null && String(parsed.courseCode).trim() ? String(parsed.courseCode).trim() : null,
      assignmentWeights: parsed.assignmentWeights && typeof parsed.assignmentWeights === 'object' ? parsed.assignmentWeights : {},
      termStartDate: parsed.termStartDate && dateOnly.test(String(parsed.termStartDate).trim()) ? String(parsed.termStartDate).trim() : null,
      termEndDate: parsed.termEndDate && dateOnly.test(String(parsed.termEndDate).trim()) ? String(parsed.termEndDate).trim() : null,
      events,
      scheduleSlots: scheduleSlots.length > 0 ? scheduleSlots : [{ days: [], startTime: '09:00', endTime: '10:00' }],
      schedule: {
        days: firstSlot.days.length > 0 ? firstSlot.days : 'NEEDS_INPUT',
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
        needsReview: firstSlot.days.length === 0,
      },
    };

    if (!admin && (tier === 'free' || tier === 'scholar')) {
      await supabase
        .from('users')
        .update({
          calendar_uploads_used: uploadsUsed + 1,
          ...(tier === 'scholar' ? { calendar_uploads_year: currentYear } : {}),
        })
        .eq('id', user.id);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Parse outline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse outline' },
      { status: 500 }
    );
  }
}
