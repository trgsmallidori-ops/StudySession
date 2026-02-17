import { Suspense } from 'react';
import PricingContent from './PricingContent';

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}
