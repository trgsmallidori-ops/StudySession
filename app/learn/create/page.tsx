import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateCourseClient from './CreateCourseClient';
import { isAdmin } from '@/lib/isAdmin';

export default async function CreateCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const hasAccess =
    isAdmin(user) ||
    profile?.subscription_tier === 'champion' ||
    profile?.subscription_tier === 'ultimate';
  if (!hasAccess) redirect('/pricing?feature=learn');

  return <CreateCourseClient />;
}
