'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <div className="w-14 h-14 rounded-full bg-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-7 h-7 text-accent-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-foreground/70 text-sm mb-6">
          We encountered an error. You can try again or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 hover:bg-accent-cyan/30 transition-colors font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-colors font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
