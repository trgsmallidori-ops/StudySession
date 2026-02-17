import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const isDocx =
    file.type === DOCX_MIME ||
    ext === '.docx';

  if (isDocx) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return file.text();
}

const PARSE_PROMPT = `Parse this course outline and extract:
1. Course name
2. All test dates (format: YYYY-MM-DD)
3. All assignment due dates (format: YYYY-MM-DD)
4. Class schedule (days of week and times)

If class schedule is not specified, return "NEEDS_INPUT" for days or times.

Return valid JSON only, no markdown or extra text:
{
  "courseName": "",
  "tests": [{"date": "", "description": ""}],
  "assignments": [{"date": "", "description": ""}],
  "schedule": {
    "days": [],
    "startTime": "",
    "endTime": ""
  }
}

For days use integers 0-6 (0=Sunday, 1=Monday, etc). If unknown use "NEEDS_INPUT".
For times use "HH:MM" format. If unknown use "NEEDS_INPUT".`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('subscription_tier, calendar_uploads_used')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier ?? 'free';
    const uploadsUsed = profile?.calendar_uploads_used ?? 0;

    if (tier === 'free' && uploadsUsed >= 2) {
      return NextResponse.json(
        { error: 'Upload limit reached', limitReached: true },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const validExt = ['.pdf', '.txt', '.md', '.docx'];
    const validMimes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      DOCX_MIME,
    ];
    if (!validExt.includes(ext) && !validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PDF, TXT, MD, or DOCX.' },
        { status: 400 }
      );
    }

    const text = await extractTextFromFile(file);
    if (!text?.trim()) {
      return NextResponse.json({ error: 'File is empty or could not be read' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a course outline parser. Extract structured data and return only valid JSON.',
        },
        {
          role: 'user',
          content: `${PARSE_PROMPT}\n\nOutline content:\n${text.slice(0, 12000)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    if (tier === 'free') {
      await supabase
        .from('users')
        .update({ calendar_uploads_used: uploadsUsed + 1 })
        .eq('id', user.id);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Parse outline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse outline' },
      { status: 500 }
    );
  }
}
