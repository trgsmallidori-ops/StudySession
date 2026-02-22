import { importOutlineForUser, validateImportOutlinePayload } from './importOutline.ts';

export interface ImportOutlineHttpResult {
  status: number;
  body: unknown;
}

export async function processImportOutlineRequest(supabase: any, body: unknown): Promise<ImportOutlineHttpResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  const parsed = validateImportOutlinePayload(body);
  if (!parsed.success) {
    return { status: 400, body: { error: 'Invalid import payload' } };
  }

  const result = await importOutlineForUser(supabase, user.id, parsed.data);
  if (!result.ok) {
    return { status: result.status, body: { error: result.error } };
  }

  return { status: 200, body: result.data };
}
