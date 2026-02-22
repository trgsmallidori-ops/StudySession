import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isAdmin } from '@/lib/isAdmin';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const announcementEmailHtml = (title: string, message: string, name: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
          <span style="color:rgba(232,234,246,0.6);font-size:14px;margin-left:8px;">Race Announcement</span>
        </td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#e8eaf6;">${escapeHtml(title)}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(232,234,246,0.9);white-space:pre-wrap;">${escapeHtml(message)}</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(232,234,246,0.9);">
            Best regards,<br>
            <span style="color:#00f0ff;">The StudySession Team</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { title, message, race_period_id } = body;

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message required' }, { status: 400 });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      { error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.' },
      { status: 500 }
    );
  }

  const adminClient = createAdminClient();
  const { data: recipients } = await adminClient
    .from('users')
    .select('id, email, full_name')
    .in('subscription_tier', ['champion', 'ultimate']);

  if (!recipients || recipients.length === 0) {
    const { data: announcement } = await adminClient
      .from('race_announcements')
      .insert({
        race_period_id: race_period_id || null,
        title,
        message,
        sent_to_count: 0,
      })
      .select()
      .single();
    return NextResponse.json({ success: true, sent_to_count: 0, announcement });
  }

  let sentCount = 0;
  const html = announcementEmailHtml(title, message, 'there');
  const text = `${title}\n\n${message}\n\nBest regards,\nThe StudySession Team`;

  for (const r of recipients) {
    const to = r.email;
    if (!to) continue;
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject: `StudySession Race: ${title}`,
        text,
        html: announcementEmailHtml(title, message, r.full_name || 'there'),
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send announcement to ${to}:`, err);
    }
  }

  const { data: announcement } = await adminClient
    .from('race_announcements')
    .insert({
      race_period_id: race_period_id || null,
      title,
      message,
      sent_to_count: sentCount,
    })
    .select()
    .single();

  return NextResponse.json({ success: true, sent_to_count: sentCount, announcement });
}
