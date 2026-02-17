import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CoursePlayer from './CoursePlayer';

export default async function CourseEnrollPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment) redirect(`/learn/${courseId}`);

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  return (
    <CoursePlayer
      course={course}
      modules={modules ?? []}
      enrollment={enrollment}
    />
  );
}
