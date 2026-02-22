import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import SiteJsonLd from "@/components/SiteJsonLd";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`),
  title: {
    default: "StudySession - AI Calendar, Gamified Learning & Courses",
    template: "%s | StudySession",
  },
  description:
    "Level up your productivity with AI-powered calendar parsing, gamified courses with XP & achievements, and monthly competitions. The smart AI calendar for students and learners.",
  keywords: [
    "online courses",
    "AI calendar",
    "syllabus",
    "study schedule",
    "course calendar",
    "academic calendar",
    "gamified learning",
    "learning management",
    "schedule maker",
    "student planner",
  ],
  openGraph: {
    title: "StudySession - AI Calendar, Gamified Learning & Courses",
    description:
      "Level up your productivity with AI-powered calendar parsing, gamified courses, and monthly competitions.",
    url: "/",
    siteName: "StudySession",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySession - AI Calendar, Gamified Learning & Courses",
    description:
      "Level up your productivity with AI-powered calendar parsing, gamified courses, and monthly competitions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <SiteJsonLd />
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 flex flex-col min-h-0">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
