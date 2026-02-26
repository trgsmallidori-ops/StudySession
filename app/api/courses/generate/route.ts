import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/isAdmin';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_DURATIONS = [3, 4, 7, 10] as const;
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

const GENERATE_PROMPT = `You are an expert course designer. Create a structured learning course based on the user's topic.

For each day, include:
1. A "lesson" section: teach key concepts with clear explanations
2. An "exercise" section: hands-on practice or task for the user
3. A "quiz" section: exactly 8 multiple-choice questions to reinforce learning (each with exactly 4 options, correct_index 0-3)

Return ONLY valid JSON, no markdown or extra text:
{
  "title": "Course title (engaging, descriptive)",
  "description": "2-3 sentence course overview",
  "modules": [
    {
      "day": 1,
      "title": "Day 1: [Topic for this day]",
      "sections": [
        { "type": "lesson", "title": "Section title", "content": "Full lesson content as markdown-friendly text" },
        { "type": "exercise", "title": "Practice", "instructions": "Clear step-by-step instructions" },
        {
          "type": "quiz",
          "questions": [
            { "question": "Question text?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Why the answer is correct" },
            { "question": "Second question?", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation" },
            { "question": "Third question?", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation" },
            { "question": "Fourth question?", "options": ["A", "B", "C", "D"], "correct_index": 3, "explanation": "Explanation" },
            { "question": "Fifth question?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation" },
            { "question": "Sixth question?", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation" },
            { "question": "Seventh question?", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation" },
            { "question": "Eighth question?", "options": ["A", "B", "C", "D"], "correct_index": 3, "explanation": "Explanation" }
          ]
        }
      ]
    }
  ]
}

Generate exactly the number of days requested. Each day MUST have exactly 8 quiz questions. Match the difficulty level in content depth and vocabulary.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier ?? 'free';
    const hasFullAccess = tier === 'champion' || tier === 'ultimate' || isAdmin(user);

    if (!hasFullAccess && tier === 'free') {
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: 'Upgrade to create more courses.', upgradeRequired: true },
          { status: 403 }
        );
      }
    }

    const COURSE_GENERATIONS_PER_DAY = 3;
    if (!isAdmin(user) && hasFullAccess) {
      const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .gte('created_at', todayStart);
      if ((count ?? 0) >= COURSE_GENERATIONS_PER_DAY) {
        return NextResponse.json(
          { error: `Daily limit reached. You can generate up to ${COURSE_GENERATIONS_PER_DAY} courses per day.` },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const durationDays = body.duration_days;
    const difficulty = body.difficulty;

    if (!topic || topic.length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!VALID_DURATIONS.includes(durationDays)) {
      return NextResponse.json(
        { error: 'duration_days must be 3, 4, 7, or 10' },
        { status: 400 }
      );
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty must be beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: GENERATE_PROMPT,
        },
        {
          role: 'user',
          content: `Create a ${durationDays}-day ${difficulty} course about: "${topic}"`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const parsed = JSON.parse(content) as {
      title?: string;
      description?: string;
      modules?: Array<{
        day?: number;
        title?: string;
        sections?: Array<{
          type?: string;
          title?: string;
          content?: string;
          instructions?: string;
          question?: string;
          options?: string[];
          correct_index?: number;
          explanation?: string;
          questions?: Array<{
            question?: string;
            options?: string[];
            correct_index?: number;
            explanation?: string;
          }>;
        }>;
      }>;
    };

    const title = parsed.title ?? `Learn: ${topic}`;
    const description = parsed.description ?? `A ${durationDays}-day course on ${topic}`;
    const modules = parsed.modules ?? [];

    const xpPerDay = Math.ceil(100 / Math.max(modules.length, 1));
    const totalXpReward = xpPerDay * modules.length;

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        creator_id: user.id,
        title,
        description,
        duration_days: durationDays,
        difficulty,
        total_xp_reward: totalXpReward,
        thumbnail_url: null,
        is_published: false,
      })
      .select()
      .single();

    if (courseError || !course) {
      console.error('Course insert error:', courseError);
      return NextResponse.json(
        { error: courseError?.message ?? 'Failed to create course' },
        { status: 500 }
      );
    }

    const moduleRows = modules.map((mod, i) => ({
      course_id: course.id,
      title: mod.title ?? `Day ${i + 1}`,
      order_index: i,
      content: {
        sections: mod.sections ?? [],
        day: mod.day ?? i + 1,
      },
    }));

    const { error: modulesError } = await supabase
      .from('course_modules')
      .insert(moduleRows);

    if (modulesError) {
      console.error('Modules insert error:', modulesError);
      await supabase.from('courses').delete().eq('id', course.id);
      return NextResponse.json(
        { error: modulesError.message },
        { status: 500 }
      );
    }

    await supabase.from('course_enrollments').insert({
      user_id: user.id,
      course_id: course.id,
      progress_percentage: 0,
      xp_earned: 0,
    });

    return NextResponse.json({ courseId: course.id });
  } catch (error) {
    console.error('Generate course error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate course',
      },
      { status: 500 }
    );
  }
}
