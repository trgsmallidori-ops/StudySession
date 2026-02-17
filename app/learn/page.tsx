import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LearnPageClient from './LearnPageClient';

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
  const hasAccess = tier === 'champion' || tier === 'ultimate';

  if (!hasAccess) {
    redirect('/pricing?feature=learn');
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*, creator:users!creator_id(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id, progress_percentage')
    .eq('user_id', user.id);

  const enrollmentMap = new Map(
    (enrollments ?? []).map((e) => [e.course_id, e])
  );

  return (
    <LearnPageClient
      courses={courses ?? []}
      enrollmentMap={Object.fromEntries(enrollmentMap)}
      totalXP={profile?.total_xp ?? 0}
    />
  );
}
