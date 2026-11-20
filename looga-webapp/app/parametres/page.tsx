'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Globe, Shield, ArrowUpRight } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { useAuthStore } from '@/lib/store/authStore';

const NOTIF_KEY = 'looga_notif_email';

export default function ParametresPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [emailNotif, setEmailNotif] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored !== null) setEmailNotif(stored === 'true');
  }, []);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  function handleToggleNotif() {
    const next = !emailNotif;
    setEmailNotif(next);
    localStorage.setItem(NOTIF_KEY, String(next));
    setSaved(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#130b1e] font-sans text-white">
      <PublicHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-5 py-12 md:px-8 md:py-16">
        {isLoading || !isAuthenticated ? (
          <div className="h-44 animate-pulse rounded-[22px] bg-[#24172f]" aria-label="Chargement des paramètres" />
        ) : (
          <>
            <header className="mb-9">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">Paramètres</h1>
              <p className="mt-3 text-sm text-[#b8a8c9] md:text-base">Personnalise ton expérience Looga.</p>
            </header>

            <div className="overflow-hidden rounded-[22px] border border-[#45314e] bg-[#24172f] divide-y divide-[#45314e]">
              <div className="flex items-center gap-3 p-5 md:gap-4 md:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3a2443]">
                  <Bell className="h-5 w-5 text-[#ff791f]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white md:text-base">Notifications email</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#b8a8c9] md:text-sm">Reçois des alertes sur les nouveaux événements et tes billets.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Notifications email"
                  aria-checked={emailNotif}
                  onClick={handleToggleNotif}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f] ${emailNotif ? 'bg-[#ff791f]' : 'bg-[#5a4b66]'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-5 md:gap-4 md:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3a2443]">
                  <Globe className="h-5 w-5 text-[#ff791f]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white md:text-base">Langue</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#b8a8c9] md:text-sm">Langue d'affichage de l'application.</p>
                </div>
                <span className="shrink-0 rounded-lg bg-[#3a2443] px-3 py-1.5 text-xs font-semibold text-white">Français</span>
              </div>

              <div className="flex items-center gap-3 p-5 md:gap-4 md:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3a2443]">
                  <Shield className="h-5 w-5 text-[#ff791f]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white md:text-base">Confidentialité</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#b8a8c9] md:text-sm">Consulte notre politique de confidentialité.</p>
                </div>
                <Link href="/confidentialite" aria-label="Voir la politique de confidentialité" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#ff791f] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f]">
                  <span className="hidden sm:inline">Voir la politique</span>
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div aria-live="polite" className="mt-4 min-h-6 text-sm text-[#b8a8c9]">
              {saved ? 'Préférences enregistrées.' : ''}
            </div>
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
