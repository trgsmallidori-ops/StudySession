import { Suspense } from 'react';
import PricingContent from './PricingContent';

export const metadata = {
  title: "Pricing — Plans for Students & Learners",
  description:
    "StudySession pricing: Free tier with AI calendar, Scholar, Champion, and Ultimate plans. Gamified learning, courses, and monthly races.",
  keywords: [
    "pricing",
    "plans",
    "AI calendar",
    "learn",
    "courses",
    "subscription",
    "student plans",
  ],
  openGraph: {
    title: "Pricing | StudySession",
    description:
      "Free tier and premium plans for AI calendar, gamified courses, and monthly competitions.",
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
