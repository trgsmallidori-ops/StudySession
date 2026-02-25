const SECURITY_WEBHOOK_URL = process.env.SECURITY_WEBHOOK_URL;

export interface SecurityEventPayload {
  type: 'auth_failed' | 'forbidden' | 'account_deleted' | 'suspicious';
  message: string;
  path?: string;
  userId?: string;
  context?: Record<string, string | number | boolean>;
}

/**
 * Sends a security/audit event to a configured webhook URL (e.g. Slack, Discord, or your own endpoint).
 * Set SECURITY_WEBHOOK_URL in .env to enable. No-op if not set.
 * Use for: failed logins, 403s, account deletions, suspicious activity.
 */
export async function notifySecurityWebhook(payload: SecurityEventPayload): Promise<void> {
  if (!SECURITY_WEBHOOK_URL || SECURITY_WEBHOOK_URL === 'placeholder') return;

  try {
    const body = {
      type: payload.type,
      message: payload.message,
      path: payload.path,
      userId: payload.userId,
      context: payload.context,
      timestamp: new Date().toISOString(),
      source: 'studysession',
    };

    const res = await fetch(SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn('[security webhook] Non-2xx response:', res.status);
    }
  } catch (err) {
    console.warn('[security webhook] Failed to send:', err);
  }
}
