import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Site colors: background #0a0e27, card #151a30, foreground #e8eaf6, accent-cyan #00f0ff
const adminEmailHtml = (name: string, email: string, message: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
          <span style="color:rgba(232,234,246,0.6);font-size:14px;margin-left:8px;">New Contact</span>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;font-size:14px;color:rgba(232,234,246,0.8);">
            <strong style="color:#e8eaf6;">${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;
          </p>
          <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:16px;border-left:3px solid #00f0ff;">
            <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;color:#e8eaf6;">${escapeHtml(message)}</p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px;background:rgba(0,0,0,0.15);font-size:12px;color:rgba(232,234,246,0.5);">
          Reply to ${escapeHtml(email)} to respond.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const confirmationEmailHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
        </td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#e8eaf6;">Hi ${escapeHtml(name)},</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(232,234,246,0.9);">
            Thank you for reaching out! We've received your message and will get back to you within <strong style="color:#00f0ff;">24 hours</strong>.
          </p>
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from('contact_submissions').insert({
      name,
      email,
      message,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Notify admin of new submission
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `StudySession Contact: ${name}`,
        text: `From: ${email}\n\n${message}`,
        html: adminEmailHtml(name, email, message),
      });

      // Send confirmation to user
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "We received your message — StudySession",
        text: `Hi ${name},\n\nThank you for reaching out! We've received your message and will get back to you within 24 hours.\n\nBest regards,\nThe StudySession Team`,
        html: confirmationEmailHtml(name),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
