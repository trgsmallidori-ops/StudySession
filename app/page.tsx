import Link from 'next/link';
import Image from 'next/image';
import { Calendar, BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react';
import StartEarningXpButton from '@/components/StartEarningXpButton';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
const baseUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

export const metadata = {
  title: "AI Calendar, Learn & Courses — Gamified Productivity",
  description:
    "StudySession: AI-powered calendar parsing, gamified courses with XP, and monthly competitions. The smart calendar for students. Learn, track progress, and level up.",
  keywords: [
    "calendar",
    "AI calendar",
    "smart calendar",
    "learn",
    "courses",
    "gamified learning",
    "online courses",
    "productivity",
    "student calendar",
    "course schedule",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "StudySession",
      description:
        "AI-powered calendar parsing, gamified courses with XP & achievements, and monthly competitions.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/learn?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "StudySession",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description:
        "AI calendar for parsing course outlines, gamified learning with XP and achievements, and monthly skill-based competitions.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "AI-powered calendar parsing",
        "Gamified courses with XP",
        "Achievement badges",
        "Monthly competitions",
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-screen logo background */}
        <div className="absolute inset-0">
          <Image
            src="/logo.png"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
            sizes="100vw"
          />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        {/* Hero content on top */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
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
          <StartEarningXpButton />
        </div>
      </section>
    </div>
  );
}
