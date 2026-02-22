import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CalendarPageClient from './CalendarPageClient';
import { isAdmin } from '@/lib/isAdmin';

async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('calendar_uploads_used, subscription_tier')
    .eq('id', userId)
    .single();
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
  const uploadLimit = profile?.subscription_tier === 'free' ? 2 : 999;
  const tier = profile?.subscription_tier ?? 'free';
  const admin = isAdmin(user);
  const canUseAI = admin || tier === 'scholar' || tier === 'ultimate';
  const canGenerateStudyCourse = admin || tier === 'ultimate';

  return (
    <CalendarPageClient
      uploadsUsed={uploadsUsed}
      uploadLimit={uploadLimit}
      canUseAI={canUseAI}
      canGenerateStudyCourse={canGenerateStudyCourse}
    />
  );
}
