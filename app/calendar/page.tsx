import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CalendarPageClient from './CalendarPageClient';
import { isAdmin } from '@/lib/isAdmin';

const SCHOLAR_UPLOAD_LIMIT = 30;

async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('calendar_uploads_used, calendar_uploads_year, subscription_tier')
    .eq('id', userId)
    .single();
  if (!data) return data;
  const tier = data.subscription_tier ?? 'free';
  const currentYear = new Date().getFullYear();
  if (tier === 'scholar' && data.calendar_uploads_year !== currentYear) {
    await supabase
      .from('users')
      .update({ calendar_uploads_used: 0, calendar_uploads_year: currentYear })
      .eq('id', userId);
    const { data: updated } = await supabase
      .from('users')
      .select('calendar_uploads_used, subscription_tier')
      .eq('id', userId)
      .single();
    return updated ?? data;
  }
  return data;
}

function getCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  const base = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  return `${base}${path}`;
}

export const metadata = {
  title: "AI Calendar — Syllabus Parser & Study Schedule",
  description:
    "Upload your course outline and let AI extract tests, assignments, and class schedules. Color-coded academic calendar and syllabus parser for students.",
  keywords: [
    "AI calendar",
    "course calendar",
    "syllabus parser",
    "academic schedule",
    "class schedule",
    "study schedule",
    "student planner",
    "course schedule",
    "academic calendar",
  ],
  alternates: { canonical: getCanonicalUrl("/calendar") },
  openGraph: {
    title: "AI Calendar — Syllabus Parser & Study Schedule | StudySession",
    description:
      "Upload your course outline and let AI extract tests, assignments, and class schedules. Color-coded academic calendar.",
    url: "/calendar",
    images: ["/og-image.png"],
  },
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);
  const uploadsUsed = profile?.calendar_uploads_used ?? 0;
  const tier = profile?.subscription_tier ?? 'free';
  const uploadLimit =
    tier === 'free' ? 2 : tier === 'scholar' ? SCHOLAR_UPLOAD_LIMIT : 999;
  const admin = isAdmin(user);
  const canUseAI = true; // Free: 2 uploads, Scholar: 30/year (enforced in API)
  const canGenerateStudyCourse = admin || tier === 'champion' || tier === 'ultimate';

  return (
    <CalendarPageClient
      uploadsUsed={uploadsUsed}
      uploadLimit={uploadLimit}
      canUseAI={canUseAI}
      canGenerateStudyCourse={canGenerateStudyCourse}
    />
  );
}
