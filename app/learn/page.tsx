import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LearnPageClient from './LearnPageClient';
import CoursesJsonLd from '@/components/CoursesJsonLd';
import { isAdmin } from '@/lib/isAdmin';

function getCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  const base = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  return `${base}${path}`;
}

export const metadata = {
  title: "Learn & Earn XP — Online Courses",
  description:
    "Complete gamified online courses, ace quizzes, unlock achievements, and track your progress with XP. E-learning platform for students and learners.",
  keywords: [
    "online courses",
    "e-learning",
    "gamified courses",
    "learn online",
    "educational courses",
    "XP",
    "achievements",
    "course catalog",
    "study courses",
  ],
  alternates: { canonical: getCanonicalUrl("/learn") },
  openGraph: {
    title: "Learn & Earn XP — Online Courses | StudySession",
    description:
      "Complete gamified online courses, ace quizzes, unlock achievements, and track your progress with XP.",
    url: "/learn",
    images: ["/og-image.png"],
  },
};

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, total_xp')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier ?? 'free';
  const hasFullAccess = tier === 'champion' || tier === 'ultimate' || isAdmin(user);

  const { data: courses } = await supabase
    .from('courses')
    .select('*, creator:users!creator_id(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const { data: myCourses } = await supabase
    .from('courses')
    .select('*, creator:users!creator_id(full_name)')
    .eq('creator_id', user.id)
    .eq('is_published', false)
    .order('created_at', { ascending: false });

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id, progress_percentage')
    .eq('user_id', user.id);

  const enrollmentMap = new Map(
    (enrollments ?? []).map((e) => [e.course_id, e])
  );

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const startOfToday = `${todayStr}T00:00:00.000Z`;

  const { data: activePeriods } = await supabase
    .from('race_periods')
    .select('id')
    .eq('status', 'active')
    .lte('start_date', now.toISOString())
    .gte('end_date', startOfToday)
    .limit(1);

  const activeRacePeriodId = activePeriods?.[0]?.id ?? null;

  const freeCourseLimit = 1;
  const canCreateMoreCourses = hasFullAccess || (tier === 'free' && (myCourses?.length ?? 0) < freeCourseLimit);

  return (
    <>
      <CoursesJsonLd courses={courses ?? []} />
      <LearnPageClient
        courses={courses ?? []}
        myCourses={myCourses ?? []}
        enrollmentMap={Object.fromEntries(enrollmentMap)}
        totalXP={profile?.total_xp ?? 0}
        userId={user.id}
        activeRacePeriodId={activeRacePeriodId}
        canCreateMoreCourses={canCreateMoreCourses}
        courseLimitReached={tier === 'free' && (myCourses?.length ?? 0) >= freeCourseLimit}
      />
    </>
  );
}
