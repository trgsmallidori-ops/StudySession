'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeToTerms) {
      setError(t.auth.mustAgree);
      return;
    }
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
    if (!agreeToTerms) {
      setError(t.auth.mustAgree);
      return;
    }
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
          <h1 className="text-2xl font-bold mb-4 text-accent-cyan">{t.auth.checkEmail}</h1>
          <p className="text-foreground/80 mb-6">
            {t.auth.confirmLink}
          </p>
          <Link
            href="/login"
            className="text-accent-cyan hover:underline"
          >
            {t.auth.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20">
        <h1 className="text-2xl font-bold text-center mb-6 tracking-wider uppercase text-accent-cyan">
          {t.auth.createAccount}
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/80 mb-2">{t.auth.fullName}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
          </div>
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
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 rounded border-white/20 bg-background/50 text-accent-cyan focus:ring-accent-cyan"
            />
            <span className="text-sm text-foreground/80">
              {t.auth.agreeTerms}{' '}
              <Link href="/terms" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">
                {t.footer.terms}
              </Link>{' '}
              {t.auth.and}{' '}
              <Link href="/privacy" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">
                {t.footer.privacy}
              </Link>
            </span>
          </label>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? t.auth.creatingAccount : t.nav.signUp}
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
          {t.auth.haveAccount}{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">
            {t.nav.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
