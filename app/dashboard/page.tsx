import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, BookOpen, Trophy, Zap } from 'lucide-react';
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const level = profile?.total_xp ? Math.floor(profile.total_xp / 100) + 1 : 1;
  const xpInLevel = profile?.total_xp ? profile.total_xp % 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-foreground/70 mb-8">{user.email}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <Zap className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Level</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full transition-all"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
          <p className="text-sm text-foreground/60 mt-2">{profile?.total_xp ?? 0} XP total</p>
        </div>

        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <Calendar className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Subscription</p>
              <p className="text-xl font-bold capitalize">{profile?.subscription_tier ?? 'free'}</p>
            </div>
          </div>
          {profile?.subscription_tier !== 'free' ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="text-accent-cyan text-sm hover:underline"
            >
              Upgrade plan →
            </Link>
          )}
        </div>

        <div className="glass rounded-xl p-6 border border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <BookOpen className="text-accent-cyan" size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Calendar Uploads</p>
              <p className="text-xl font-bold">{profile?.calendar_uploads_used ?? 0} used</p>
            </div>
          </div>
          <p className="text-sm text-foreground/60">
            {profile?.subscription_tier === 'free' ? '2 free uploads' : 'Unlimited'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/calendar"
          className="glass rounded-xl p-6 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors group"
        >
          <Calendar className="text-accent-cyan mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">Calendar</h3>
          <p className="text-sm text-foreground/60">
            Manage your classes and events. Upload course outlines with AI parsing.
          </p>
        </Link>
        <Link
          href="/learn"
          className="glass rounded-xl p-6 border border-accent-pink/20 hover:border-accent-pink/40 transition-colors group"
        >
          <BookOpen className="text-accent-pink mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">Learn</h3>
          <p className="text-sm text-foreground/60">
            Browse courses, earn XP, and unlock achievements.
          </p>
        </Link>
        <Link
          href="/race"
          className="glass rounded-xl p-6 border border-accent-purple/20 hover:border-accent-purple/40 transition-colors group"
        >
          <Trophy className="text-accent-purple mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-lg font-semibold mb-2">Race</h3>
          <p className="text-sm text-foreground/60">
            Join the monthly productivity challenge. Compete for prizes.
          </p>
        </Link>
      </div>
    </div>
  );
}
