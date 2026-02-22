'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20">
        <h1 className="text-2xl font-bold text-center mb-6 tracking-wider uppercase text-accent-cyan">
          {t.auth.signIn}
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/80 mb-2">{t.auth.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground/80 mb-2">{t.auth.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t.auth.signingIn : t.auth.signIn}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            {t.auth.continueGoogle}
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            {t.auth.continueGithub}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/70">
          {t.auth.noAccount}{' '}
          <Link href="/signup" className="text-accent-cyan hover:underline">
            {t.nav.signUp}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-foreground/70">
          <Link href="/reset-password" className="text-accent-cyan hover:underline">
            {t.auth.forgotPassword}
          </Link>
        </p>
      </div>
    </div>
  );
}
