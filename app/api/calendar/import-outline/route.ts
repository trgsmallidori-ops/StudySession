import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processImportOutlineRequest } from '@/lib/calendar/importOutlineRequest';

export async function handleImportOutlineRequest(supabase: any, body: unknown) {
  const result = await processImportOutlineRequest(supabase, body);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    return handleImportOutlineRequest(supabase, body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import outline' },
      { status: 500 }
    );
  }
}
