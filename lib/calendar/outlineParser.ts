type ParsedEventType = 'test' | 'assignment' | 'lecture' | 'other';
export type ParsedEventCategory =
  | 'quiz'
  | 'exam'
  | 'final'
  | 'midterm'
  | 'reading'
  | 'assignment'
  | 'lecture'
  | 'lab'
  | 'other';
type NeedsInput = 'NEEDS_INPUT';

export type ParsedSchedule = {
  days: number[] | NeedsInput;
  startTime: string | NeedsInput;
  endTime: string | NeedsInput;
  confidence: number;
  needsReview: boolean;
};

export interface ParsedEvent {
  date: string;
  time?: string;
  description: string;
  type: ParsedEventType;
  category?: ParsedEventCategory;
  confidence: number;
  needsReview: boolean;
  sourceSnippet: string;
  chunkId?: string;
  /** Grade weight as percentage (e.g. 30 for 30%) */
  weight?: number;
}

export interface ParsedOutlineResponse {
  courseName: string;
  events: ParsedEvent[];
  tests: { date: string; description: string }[];
  assignments: { date: string; description: string }[];
  schedule: ParsedSchedule;
  meta: {
    parserVersion: string;
    warnings: string[];
    extractedSections: string[];
    parseMetrics?: {
      durationMs: number;
      aiChunksUsed: number;
      totalChunks: number;
      ruleCandidates: number;
      aiTimeouts: number;
      warnings: string[];
    };
  };
}

export interface OutlineSection {
  id: string;
  name: string;
  startLine: number;
  endLine: number;
  text: string;
}

export interface OutlineChunk {
  chunkId: string;
  sectionId: string;
  sectionName: string;
  startLine: number;
  endLine: number;
  text: string;
}

export interface ChunkExtractionResult {
  courseName?: string;
  schedule?: {
    days?: Array<number | string>;
    startTime?: string;
    endTime?: string;
    sourceSnippet?: string;
  };
  events?: Array<{
    date?: string;
    time?: string;
    description?: string;
    type?: string;
    category?: string;
    sourceSnippet?: string;
    weight?: number;
  }>;
}

interface ScheduleCandidate {
  days: number[];
  startTime: string | null;
  endTime: string | null;
  confidence: number;
  sourceSnippet: string;
  sectionName: string;
}

interface RuleExtractionResult {
  courseName: string | null;
  events: ParsedEvent[];
  schedules: ScheduleCandidate[];
  diagnostics: {
    slashDateOrder: SlashDateOrder;
    dateLikeRows: number;
    normalizedDateRows: number;
    droppedDateRowsNoDescription: number;
  };
}

type SlashDateOrder = 'mdy' | 'dmy';

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const SECTION_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'schedule', pattern: /(class\s+schedule|meeting\s+times?|when\s+we\s+meet|lecture\s+schedule)/i },
  { name: 'assessments', pattern: /(assessment|grading|evaluation|tests?|quizzes?|exams?|assignments?)/i },
  { name: 'weekly outline', pattern: /(weekly\s+outline|course\s+outline|week\s*\d+|calendar|timeline|tentative\s+schedule|course\s+schedule)/i },
  { name: 'labs', pattern: /(lab\s+schedule|laboratory|practicum)/i },
  { name: 'important dates', pattern: /(important\s+dates|key\s+dates|deadlines?)/i },
];

const EVENT_KEYWORDS = /(test|quiz|midterm|final|exam|assignment|homework|project|paper|essay|lecture|class|deadline|due|lab)/i;
const SCHEDULE_KEYWORDS = /(class|lecture|meeting|meets|schedule|time|times|room|lab|seminar)/i;
const DATE_TOKEN_PATTERN =
  '\\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.]?\\s*\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s*\\d{4})?\\b|\\b\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?\\b';
const DATE_TOKEN_REGEX = new RegExp(DATE_TOKEN_PATTERN, 'i');
const DATE_TOKEN_GLOBAL = new RegExp(DATE_TOKEN_PATTERN, 'gi');

function clampConfidence(n: number): number {
  return Math.max(0, Math.min(1, Number(n.toFixed(2))));
}

export function normalizeEventType(type: unknown, description = ''): ParsedEventType {
  const raw = String(type ?? '').toLowerCase();
  const text = `${raw} ${description}`.toLowerCase();
  if (/(quiz|midterm|final|exam|test)/.test(text)) return 'test';
  if (/(assignment|homework|project|paper|essay|submission|deliverable|report)/.test(text)) return 'assignment';
  if (/(lecture|class|seminar|discussion|lab|workshop|theory)/.test(text)) return 'lecture';
  if (raw === 'test' || raw === 'assignment' || raw === 'lecture' || raw === 'other') return raw;
  return 'other';
}

export function normalizeEventCategory(type: unknown, description = ''): ParsedEventCategory {
  const raw = String(type ?? '').toLowerCase();
  const text = `${raw} ${description}`.toLowerCase();
  if (/\bfinal\b/.test(text)) return 'final';
  if (/\bmidterm\b/.test(text)) return 'midterm';
  if (/\bexam\b/.test(text)) return 'exam';
  if (/\bquiz\b/.test(text)) return 'quiz';
  if (/\btest\b/.test(text)) return 'exam';
  if (/\breading\b/.test(text)) return 'reading';
  if (/\bassignment|homework|project|paper|essay|submission|deliverable|report\b/.test(text)) return 'assignment';
  if (/\blab|laboratory\b/.test(text)) return 'lab';
  if (/\blecture|class|seminar|discussion|workshop|theory\b/.test(text)) return 'lecture';
  const baseType = normalizeEventType(type, description);
  if (baseType === 'lecture') return 'lecture';
  if (baseType === 'assignment') return 'assignment';
  return 'other';
}

export function normalizeTime(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s || /^needs_input$/i.test(s)) return null;

  const hhmm = s.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (hhmm) {
    const h = Number(hhmm[1]);
    const m = Number(hhmm[2]);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const meridiem = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!meridiem) return null;

  let h = Number(meridiem[1]);
  const m = Number(meridiem[2] ?? '0');
  const ap = meridiem[3].toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function sanitizeText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function inferLikelyYear(text: string): number {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  if (!years.length) return new Date().getFullYear();
  const freq = new Map<number, number>();
  for (const y of years) freq.set(y, (freq.get(y) ?? 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function normalizeSlashDate(
  a: number,
  b: number,
  c: number | null,
  fallbackYear: number,
  order: SlashDateOrder
): string | null {
  const first = order === 'dmy' ? b - 1 : a - 1;
  const second = order === 'dmy' ? a : b;
  let year = Number(c ?? fallbackYear);
  if (year < 100) year += 2000;
  const d = new Date(Date.UTC(year, first, second));
  if (!Number.isNaN(d.getTime()) && d.getUTCMonth() === first && d.getUTCDate() === second) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

export function detectSlashDateOrder(text: string): SlashDateOrder {
  const matches = [...text.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)];
  if (!matches.length) return 'mdy';

  for (const match of matches) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    if (first > 12 && second <= 12) return 'dmy';
    if (second > 12 && first <= 12) return 'mdy';
  }

  return 'mdy';
}

export function normalizeDate(raw: unknown, fallbackYear: number, slashDateOrder: SlashDateOrder = 'mdy'): string | null {
  const value = String(raw ?? '').trim();
  if (!value || /^needs_input$/i.test(value)) return null;
  const normalizedValue = value
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    const d = new Date(`${normalizedValue}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) return normalizedValue;
  }

  const monthNamed = normalizedValue.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i
  );
  if (monthNamed) {
    const month = MONTH_INDEX[monthNamed[1].toLowerCase().replace('.', '')];
    const day = Number(monthNamed[2]);
    const year = Number(monthNamed[3] ?? fallbackYear);
    const d = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(d.getTime()) && d.getUTCMonth() === month && d.getUTCDate() === day) {
      return d.toISOString().slice(0, 10);
    }
  }

  const slashDate = normalizedValue.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slashDate) {
    const first = Number(slashDate[1]);
    const second = Number(slashDate[2]);
    const year = slashDate[3] ? Number(slashDate[3]) : null;
    const normalized = normalizeSlashDate(first, second, year, fallbackYear, slashDateOrder);
    if (normalized) return normalized;

    // Fall back to the opposite order as a recovery for malformed mixed-format outlines.
    const alternate = slashDateOrder === 'mdy' ? 'dmy' : 'mdy';
    return normalizeSlashDate(first, second, year, fallbackYear, alternate);
  }

  return null;
}

export function normalizeDays(days: unknown): number[] {
  if (!Array.isArray(days)) return [];
  const map: Record<string, number> = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tues: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thurs: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };

  const values = days
    .map((d) => {
      if (typeof d === 'number') return d;
      const maybeNumber = Number(d);
      if (Number.isInteger(maybeNumber)) return maybeNumber;
      return map[String(d).trim().toLowerCase()] ?? -1;
    })
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);

  return [...new Set(values)].sort((a, b) => a - b);
}

function normalizeDescription(input: unknown): string {
  return String(input ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifySection(line: string): string | null {
  for (const pattern of SECTION_PATTERNS) {
    if (pattern.pattern.test(line)) return pattern.name;
  }
  return null;
}

export function detectSections(normalizedText: string): OutlineSection[] {
  const lines = normalizedText.split('\n');
  const sections: OutlineSection[] = [];

  let currentName = 'general';
  let currentStart = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isHeader =
      /^[A-Z][A-Z\s:&-]{3,}$/.test(line) ||
      /^#{1,4}\s+/.test(line) ||
      /^\d+(?:\.\d+)?[.)]\s+[A-Za-z]/.test(line) ||
      /^[A-Za-z][A-Za-z\s]{2,40}:$/.test(line);

    if (!isHeader) continue;

    const maybeName = classifySection(line);
    if (!maybeName) continue;

    if (i + 1 > currentStart) {
      sections.push({
        id: `sec-${sections.length + 1}`,
        name: currentName,
        startLine: currentStart,
        endLine: i,
        text: lines.slice(currentStart - 1, i).join('\n').trim(),
      });
    }

    currentName = maybeName;
    currentStart = i + 1;
  }

  if (lines.length >= currentStart) {
    sections.push({
      id: `sec-${sections.length + 1}`,
      name: currentName,
      startLine: currentStart,
      endLine: lines.length,
      text: lines.slice(currentStart - 1).join('\n').trim(),
    });
  }

  const nonEmpty = sections.filter((s) => s.text);
  if (!nonEmpty.length) {
    return [
      {
        id: 'sec-1',
        name: 'general',
        startLine: 1,
        endLine: lines.length,
        text: normalizedText,
      },
    ];
  }

  return nonEmpty;
}

export function chunkSections(sections: OutlineSection[], maxChars = 1800): OutlineChunk[] {
  const chunks: OutlineChunk[] = [];

  for (const section of sections) {
    const lines = section.text.split('\n');
    let acc: string[] = [];
    let startOffset = 0;
    let currentLen = 0;

    const flush = (endOffset: number) => {
      const text = acc.join('\n').trim();
      if (!text) return;
      chunks.push({
        chunkId: `${section.id}-chunk-${chunks.length + 1}`,
        sectionId: section.id,
        sectionName: section.name,
        startLine: section.startLine + startOffset,
        endLine: section.startLine + endOffset,
        text,
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const addition = line.length + 1;

      if (currentLen + addition > maxChars && acc.length > 0) {
        flush(i - 1);
        acc = [line];
        startOffset = i;
        currentLen = addition;
      } else {
        acc.push(line);
        currentLen += addition;
      }
    }

    if (acc.length > 0) {
      flush(lines.length - 1);
    }
  }

  return chunks;
}

function normalizeDedupKey(date: string, time: string | undefined, description: string, type: ParsedEventType): string {
  const normalizedDesc = description.toLowerCase().replace(/\s+/g, ' ').trim();
  return `${date}|${time ?? ''}|${type}|${normalizedDesc}`;
}

function scoreEvent(params: {
  date: string | null;
  description: string;
  type: ParsedEventType;
  category?: ParsedEventCategory;
  sourceSnippet: string;
  sectionName: string;
  source: 'rule' | 'ai';
}): number {
  let score = params.source === 'rule' ? 0.62 : 0.5;
  if (params.date) score += 0.16;
  if (params.sourceSnippet.length >= 10) score += 0.05;
  if (params.type === normalizeEventType(params.type, params.description)) score += 0.07;

  if (params.sectionName === 'assessments' && (params.type === 'test' || params.type === 'assignment')) score += 0.12;
  if (params.sectionName === 'important dates' && params.type !== 'lecture') score += 0.08;
  if (params.sectionName === 'schedule' && params.type === 'lecture') score += 0.06;

  return clampConfidence(score);
}

function scoreSchedule(candidate: ScheduleCandidate, source: 'rule' | 'ai'): number {
  let score = source === 'rule' ? 0.58 : 0.42;
  if (candidate.days.length > 0) score += 0.2;
  if (candidate.startTime) score += 0.1;
  if (candidate.endTime) score += 0.1;
  if (candidate.sectionName === 'schedule') score += 0.1;
  if (candidate.sourceSnippet.length >= 10) score += 0.05;
  return clampConfidence(score);
}

export function parseDaysFromText(text: string): number[] {
  const lower = text.toLowerCase();
  const map: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    thurs: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  const out = new Set<number>();
  for (const [token, value] of Object.entries(map)) {
    if (new RegExp(`\\b${token}\\b`, 'i').test(lower)) out.add(value);
  }

  // Compact patterns like MWF, TTH, TuTh.
  const compact = lower.replace(/[^a-z]/g, '');
  if (/mwf/.test(compact)) {
    out.add(1);
    out.add(3);
    out.add(5);
  }
  if (/tth|tuth|tu\/th|tuth/.test(compact) || /\bt(?:ue|ues)?\s*(?:\/|&|and)\s*th/.test(lower)) {
    out.add(2);
    out.add(4);
  }
  if (/\bmon\s*(?:\/|&|and)\s*wed\b/.test(lower)) {
    out.add(1);
    out.add(3);
  }

  return [...out].sort((a, b) => a - b);
}

function parseTimeRange(text: string): { startTime: string | null; endTime: string | null } {
  const range = text.match(
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|â€“|â€”|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i
  );
  if (!range) return { startTime: null, endTime: null };
  return {
    startTime: normalizeTime(range[1]),
    endTime: normalizeTime(range[2]),
  };
}

export function parseTimeFromText(text: string): string | null {
  const match = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|(?:[01]?\d|2[0-3]):[0-5]\d)\b/i);
  if (!match) return null;
  return normalizeTime(match[1]);
}

/** Extract grade weight as percentage from text (e.g. "30%", "(30%)", "worth 30%") */
export function parseWeightFromText(text: string): number | null {
  const match = text.match(/(\d{1,3})\s*%/);
  const pct = match ? Number(match[1]) : null;
  if (pct != null && pct >= 0 && pct <= 100) return pct;
  return null;
}

function splitLineByDateAnchors(line: string): string[] {
  const matches = [...line.matchAll(new RegExp(DATE_TOKEN_PATTERN, 'gi'))];
  if (matches.length <= 1) return [line];

  const parts: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? line.length : line.length;
    const piece = line.slice(start, end).trim();
    if (piece) parts.push(piece);
  }

  return parts.length ? parts : [line];
}

function expandDateCandidates(text: string): string[] {
  const normalized = normalizeDescription(text)
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2');
  const out = new Set<string>();
  out.add(normalized);

  const monthList = normalized.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*\d{1,2}(?:st|nd|rd|th)?(?:\s*[,&/]\s*\d{1,2}(?:st|nd|rd|th)?)+/i
  );
  if (monthList) {
    const monthMatch = monthList[0].match(
      /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?/i
    );
    if (monthMatch?.[1]) {
      const month = monthMatch[1];
      const days = [...monthList[0].matchAll(/(\d{1,2})(?:st|nd|rd|th)?/gi)].map((m) => m[1]);
      for (const day of days) out.add(`${month} ${day}`);
    }
  }

  const slashList = normalized.match(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?:\s*[,&]\s*\d{1,2})+/);
  if (slashList) {
    const lead = slashList[0].match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (lead) {
      const first = lead[1];
      const year = lead[3];
      const trailing = [...slashList[0].matchAll(/[,&]\s*(\d{1,2})/g)].map((m) => m[1]);
      out.add(`${first}/${lead[2]}${year ? `/${year}` : ''}`);
      for (const second of trailing) {
        out.add(`${first}/${second}${year ? `/${year}` : ''}`);
      }
    }
  }

  return [...out];
}

function stripDateTokens(text: string): string {
  return text.replace(DATE_TOKEN_GLOBAL, ' ').replace(/\s+/g, ' ').trim();
}

function splitTableCells(line: string): string[] {
  if (line.includes('|') || line.includes('\t')) {
    return line
      .split(/\||\t/g)
      .map((cell) => cell.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  return line
    .split(/\s{3,}/g)
    .map((cell) => cell.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function isLikelyColumnHeader(value: string): boolean {
  const token = value.toLowerCase().replace(/[^a-z]/g, '');
  return ['topic', 'topics', 'lecture', 'lectures', 'week', 'weeks', 'module', 'session', 'content'].includes(token);
}

/** Skip policy text (cheating, plagiarism, cell phone rules, conduct) - not calendar events */
function isPolicyText(text: string): boolean {
  const lower = text.toLowerCase();
  if (/\b(cheating|plagiarism|academic\s+integrity|disciplinary)\b/.test(lower)) return true;
  if (/\b(cell\s+phone|no\s+texting|no\s+phone)\b/.test(lower)) return true;
  if (/\b(listen\s+attentively|participate\s+during\s+class)\b/.test(lower)) return true;
  if (/\b(strictly\s+enforce|examination\s+rules|advance\s+warning)\b/.test(lower)) return true;
  if (/\b(zero\s+in\s+the\s+assignment|failure\s+in\s+the\s+course)\b/.test(lower)) return true;
  if (text.length > 120 && !/\b(quiz|exam|midterm|final|assignment|lecture|lab|project)\b/i.test(text)) return true;
  return false;
}

/** Produce a short event name (2-8 words) - what you're doing in class, not policy paragraphs */
function shortenToEventName(
  raw: string,
  type: ParsedEventType,
  category?: ParsedEventCategory
): string {
  const categoryLabels: Record<string, string> = {
    final: 'Final Exam',
    midterm: 'Midterm',
    exam: 'Exam',
    quiz: 'Quiz',
    assignment: 'Assignments',
    reading: 'Reading',
    lab: 'Lab',
    lecture: 'Lecture',
  };
  if (category && categoryLabels[category]) return categoryLabels[category];

  const typeLabels: Record<ParsedEventType, string> = {
    test: 'Test',
    assignment: 'Assignments',
    lecture: 'Lecture',
    other: 'Class',
  };
  if (type !== 'other') return typeLabels[type];

  const short = raw
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
  const firstPhrase = short.split(/[,;:.]/)[0]?.trim();
  if (firstPhrase && firstPhrase.length <= 40) return firstPhrase;
  return short.length <= 40 ? short : short.slice(0, 37) + '...';
}

function cleanDescriptionWithDateContext(raw: string): string {
  const normalized = normalizeDescription(raw);
  if (!normalized) return '';

  const cells = splitTableCells(normalized);
  if (cells.length > 1) {
    const nonDateCells = cells
      .filter((cell) => !DATE_TOKEN_REGEX.test(cell))
      .map((cell) => normalizeDescription(stripDateTokens(cell)))
      .filter((cell) => cell && !isLikelyColumnHeader(cell) && !/^\d+%$/.test(cell));
    if (nonDateCells.length) return normalizeDescription(nonDateCells.join(' - ')).slice(0, 180);
  }

  const withoutDate = normalizeDescription(stripDateTokens(normalized))
    .replace(/^[\s:|,-]+/, '')
    .trim();
  return withoutDate.slice(0, 180);
}

function normalizeCourseNameCandidate(raw: unknown): string | null {
  const candidate = normalizeDescription(String(raw ?? ''))
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!candidate) return null;

  const lowered = candidate.toLowerCase();
  const banned = new Set([
    'optional',
    'unknown',
    'n/a',
    'na',
    'none',
    'null',
    'undefined',
    'course',
    'class',
    'syllabus',
    'outline',
    'course outline',
  ]);
  if (banned.has(lowered)) return null;
  if (candidate.length < 3) return null;
  if (!/[a-z]/i.test(candidate)) return null;
  return candidate.slice(0, 120);
}


function maybeCourseName(text: string): string | null {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 30);
  const topLines = lines.slice(0, 12);

  // Explicit "Course Title:" or "Course Name:" (highest priority)
  for (const line of topLines) {
    const m = line.match(/^(?:course|class)\s*(?:title|name|code)?\s*[:\-]\s*(.+)$/i);
    const named = normalizeCourseNameCandidate(m?.[1]);
    if (named) return named;
  }

  // "Course: CODE - Full Title" or "COURSE CODE: Full Title"
  for (const line of topLines) {
    const m = line.match(/^(?:course|subject)\s*[:\-]?\s*(?:[A-Z]{2,4}\s*\d{3}[A-Z]?\s*[-–—]\s*)?(.+)$/i);
    const named = normalizeCourseNameCandidate(m?.[1]);
    if (named && named.length > 5) return named;
  }

  // Line containing "Syllabus" or "Course Outline" - use the part before it (e.g. "Intro to Apps - Course Outline")
  for (let i = 0; i < topLines.length; i++) {
    const line = topLines[i];
    if (!/\b(syllabus|course\s+outline|outline)\b/i.test(line)) continue;

    const stripped = normalizeCourseNameCandidate(
      line
        .replace(/\b(course\s+)?syllabus\b/gi, '')
        .replace(/\b(course\s+)?outline\b/gi, '')
        .replace(/\s*[-–—:|,]\s*$/g, '')
        .trim()
    );
    if (stripped && stripped.length > 5) return stripped;

    const previous = i > 0 ? normalizeCourseNameCandidate(topLines[i - 1]) : null;
    if (previous && previous.length > 5) return previous;
  }

  const firstReasonable = topLines
    .map((line) => normalizeCourseNameCandidate(line))
    .find((value) => value != null && value.length > 5 && !/\b(week|date|topic|content|component|grade|total|schedule)\b/i.test(String(value)));
  return firstReasonable ?? null;
}

function extractRules(sections: OutlineSection[], rawText: string): RuleExtractionResult {
  const fallbackYear = inferLikelyYear(rawText);
  const slashDateOrder = detectSlashDateOrder(rawText);
  const events: ParsedEvent[] = [];
  const schedules: ScheduleCandidate[] = [];
  const diagnostics = {
    slashDateOrder,
    dateLikeRows: 0,
    normalizedDateRows: 0,
    droppedDateRowsNoDescription: 0,
  };

  for (const section of sections) {
    const lines = section.text.split('\n');
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const hasDateLikeToken = DATE_TOKEN_REGEX.test(trimmed);
      if (hasDateLikeToken) diagnostics.dateLikeRows += 1;

      if (SCHEDULE_KEYWORDS.test(trimmed)) {
        const days = parseDaysFromText(trimmed);
        const { startTime, endTime } = parseTimeRange(trimmed);
        if (days.length || startTime || endTime) {
          const sourceSnippet = normalizeDescription(trimmed).slice(0, 240);
          const candidate: ScheduleCandidate = {
            days,
            startTime,
            endTime,
            confidence: 0,
            sourceSnippet,
            sectionName: section.name,
          };
          candidate.confidence = scoreSchedule(candidate, 'rule');
          schedules.push(candidate);
        }
      }

      let rowHasNormalizedDate = false;
      let rowProducedEvent = false;
      const isTableLike = hasDateLikeToken && (trimmed.includes('|') || /\s{3,}|\t/.test(line));

      if (isTableLike) {
        const cells = splitTableCells(line);
        const dateCells = cells
          .map((cell, idx) => ({ idx, cell }))
          .filter(({ cell }) => DATE_TOKEN_REGEX.test(cell));

        for (const { idx, cell } of dateCells) {
          const dates = expandDateCandidates(cell)
            .map((candidate) => normalizeDate(candidate, fallbackYear, slashDateOrder))
            .filter((value): value is string => Boolean(value));
          if (!dates.length) continue;
          rowHasNormalizedDate = true;

          const descriptionCells = cells
            .filter((_, cellIdx) => cellIdx !== idx)
            .filter((value) => !DATE_TOKEN_REGEX.test(value))
            .map((value) => normalizeDescription(value))
            .filter(Boolean);

          const fallbackDescription = cleanDescriptionWithDateContext(cell);
          let description = cleanDescriptionWithDateContext(descriptionCells.join(' - ') || fallbackDescription);

          if (!description || isLikelyColumnHeader(description)) {
            diagnostics.droppedDateRowsNoDescription += 1;
            continue;
          }
          if (isPolicyText(description)) {
            diagnostics.droppedDateRowsNoDescription += 1;
            continue;
          }

          const hasExplicitKeyword = EVENT_KEYWORDS.test(trimmed) || EVENT_KEYWORDS.test(description);
          let type = normalizeEventType('', description);
          if (!hasExplicitKeyword && type === 'other') type = 'lecture';
          const category = normalizeEventCategory('', description);
          if (description.length > 50) description = shortenToEventName(description, type, category);
          const inferredTime = parseTimeFromText(descriptionCells.join(' ') || trimmed);
          const weight = parseWeightFromText(descriptionCells.join(' ') || trimmed) ?? parseWeightFromText(cell);

          let confidence = scoreEvent({
            date: dates[0],
            description,
            type,
            sourceSnippet: normalizeDescription(trimmed).slice(0, 120),
            sectionName: section.name,
            source: 'rule',
          });
          if (!hasExplicitKeyword) confidence = clampConfidence(confidence - 0.08);

          for (const date of dates) {
            events.push({
              date,
              time: inferredTime ?? undefined,
              description,
              type,
              category,
              confidence,
              needsReview: confidence < 0.75,
              sourceSnippet: normalizeDescription(trimmed).slice(0, 240),
              chunkId: `${section.id}-line-${section.startLine + lineIndex}`,
              ...(weight != null && { weight }),
            });
          }
          rowProducedEvent = true;
        }

        if (rowHasNormalizedDate) diagnostics.normalizedDateRows += 1;
        if (rowProducedEvent) return;
      }

      const entryParts = splitLineByDateAnchors(trimmed).flatMap((piece) =>
        piece
          .split(/[•·]/g)
          .map((value) => value.trim())
          .filter(Boolean)
      );

      for (const entry of entryParts) {
        const dates = expandDateCandidates(entry)
          .map((candidate) => normalizeDate(candidate, fallbackYear, slashDateOrder))
          .filter((value): value is string => Boolean(value));
        const date = dates[0] ?? null;
        const hasKeyword = EVENT_KEYWORDS.test(entry);

        if (date) rowHasNormalizedDate = true;
        if (!hasKeyword && !date) continue;

        let description = normalizeDescription(entry).slice(0, 180);
        if (date) {
          const inferredDescription = cleanDescriptionWithDateContext(description);
          if (inferredDescription) description = inferredDescription;
        }
        if (date && (!description || isLikelyColumnHeader(description))) {
          diagnostics.droppedDateRowsNoDescription += 1;
          continue;
        }
        if (isPolicyText(description)) continue;

        let type = normalizeEventType('', description);
        if (date && !hasKeyword && type === 'other') type = 'lecture';
        const category = normalizeEventCategory('', description);
        if (description.length > 50) description = shortenToEventName(description, type, category);
        const inferredTime = parseTimeFromText(entry);
        const weight = parseWeightFromText(entry);

        let confidence = scoreEvent({
          date,
          description,
          type,
          sourceSnippet: description.slice(0, 120),
          sectionName: section.name,
          source: 'rule',
        });
        if (date && !hasKeyword) confidence = clampConfidence(confidence - 0.08);

        for (const resolvedDate of (dates.length ? dates : [null])) {
          events.push({
            date: resolvedDate ?? '',
            time: inferredTime ?? undefined,
            description,
            type,
            category,
            confidence,
            needsReview: !resolvedDate || confidence < 0.75,
            sourceSnippet: description.slice(0, 240),
            chunkId: `${section.id}-line-${section.startLine + lineIndex}`,
            ...(weight != null && { weight }),
          });
        }
        rowProducedEvent = true;
      }

      if (rowHasNormalizedDate) diagnostics.normalizedDateRows += 1;
      if (hasDateLikeToken && !rowProducedEvent && !rowHasNormalizedDate) {
        diagnostics.droppedDateRowsNoDescription += 1;
      }
    });
  }

  return {
    courseName: maybeCourseName(rawText),
    events,
    schedules,
    diagnostics,
  };
}

function mergeEvents(events: ParsedEvent[]): ParsedEvent[] {
  const merged = new Map<string, ParsedEvent>();
  for (const event of events) {
    const key = normalizeDedupKey(event.date, event.time, event.description, event.type);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, event);
      continue;
    }
    if (event.confidence > existing.confidence) {
      merged.set(key, event);
      continue;
    }
    if (event.confidence === existing.confidence && event.sourceSnippet.length > existing.sourceSnippet.length) {
      merged.set(key, event);
      continue;
    }
    if (event.confidence === existing.confidence && event.weight != null && existing.weight == null) {
      merged.set(key, { ...existing, weight: event.weight });
    }
  }
  const result = [...merged.values()].sort((a, b) =>
    a.date === b.date ? a.description.localeCompare(b.description) : a.date.localeCompare(b.date)
  );
  // Remove undated events that have a dated counterpart (avoids duplicate tests from assessments + schedule)
  const datedDescriptions = new Set(
    result.filter((e) => e.date).map((e) => e.description.toLowerCase().trim())
  );
  return result.filter(
    (e) => e.date || !datedDescriptions.has(e.description.toLowerCase().trim())
  );
}

function chooseSchedule(candidates: ScheduleCandidate[]): ParsedSchedule {
  const chosen = [...candidates].sort((a, b) => b.confidence - a.confidence)[0];
  if (!chosen) {
    return {
      days: 'NEEDS_INPUT',
      startTime: 'NEEDS_INPUT',
      endTime: 'NEEDS_INPUT',
      confidence: 0,
      needsReview: true,
    };
  }

  const complete = chosen.days.length > 0 && !!chosen.startTime && !!chosen.endTime;
  return {
    days: chosen.days.length ? chosen.days : 'NEEDS_INPUT',
    startTime: chosen.startTime ?? 'NEEDS_INPUT',
    endTime: chosen.endTime ?? 'NEEDS_INPUT',
    confidence: chosen.confidence,
    needsReview: !complete || chosen.confidence < 0.85,
  };
}

function prioritizeChunks(sections: OutlineSection[], chunks: OutlineChunk[], needsSchedule: boolean): OutlineChunk[] {
  const sectionPriority: Record<string, number> = {
    schedule: 100,
    assessments: 90,
    'important dates': 80,
    'weekly outline': 70,
    labs: 60,
    general: 40,
  };
  return [...chunks].sort((a, b) => {
    const aScore = (sectionPriority[a.sectionName] ?? 10) + (needsSchedule && a.sectionName === 'schedule' ? 100 : 0);
    const bScore = (sectionPriority[b.sectionName] ?? 10) + (needsSchedule && b.sectionName === 'schedule' ? 100 : 0);
    if (aScore !== bScore) return bScore - aScore;
    const aSection = sections.find((s) => s.id === a.sectionId);
    const bSection = sections.find((s) => s.id === b.sectionId);
    return (aSection?.startLine ?? 0) - (bSection?.startLine ?? 0);
  });
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = { status: 'fulfilled', value: await fn(items[current]) };
      } catch (error) {
        results[current] = { status: 'rejected', reason: error };
      }
    }
  };

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      onTimeout();
      reject(new Error('AI extraction timed out'));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(id);
        reject(error);
      });
  });
}

function fallbackV1(rawText: string): ParsedOutlineResponse {
  const fallbackYear = inferLikelyYear(rawText);
  const slashDateOrder = detectSlashDateOrder(rawText);
  const lines = rawText
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const events: ParsedEvent[] = [];
  for (const line of lines) {
    if (!EVENT_KEYWORDS.test(line)) continue;
    const date = normalizeDate(line, fallbackYear, slashDateOrder);
    let description = cleanDescriptionWithDateContext(line) || line.replace(/\s+/g, ' ').trim().slice(0, 140);
    if (isPolicyText(description)) continue;
    const type = normalizeEventType('', description);
    const category = normalizeEventCategory('', description);
    if (description.length > 50) description = shortenToEventName(description, type, category);
    const weight = parseWeightFromText(line);
    events.push({
      date: date ?? '',
      time: parseTimeFromText(line) ?? undefined,
      description,
      type,
      category,
      confidence: 0.6,
      needsReview: true,
      sourceSnippet: description,
      ...(weight != null && { weight }),
    });
  }

  return {
    courseName: 'Imported Course',
    events,
    tests: events.filter((e) => e.type === 'test').map((e) => ({ date: e.date, description: e.description })),
    assignments: events
      .filter((e) => e.type === 'assignment')
      .map((e) => ({ date: e.date, description: e.description })),
    schedule: {
      days: 'NEEDS_INPUT',
      startTime: 'NEEDS_INPUT',
      endTime: 'NEEDS_INPUT',
      confidence: 0,
      needsReview: true,
    },
    meta: {
      parserVersion: 'v1-fallback',
      warnings: ['Legacy fallback parser used by explicit flag.'],
      extractedSections: ['general'],
    },
  };
}

export async function parseOutlineHybrid(params: {
  rawText: string;
  aiExtractor?: (chunk: OutlineChunk) => Promise<ChunkExtractionResult>;
  parserV3Enabled?: boolean;
  aiMaxChunks?: number;
  aiConcurrency?: number;
  aiTimeoutMs?: number;
}): Promise<ParsedOutlineResponse> {
  const startedAt = Date.now();
  const parserV3Enabled = params.parserV3Enabled ?? true;
  if (!parserV3Enabled) {
    const legacy = fallbackV1(params.rawText);
    legacy.meta.parseMetrics = {
      durationMs: Date.now() - startedAt,
      aiChunksUsed: 0,
      totalChunks: 0,
      ruleCandidates: legacy.events.length,
      aiTimeouts: 0,
      warnings: legacy.meta.warnings,
    };
    return legacy;
  }

  const warnings: string[] = [];
  const sections = detectSections(params.rawText);
  const rule = extractRules(sections, params.rawText);

  const fallbackYear = inferLikelyYear(params.rawText);
  const slashDateOrder = rule.diagnostics.slashDateOrder;
  const chunks = chunkSections(sections);
  const aiMaxChunks = params.aiMaxChunks ?? 12;
  const aiConcurrency = params.aiConcurrency ?? 3;
  const aiTimeoutMs = params.aiTimeoutMs ?? 8000;

  const needsSchedule = !rule.schedules.some(
    (s) => s.days.length > 0 && s.startTime && s.endTime && s.confidence >= 0.82
  );
  const lowConfidenceEventCount = rule.events.filter((e) => e.confidence < 0.78).length;
  const ruleDatedEventCount = rule.events.filter((e) => Boolean(e.date)).length;
  const shouldUseAI =
    Boolean(params.aiExtractor) &&
    (needsSchedule || rule.events.length < 2 || ruleDatedEventCount < 5 || lowConfidenceEventCount > 0);

  let aiTimeouts = 0;
  let aiChunksUsed = 0;
  const aiEvents: ParsedEvent[] = [];
  const aiSchedules: ScheduleCandidate[] = [];
  const aiCourseNames: string[] = [];

  if (shouldUseAI && params.aiExtractor) {
    const prioritizedChunks = prioritizeChunks(sections, chunks, needsSchedule).slice(0, aiMaxChunks);
    aiChunksUsed = prioritizedChunks.length;
    const settled = await runWithConcurrency(prioritizedChunks, aiConcurrency, async (chunk) => {
      const data = await withTimeout(params.aiExtractor!(chunk), aiTimeoutMs, () => {
        aiTimeouts += 1;
      });
      return { chunk, data };
    });

    for (const result of settled) {
      if (result.status !== 'fulfilled') continue;
      const { chunk, data } = result.value;

      const maybeName = normalizeCourseNameCandidate(data.courseName);
      if (maybeName) aiCourseNames.push(maybeName);

      for (const rawEvent of data.events ?? []) {
        let description = cleanDescriptionWithDateContext(normalizeDescription(rawEvent.description));
        if (!description) continue;
        if (isPolicyText(description)) continue;
        const type = normalizeEventType(rawEvent.type, description);
        const category = normalizeEventCategory(rawEvent.category ?? rawEvent.type, description);
        if (description.length > 50) description = shortenToEventName(description, type, category);
        const date = normalizeDate(rawEvent.date, fallbackYear, slashDateOrder);
        const time = normalizeTime(rawEvent.time) ?? parseTimeFromText(rawEvent.sourceSnippet ?? rawEvent.description ?? '');
        const sourceSnippet = normalizeDescription(rawEvent.sourceSnippet || description).slice(0, 240);
        const confidence = scoreEvent({
          date,
          description,
          type,
          sourceSnippet,
          sectionName: chunk.sectionName,
          source: 'ai',
        });
        const weight =
          (typeof rawEvent.weight === 'number' && rawEvent.weight >= 0 && rawEvent.weight <= 100
            ? rawEvent.weight
            : null) ?? parseWeightFromText(rawEvent.sourceSnippet ?? rawEvent.description ?? '');

        aiEvents.push({
          date: date ?? '',
          time: time ?? undefined,
          description,
          type,
          category,
          confidence,
          needsReview: !date || confidence < 0.78,
          sourceSnippet,
          chunkId: chunk.chunkId,
          ...(weight != null && { weight }),
        });
      }

      if (data.schedule) {
        const candidate: ScheduleCandidate = {
          days: normalizeDays(data.schedule.days ?? []),
          startTime: normalizeTime(data.schedule.startTime),
          endTime: normalizeTime(data.schedule.endTime),
          confidence: 0,
          sourceSnippet: normalizeDescription(data.schedule.sourceSnippet).slice(0, 240),
          sectionName: chunk.sectionName,
        };
        candidate.confidence = scoreSchedule(candidate, 'ai');
        aiSchedules.push(candidate);
      }
    }
  }

  const mergedEvents = mergeEvents([...rule.events, ...aiEvents]);
  const schedule = chooseSchedule([...rule.schedules, ...aiSchedules]);

  const datedEvents = mergedEvents.filter((e) => Boolean(e.date));
  const undatedEvents = mergedEvents.filter((e) => !e.date);

  if (rule.diagnostics.dateLikeRows > 0 && rule.diagnostics.normalizedDateRows === 0) {
    warnings.push(
      `Detected ${rule.diagnostics.dateLikeRows} date-like row(s) but could not normalize dates. Parsed using ${rule.diagnostics.slashDateOrder.toUpperCase()} slash-date order.`
    );
  }
  if (rule.diagnostics.droppedDateRowsNoDescription > 0) {
    warnings.push(
      `${rule.diagnostics.droppedDateRowsNoDescription} date-like row(s) were skipped because no event description was found.`
    );
  }
  if (!datedEvents.length) warnings.push('No dated events were confidently extracted.');
  if (undatedEvents.length) warnings.push(`${undatedEvents.length} extracted event(s) need dates before import.`);
  if (schedule.days === 'NEEDS_INPUT' || schedule.startTime === 'NEEDS_INPUT' || schedule.endTime === 'NEEDS_INPUT') {
    warnings.push('Schedule is incomplete and requires confirmation.');
  }
  if (aiTimeouts > 0) warnings.push(`AI refinement timed out for ${aiTimeouts} chunk(s).`);
  if (!params.aiExtractor) warnings.push('OPENAI_API_KEY missing; parser ran in rule-only mode.');

  const tests = datedEvents
    .filter((e) => e.type === 'test')
    .map((e) => ({ date: e.date, description: e.description }));
  const assignments = datedEvents
    .filter((e) => e.type === 'assignment')
    .map((e) => ({ date: e.date, description: e.description }));

  const ruleName = normalizeCourseNameCandidate(rule.courseName);
  const courseName = ruleName || aiCourseNames[0] || 'Imported Course';

  return {
    courseName,
    events: mergedEvents.map((event) => ({
      ...event,
      needsReview: event.confidence < 0.8,
    })),
    tests,
    assignments,
    schedule,
    meta: {
      parserVersion: 'v3-hybrid',
      warnings,
      extractedSections: [...new Set(sections.map((section) => section.name))],
      parseMetrics: {
        durationMs: Date.now() - startedAt,
        aiChunksUsed,
        totalChunks: chunks.length,
        ruleCandidates: rule.events.length + rule.schedules.length,
        aiTimeouts,
        warnings,
      },
    },
  };
}


