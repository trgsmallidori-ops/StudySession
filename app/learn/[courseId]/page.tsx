import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CourseDetailClient from './CourseDetailClient';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const hasAccess = profile?.subscription_tier === 'champion' || profile?.subscription_tier === 'ultimate';
  if (!hasAccess) redirect('/pricing?feature=learn');

  const { data: course, error } = await supabase
    .from('courses')
    .select('*, creator:users!creator_id(full_name)')
    .eq('id', courseId)
    .single();

  if (error || !course) notFound();
  if (!course.is_published && course.creator_id !== user.id) notFound();

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  return (
    <CourseDetailClient
      course={course}
      modules={modules ?? []}
      enrollment={enrollment}
      isCreator={course.creator_id === user.id}
    />
  );
}
