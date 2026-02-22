'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Menu, X, Calendar, BookOpen, Trophy, CreditCard, LogOut, User, Globe, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t, locale, setLocale } = useLanguage();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(u ?? null);
        if (u) {
          try {
            const res = await fetch('/api/user/admin-status');
            if (res.ok) {
              const { is_admin } = await res.json();
              setIsAdmin(is_admin ?? false);
            }
          } catch {
            setIsAdmin(false);
          }
        }
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          fetch('/api/user/admin-status')
            .then((r) => r.ok ? r.json() : { is_admin: false })
            .then((data) => mounted && setIsAdmin(data?.is_admin ?? false));
        } else {
          setIsAdmin(false);
        }
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/calendar', label: t.nav.calendar, icon: Calendar },
    { href: '/learn', label: t.nav.learn, icon: BookOpen },
    { href: '/race', label: t.nav.race, icon: Trophy },
    { href: '/pricing', label: t.nav.pricing, icon: CreditCard },
  ];

  return (
    <nav className="glass border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider text-accent-cyan">
              STUDYSESSION
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-foreground/80 hover:text-accent-cyan transition-colors flex items-center gap-2"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Language switcher */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-1.5 text-foreground/60 hover:text-accent-cyan transition-colors text-sm"
              title={locale === 'en' ? 'Passer en français' : 'Switch to English'}
            >
              <Globe size={16} />
              <span className="font-medium">{locale === 'en' ? 'FR' : 'EN'}</span>
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-foreground/80 hover:text-accent-purple transition-colors"
                  >
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-foreground/80 hover:text-accent-cyan transition-colors"
                >
                  <User size={18} />
                  {t.nav.dashboard}
                </Link>
                <Link
                  href="/account"
                  className="text-foreground/80 hover:text-accent-cyan transition-colors"
                  title="Account Settings"
                >
                  <Settings size={18} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-foreground/80 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground/80 hover:text-accent-cyan transition-colors"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors font-semibold"
                >
                  {t.nav.signUp}
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5 space-y-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block text-foreground/80 hover:text-accent-cyan flex items-center gap-2 py-2"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block text-foreground/80 hover:text-accent-purple py-2"
                  >
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block text-foreground/80 hover:text-accent-cyan flex items-center gap-2 py-2"
                >
                  <User size={18} />
                  {t.nav.dashboard}
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-foreground/80 hover:text-accent-cyan py-2"
                >
                  <Settings size={18} />
                  Account Settings
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-foreground/80 hover:text-red-400 py-2"
                >
                  <LogOut size={18} />
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <div className="flex gap-4 pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-accent-cyan"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50"
                >
                  {t.nav.signUp}
                </Link>
              </div>
            )}
            {/* Mobile language switcher */}
            <button
              onClick={() => { setLocale(locale === 'en' ? 'fr' : 'en'); setMobileOpen(false); }}
              className="flex items-center gap-1.5 text-foreground/60 hover:text-accent-cyan transition-colors text-sm py-2"
            >
              <Globe size={16} />
              <span className="font-medium">{locale === 'en' ? 'Français' : 'English'}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
