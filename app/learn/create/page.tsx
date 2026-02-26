import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateCourseClient from './CreateCourseClient';

export default async function CreateCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <CreateCourseClient />;
}
