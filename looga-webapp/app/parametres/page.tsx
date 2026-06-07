'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Globe, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';

const NOTIF_KEY = 'looga_notif_email';

export default function ParametresPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [emailNotif, setEmailNotif] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored !== null) setEmailNotif(stored === 'true');
  }, []);

  function handleToggleNotif() {
    const next = !emailNotif;
    setEmailNotif(next);
    localStorage.setItem(NOTIF_KEY, String(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream font-sans">
        <Navbar />
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-8">
          Paramètres
        </h1>

        {saved && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            Préférences enregistrées.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-cream-2 divide-y divide-cream-2">
          {/* Notifications */}
          <div className="flex items-start gap-4 p-5 md:p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink text-sm">Notifications email</p>
              <p className="text-sm text-ink-muted mt-0.5">
                Reçois des alertes sur les nouveaux événements et tes billets.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotif}
              onClick={handleToggleNotif}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${emailNotif ? 'bg-orange' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Langue */}
          <div className="flex items-start gap-4 p-5 md:p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink text-sm">Langue</p>
              <p className="text-sm text-ink-muted mt-0.5">Langue d'affichage de l'application.</p>
            </div>
            <span className="text-xs font-semibold text-ink bg-cream-2 px-2 py-1 rounded-lg whitespace-nowrap">Français</span>
          </div>

          {/* Confidentialité */}
          <div className="flex items-start gap-4 p-5 md:p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink text-sm">Confidentialité</p>
              <p className="text-sm text-ink-muted mt-0.5">Gère tes données personnelles et consulte notre politique.</p>
            </div>
            <Link
              href="/confidentialite"
              className="text-xs font-semibold text-orange whitespace-nowrap hover:underline"
            >
              Voir la politique →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
