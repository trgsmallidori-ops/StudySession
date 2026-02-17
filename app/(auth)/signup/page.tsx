'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-accent-cyan">Check your email</h1>
          <p className="text-foreground/80 mb-6">
            We&apos;ve sent you a confirmation link. Click it to activate your account.
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
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/80 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
          </div>
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
          <div>
            <label className="block text-sm text-foreground/80 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            Continue with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
