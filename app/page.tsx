import Link from 'next/link';
import { Calendar, BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Level Up Your</span>
              <br />
              <span className="bg-gradient-to-r from-accent-cyan via-accent-pink to-accent-purple bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>
            <p className="text-xl text-foreground/80 mb-10 max-w-2xl mx-auto">
              AI-powered calendar parsing, gamified courses with XP & achievements,
              and monthly skill-based competitions. Your productivity, supercharged.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-lg bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan/50 hover:bg-accent-cyan/30 hover:shadow-neon-cyan transition-all font-semibold flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-wider uppercase">
            Three Ways to <span className="text-accent-cyan">Excel</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-cyan/10 w-fit mb-6">
                <Calendar className="text-accent-cyan" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Calendar</h3>
              <p className="text-foreground/70 mb-4">
                Upload your course outline and let AI extract tests, assignments, and class schedules. Color-coded and organized.
              </p>
              <Link href="/calendar" className="text-accent-cyan hover:underline flex items-center gap-2">
                Try Calendar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="glass rounded-2xl p-8 border border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-pink/10 w-fit mb-6">
                <BookOpen className="text-accent-pink" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn & Earn XP</h3>
              <p className="text-foreground/70 mb-4">
                Complete courses, ace quizzes, and unlock achievements. Track your progress with an animated XP system.
              </p>
              <Link href="/learn" className="text-accent-pink hover:underline flex items-center gap-2">
                Explore Courses <ArrowRight size={16} />
              </Link>
            </div>
            <div className="glass rounded-2xl p-8 border border-accent-purple/20 hover:border-accent-purple/40 transition-colors">
              <div className="p-4 rounded-xl bg-accent-purple/10 w-fit mb-6">
                <Trophy className="text-accent-purple" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Monthly Race</h3>
              <p className="text-foreground/70 mb-4">
                Join the productivity challenge. 100% skill-based. Compete for real prizes. Free for subscribers.
              </p>
              <Link href="/race" className="text-accent-purple hover:underline flex items-center gap-2">
                Join Race <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-accent-cyan/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6">
            <Zap className="text-accent-cyan" size={20} />
            <span className="text-accent-cyan font-medium">Gamified Learning</span>
          </div>
          <h2 className="text-3xl font-bold mb-6">
            Your Progress, Your Rewards
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-10">
            Earn XP for every course completed and quiz passed. Unlock achievement badges.
            Climb the leaderboard. Stay motivated with a system designed for consistent growth.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors font-semibold"
          >
            Start Earning XP
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
