'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-accent-cyan">Check your email</h1>
          <p className="text-foreground/80 mb-6">
            We&apos;ve sent you a link to reset your password.
          </p>
          <Link
            href="/login"
            className="text-accent-cyan hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20">
        <h1 className="text-2xl font-bold text-center mb-6 tracking-wider uppercase text-accent-cyan">
          Reset Password
        </h1>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/80 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          <Link href="/login" className="text-accent-cyan hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
