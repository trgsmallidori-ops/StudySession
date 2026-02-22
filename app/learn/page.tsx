import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LearnPageClient from './LearnPageClient';
import { isAdmin } from '@/lib/isAdmin';

export const metadata = {
  title: "Learn & Earn XP — Courses",
  description:
    "Complete gamified courses, ace quizzes, unlock achievements, and track your progress with XP. Level up your learning.",
  keywords: [
    "learn",
    "courses",
    "online courses",
    "gamified learning",
    "XP",
    "achievements",
    "educational courses",
  ],
  openGraph: {
    title: "Learn & Earn XP — Courses | StudySession",
    description:
      "Complete gamified courses, ace quizzes, unlock achievements, and track your progress with XP.",
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
  const hasAccess = tier === 'champion' || tier === 'ultimate' || isAdmin(user);

  if (!hasAccess) {
    redirect('/pricing?feature=learn');
  }

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

  return (
    <LearnPageClient
      courses={courses ?? []}
      myCourses={myCourses ?? []}
      enrollmentMap={Object.fromEntries(enrollmentMap)}
      totalXP={profile?.total_xp ?? 0}
      userId={user.id}
      activeRacePeriodId={activeRacePeriodId}
    />
  );
}
