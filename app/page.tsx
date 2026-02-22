import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import HomeJsonLd from "@/components/HomeJsonLd";

function getCanonicalUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
}

export const metadata: Metadata = {
  title: "StudySession — Online Courses, AI Calendar & Study Schedule",
  description:
    "Organize your syllabus, build a smart study schedule, and take online courses with XP & achievements. The AI-powered learning calendar for students.",
  keywords: [
    "online courses",
    "syllabus",
    "study schedule",
    "academic calendar",
    "course calendar",
    "learning management",
    "schedule maker",
    "online learning platform",
    "course syllabus",
    "student planner",
  ],
  alternates: {
    canonical: getCanonicalUrl(),
  },
  openGraph: {
    title: "StudySession — Online Courses, AI Calendar & Study Schedule",
    description:
      "Organize your syllabus, build a smart study schedule, and take online courses with XP & achievements.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySession — Online Courses, AI Calendar & Study Schedule",
    description:
      "Organize your syllabus, build a smart study schedule, and take online courses with XP & achievements.",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <HomePageClient />
    </>
  );
}
