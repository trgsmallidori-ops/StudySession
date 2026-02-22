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

export const metadata = {
  title: "Calendar",
  description:
    "Plan classes and events with a clean, color-coded calendar for students.",
  keywords: [
    "calendar",
    "student planner",
    "class schedule",
    "course schedule",
    "student calendar",
  ],
  openGraph: {
    title: "Calendar | StudySession",
    description:
      "Plan classes and events with a clean, color-coded calendar for students.",
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
