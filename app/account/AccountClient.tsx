'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, User, Mail, Lock, AtSign, Save, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  username_updated_at: string | null;
  subscription_tier?: string | null;
}

interface Props {
  profile: Profile | null;
  userEmail: string;
}

export default function AccountClient({ profile, userEmail }: Props) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [email, setEmail] = useState(userEmail);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [passwordSection, setPasswordSection] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const usernameNextAllowed = profile?.username_updated_at
    ? new Date(new Date(profile.username_updated_at).getTime() + 14 * 24 * 60 * 60 * 1000)
    : null;
  const canChangeUsername = !usernameNextAllowed || usernameNextAllowed <= new Date();

  const checkUsername = useCallback(async (value: string) => {
    const cleaned = value.trim().toLowerCase();
    if (!cleaned || cleaned === profile?.username) { setUsernameStatus('idle'); setUsernameMessage(''); return; }
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
  }, [profile?.username]);

  useEffect(() => {
    if (!canChangeUsername) return;
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername, canChangeUsername]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const payload: Record<string, string> = {};
    if (fullName !== (profile?.full_name ?? '')) payload.full_name = fullName;
    if (email !== userEmail) payload.email = email;
    if (canChangeUsername && username.trim().toLowerCase() !== (profile?.username ?? '')) {
      if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
        setSaveError('Please fix username before saving');
        setSaving(false);
        return;
      }
      payload.username = username;
    }

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setSaveError(data.error || 'Failed to save changes');
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    }
    setSaving(false);
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetEmailSent(true);
    setResetLoading(false);
  };

  const usernameIcon = () => {
    if (!canChangeUsername) return null;
    if (usernameStatus === 'checking') return <Loader2 size={16} className="animate-spin text-foreground/40" />;
    if (usernameStatus === 'available') return <CheckCircle size={16} className="text-green-400" />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <XCircle size={16} className="text-red-400" />;
    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/60 hover:text-accent-cyan transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-accent-cyan tracking-wider">Account Settings</h1>
            <p className="text-foreground/60 text-sm mt-0.5">Manage your profile and security</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <User size={18} className="text-accent-cyan" />
              Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-foreground/70 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-foreground/70 mb-1.5 flex items-center gap-1.5">
                  <AtSign size={14} />
                  Username
                  <span className="text-foreground/40 text-xs">(shown on leaderboards)</span>
                </label>
                {canChangeUsername ? (
                  <>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    <p className="text-xs text-foreground/40 mt-1">You can change your username every 2 weeks</p>
                  </>
                ) : (
                  <div className="px-4 py-3 rounded-lg bg-background/30 border border-white/5 text-foreground/60 flex items-center justify-between">
                    <span>@{profile?.username}</span>
                    <span className="text-xs text-foreground/40">
                      Next change: {usernameNextAllowed?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Mail size={18} className="text-accent-cyan" />
              Email Address
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
            />
            {email !== userEmail && (
              <p className="text-xs text-amber-400 mt-2">A confirmation link will be sent to your new email address.</p>
            )}
          </div>

          {/* Save Button */}
          {saveError && <p className="text-red-400 text-sm px-1">{saveError}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
          </button>

          {/* Subscription Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CreditCard size={18} className="text-accent-cyan" />
              {t.dashboard.subscription}
            </h2>
            <p className="text-sm text-foreground/60 mb-4">
              Manage your plan, payment method, and billing.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize bg-accent-cyan/20 text-accent-cyan">
                {profile?.subscription_tier ?? 'free'}
              </span>
              {profile?.subscription_tier && profile.subscription_tier !== 'free' ? (
                <ManageSubscriptionButton />
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30"
                >
                  {t.dashboard.upgradePlan}
                </Link>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lock size={18} className="text-accent-cyan" />
              Password
            </h2>
            <p className="text-sm text-foreground/60 mb-4">
              We&apos;ll send a password reset link to your email address.
            </p>
            {resetEmailSent ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                Reset link sent to {userEmail}
              </div>
            ) : (
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cyan/30 hover:text-accent-cyan transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {resetLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Send Reset Link
              </button>
            )}
          </div>

          {/* Danger Zone */}
          <div className="glass rounded-2xl p-6 border border-red-500/10">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Danger Zone</h2>
            <p className="text-sm text-foreground/60 mb-4">
              Need to delete your account? Contact us at{' '}
              <Link href="/contact" className="text-accent-cyan hover:underline">support</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
