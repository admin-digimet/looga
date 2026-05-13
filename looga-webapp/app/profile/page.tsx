'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User as UserIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

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

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-8">
          Mon profil
        </h1>

        <div className="bg-white rounded-2xl border border-cream-2 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-orange flex items-center justify-center text-white font-bold text-3xl">
              {initial}
            </div>
            <div>
              <p className="font-heading font-bold text-xl text-ink">{user?.name ?? '—'}</p>
              <p className="text-sm text-ink-muted">Membre Looga</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-cream-2 pt-6">
            <Field icon={UserIcon} label="Nom complet" value={user?.name} />
            <Field icon={Mail} label="Email" value={user?.email} />
            <Field icon={Phone} label="Téléphone" value={user?.phone} />
          </div>
        </div>

        <p className="text-sm text-ink-muted text-center">
          La modification du profil arrive bientôt.
        </p>
      </main>
      <Footer />
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}

function Field({ icon: Icon, label, value }: FieldProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-orange" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-ink truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
