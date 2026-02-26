import { Suspense } from 'react';
import PricingContent from './PricingContent';

function getCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  const base = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  return `${base}${path}`;
}

export const metadata = {
  title: "Pricing — Online Learning Platform Plans",
  description:
    "StudySession pricing: Free tier with AI calendar, Scholar ($15/year) and Champion ($8/month) plans. Calendar uploads and gamified learning with monthly races.",
  keywords: [
    "online learning platform pricing",
    "course subscription",
    "student plans",
    "AI calendar plans",
    "gamified learning subscription",
    "e-learning pricing",
  ],
  alternates: { canonical: getCanonicalUrl("/pricing") },
  openGraph: {
    title: "Pricing — Online Learning Platform | StudySession",
    description:
      "Free tier and premium plans for AI calendar, gamified courses, and monthly competitions.",
    url: "/pricing",
    images: ["/og-image.png"],
  },
};

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}
