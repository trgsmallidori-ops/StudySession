import { NextResponse } from 'next/server';
import { notifySecurityWebhook, type SecurityEventPayload } from './webhooks/security';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'INTERNAL';

export type { SecurityEventPayload } from './webhooks/security';

export interface ApiErrorOptions {
  status?: number;
  code?: ApiErrorCode;
  /** If set, and SECURITY_WEBHOOK_URL is configured, sends a security event (e.g. failed auth). */
  securityEvent?: SecurityEventPayload;
}

/**
 * Returns a consistent JSON error response and optionally notifies the security webhook.
 * Use in API routes: return apiError('Unauthorized', { status: 401, code: 'UNAUTHORIZED', securityEvent: {...} });
 */
export function apiError(
  message: string,
  options: ApiErrorOptions = {}
): NextResponse {
  const { status = 500, code = 'INTERNAL', securityEvent } = options;

  if (securityEvent) {
    notifySecurityWebhook(securityEvent).catch(() => {
      // Fire-and-forget; don't block response
    });
  }

  return NextResponse.json(
    {
      error: message,
      ...(code && code !== 'INTERNAL' ? { code } : {}),
    },
    { status }
  );
}

/**
 * Wraps an async handler with try/catch and returns apiError on throw.
 * Use for route handlers: export const POST = withApiError(async (req) => { ... });
 */
export function withApiError<T extends Request>(
  handler: (request: T) => Promise<NextResponse>
): (request: T) => Promise<NextResponse> {
  return async (request: T) => {
    try {
      return await handler(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = 500;
      console.error('[API error]', err);
      return apiError(process.env.NODE_ENV === 'development' ? message : 'Something went wrong', {
        status,
        code: 'INTERNAL',
      });
    }
  };
}
