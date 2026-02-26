'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useLanguage();

  const checkUsername = useCallback(async (value: string) => {
    const cleaned = value.trim().toLowerCase();
    if (!cleaned) { setUsernameStatus('idle'); setUsernameMessage(''); return; }
    if (cleaned.length < 3) { setUsernameStatus('invalid'); setUsernameMessage('At least 3 characters'); return; }
    if (cleaned.length > 20) { setUsernameStatus('invalid'); setUsernameMessage('Max 20 characters'); return; }
    if (!/^[a-z0-9_]+$/.test(cleaned)) { setUsernameStatus('invalid'); setUsernameMessage('Letters, numbers, underscores only'); return; }

    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (data.available) {
        setUsernameStatus('available');
        setUsernameMessage('Username is available');
      } else {
        setUsernameStatus('taken');
        setUsernameMessage(data.reason || 'Username is already taken');
      }
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeToTerms) { setError(t.auth.mustAgree); return; }
    if (!username.trim()) { setError('Please choose a username'); return; }
    if (usernameStatus !== 'available') { setError('Please choose a valid, available username'); return; }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username: username.trim().toLowerCase() } },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    // When "Confirm email" is disabled in Supabase, a session is returned and user is already signed in
    if (data.session) {
      router.refresh();
      router.push(searchParams.get('next') || '/dashboard');
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  };

  const handleOAuth = async (provider: 'google') => {
    setError(null);
    if (!agreeToTerms) { setError(t.auth.mustAgree); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const usernameIcon = () => {
    if (usernameStatus === 'checking') return <Loader2 size={16} className="animate-spin text-foreground/40" />;
    if (usernameStatus === 'available') return <CheckCircle size={16} className="text-green-400" />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <XCircle size={16} className="text-red-400" />;
    return null;
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md border border-accent-cyan/20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-accent-cyan">{t.auth.checkEmail}</h1>
          <p className="text-foreground/80 mb-6">{t.auth.confirmLink}</p>
          <Link href="/login" className="text-accent-cyan hover:underline">{t.auth.backToLogin}</Link>
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
            <label className="block text-sm text-foreground/80 mb-2">
              Username <span className="text-accent-cyan">*</span>
              <span className="text-foreground/50 ml-1 text-xs">(shown on leaderboards)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="your_username"
                className="w-full pl-8 pr-10 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameIcon()}
              </span>
            </div>
            {usernameMessage && (
              <p className={`text-xs mt-1 ${usernameStatus === 'available' ? 'text-green-400' : 'text-red-400'}`}>
                {usernameMessage}
              </p>
            )}
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
            className="w-full py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? t.auth.creatingAccount : t.nav.signUp}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.auth.continueGoogle}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/70">
          {t.auth.haveAccount}{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">{t.nav.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
