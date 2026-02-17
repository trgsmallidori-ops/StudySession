import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditCourseClient from './EditCourseClient';

export default async function EditCoursePage({
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
    .eq('creator_id', user.id)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  return (
    <EditCourseClient
      course={course}
      modules={modules ?? []}
    />
  );
}
