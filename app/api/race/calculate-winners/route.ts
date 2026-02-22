import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

const rankEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
const rankLabel = (rank: number) => rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place';

function winnerEmail(opts: {
  name: string;
  username: string;
  rank: number;
  prize: number;
  raceTitle: string;
  raceType: string;
}) {
  const { name, username, rank, prize, raceTitle, raceType } = opts;
  const greeting = name || username || 'Champion';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
          <span style="color:rgba(232,234,246,0.6);font-size:14px;margin-left:8px;">Race Results</span>
        </td></tr>
        <tr><td style="padding:32px 24px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">${rankEmoji(rank)}</div>
          <h1 style="margin:0 0 8px;font-size:26px;color:#00f0ff;">Congratulations, ${escapeHtml(greeting)}!</h1>
          <p style="margin:0 0 24px;font-size:16px;color:rgba(232,234,246,0.7);">
            You finished <strong style="color:#e8eaf6;">${rankLabel(rank)}</strong> in the ${escapeHtml(raceTitle)} (${raceType === 'typing' ? 'Typing Race' : 'XP Race'})!
          </p>
          <div style="background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.2);border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:rgba(232,234,246,0.5);text-transform:uppercase;letter-spacing:0.05em;">Prize</p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#00f0ff;">$${prize.toFixed(2)}</p>
          </div>
          <p style="margin:0 0 24px;font-size:14px;color:rgba(232,234,246,0.6);">
            Our team will reach out shortly to arrange your payout. Thank you for competing!
          </p>
          <p style="margin:0;font-size:15px;color:rgba(232,234,246,0.9);">
            Keep studying hard,<br>
            <span style="color:#00f0ff;">The StudySession Team</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function participantEmail(opts: {
  name: string;
  username: string;
  rank: number;
  totalParticipants: number;
  raceTitle: string;
  raceType: string;
  score: string;
}) {
  const { name, username, rank, totalParticipants, raceTitle, raceType, score } = opts;
  const greeting = name || username || 'there';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
          <span style="color:rgba(232,234,246,0.6);font-size:14px;margin-left:8px;">Race Completed</span>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#e8eaf6;">The race is over, ${escapeHtml(greeting)}!</h1>
          <p style="margin:0 0 24px;font-size:15px;color:rgba(232,234,246,0.7);">
            The <strong style="color:#e8eaf6;">${escapeHtml(raceTitle)}</strong> (${raceType === 'typing' ? 'Typing Race' : 'XP Race'}) has concluded.
          </p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;color:rgba(232,234,246,0.5);font-size:13px;">Your Rank</td>
                <td style="padding:8px 0;text-align:right;font-size:15px;font-weight:600;color:#e8eaf6;">#${rank} of ${totalParticipants}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(232,234,246,0.5);font-size:13px;">${raceType === 'typing' ? 'Speed' : 'XP Earned'}</td>
                <td style="padding:8px 0;text-align:right;font-size:15px;font-weight:600;color:#00f0ff;">${escapeHtml(score)}</td>
              </tr>
            </table>
          </div>
          <p style="margin:0 0 24px;font-size:14px;color:rgba(232,234,246,0.6);">
            Great effort! The next race is right around the corner. Keep studying to improve your score.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://studysession.app'}/race" style="display:inline-block;padding:12px 24px;background:rgba(0,240,255,0.15);color:#00f0ff;border:1px solid rgba(0,240,255,0.4);border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            View Results →
          </a>
          <p style="margin:24px 0 0;font-size:15px;color:rgba(232,234,246,0.9);">
            Keep it up,<br>
            <span style="color:#00f0ff;">The StudySession Team</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function generalLeaderboardPodiumEmail(opts: {
  name: string;
  username: string;
  rank: number;
  total_xp: number;
}) {
  const { name, username, rank, total_xp } = opts;
  const greeting = name || username || 'Champion';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eaf6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27;padding:24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151a30;border:1px solid rgba(0,240,255,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:#00f0ff;font-size:20px;font-weight:700;">StudySession</span>
          <span style="color:rgba(232,234,246,0.6);font-size:14px;margin-left:8px;">Global Leaderboard</span>
        </td></tr>
        <tr><td style="padding:32px 24px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">${rankEmoji(rank)}</div>
          <h1 style="margin:0 0 8px;font-size:26px;color:#00f0ff;">You're on the Podium, ${escapeHtml(greeting)}!</h1>
          <p style="margin:0 0 24px;font-size:16px;color:rgba(232,234,246,0.7);">
            You are currently ranked <strong style="color:#e8eaf6;">${rankLabel(rank)}</strong> on the global XP leaderboard!
          </p>
          <div style="background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.2);border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:rgba(232,234,246,0.5);text-transform:uppercase;letter-spacing:0.05em;">Total XP</p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#00f0ff;">${total_xp.toLocaleString()} XP</p>
          </div>
          <p style="margin:0 0 24px;font-size:14px;color:rgba(232,234,246,0.6);">
            Keep learning to defend your spot at the top!
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://studysession.app'}/race" style="display:inline-block;padding:12px 24px;background:rgba(0,240,255,0.15);color:#00f0ff;border:1px solid rgba(0,240,255,0.4);border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            View Leaderboard →
          </a>
          <p style="margin:24px 0 0;font-size:15px;color:rgba(232,234,246,0.9);">
            Congratulations,<br>
            <span style="color:#00f0ff;">The StudySession Team</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  try {
    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, html });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCalculation();
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCalculation();
}

async function runCalculation() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: completedPeriods } = await supabase
    .from('race_periods')
    .select('*')
    .eq('status', 'active')
    .lte('end_date', new Date().toISOString());

  if (!completedPeriods?.length) {
    return NextResponse.json({ message: 'No completed race periods' });
  }

  for (const period of completedPeriods) {
    let entriesQuery = supabase
      .from('race_entries')
      .select('*')
      .eq('race_period_id', period.id);

    if (period.race_type === 'typing') {
      entriesQuery = entriesQuery
        .eq('is_final_submission', true)
        .order('typing_speed_wpm', { ascending: false });
    } else {
      entriesQuery = entriesQuery
        .order('xp_earned_during_race', { ascending: false })
        .order('opted_in_at', { ascending: true });
    }

    const { data: entries } = await entriesQuery;
    if (!entries?.length) {
      await supabase.from('race_periods').update({ status: 'completed' }).eq('id', period.id);
      continue;
    }

    // Collect all participant user ids for bulk lookup
    const userIds = entries.map((e) => e.user_id);
    const { data: users } = await adminClient
      .from('users')
      .select('id, email, full_name, username')
      .in('id', userIds);

    const userMap = new Map((users ?? []).map((u) => [u.id, u]));

    const winners = entries.slice(0, 3);
    const prizes = [period.prize_pool_1st, period.prize_pool_2nd, period.prize_pool_3rd];

    // Assign ranks and prizes
    for (let i = 0; i < winners.length; i++) {
      await supabase
        .from('race_entries')
        .update({ final_rank: i + 1, payout_amount: prizes[i] })
        .eq('id', winners[i].id);
    }

    await supabase.from('race_periods').update({ status: 'completed' }).eq('id', period.id);

    const raceTitle = period.title || 'StudySession Race';
    const raceType = period.race_type || 'xp';
    const totalParticipants = entries.length;

    // Send winner emails (top 3)
    for (let i = 0; i < winners.length; i++) {
      const entry = winners[i];
      const user = userMap.get(entry.user_id);
      if (!user?.email) continue;

      await sendEmail(
        user.email,
        `${rankEmoji(i + 1)} You placed ${rankLabel(i + 1)} in the ${raceTitle}!`,
        winnerEmail({
          name: user.full_name || '',
          username: user.username || '',
          rank: i + 1,
          prize: prizes[i] ?? 0,
          raceTitle,
          raceType,
        })
      );
    }

    // Send completion emails to all other participants
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (i < 3) continue; // winners already got a better email
      const user = userMap.get(entry.user_id);
      if (!user?.email) continue;

      const score = raceType === 'typing'
        ? `${entry.typing_speed_wpm ?? 0} WPM`
        : `${entry.xp_earned_during_race ?? 0} XP`;

      await sendEmail(
        user.email,
        `Race results are in — ${raceTitle}`,
        participantEmail({
          name: user.full_name || '',
          username: user.username || '',
          rank: i + 1,
          totalParticipants,
          raceTitle,
          raceType,
          score,
        })
      );
    }
  }

  // Check general leaderboard podium and notify top 3 if they're new to podium
  // We send a "you're on the podium" email to the current top 3 on global XP leaderboard
  // (This runs after each race completion as a snapshot notification)
  const { data: topUsers } = await adminClient
    .from('users')
    .select('id, email, full_name, username, total_xp')
    .order('total_xp', { ascending: false })
    .limit(3);

  if (topUsers) {
    for (let i = 0; i < topUsers.length; i++) {
      const u = topUsers[i];
      if (!u.email) continue;
      await sendEmail(
        u.email,
        `${rankEmoji(i + 1)} You're ${rankLabel(i + 1)} on the Global Leaderboard!`,
        generalLeaderboardPodiumEmail({
          name: u.full_name || '',
          username: u.username || '',
          rank: i + 1,
          total_xp: u.total_xp ?? 0,
        })
      );
    }
  }

  return NextResponse.json({ success: true });
}
