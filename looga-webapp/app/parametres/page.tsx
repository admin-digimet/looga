'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Globe, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';

export default function ParametresPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

        <div className="bg-white rounded-2xl border border-cream-2 divide-y divide-cream-2">
          <SettingRow
            icon={Bell}
            title="Notifications"
            description="Reçois des alertes sur les nouveaux événements et tes billets."
            value="Bientôt disponible"
          />
          <SettingRow
            icon={Globe}
            title="Langue"
            description="Choisis la langue d'affichage de l'application."
            value="Français"
          />
          <SettingRow
            icon={Shield}
            title="Confidentialité"
            description="Gère tes données personnelles et la suppression du compte."
            value="Bientôt disponible"
          />
        </div>

        <p className="text-sm text-ink-muted text-center mt-6">
          De nouveaux paramètres arrivent bientôt.
        </p>
      </main>
      <Footer />
    </div>
  );
}

interface SettingRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: string;
}

function SettingRow({ icon: Icon, title, description, value }: SettingRowProps) {
  return (
    <div className="flex items-start gap-4 p-5 md:p-6">
      <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-orange" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink text-sm">{title}</p>
        <p className="text-sm text-ink-muted mt-0.5">{description}</p>
      </div>
      <span className="text-xs font-medium text-ink-muted whitespace-nowrap">{value}</span>
    </div>
  );
}
