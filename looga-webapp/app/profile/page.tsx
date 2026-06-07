'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User as UserIcon, Pencil, X, Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { apiClient } from '@/lib/api/client';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, login, token, refreshToken } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', phone: user.phone ?? '' });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);

    try {
      await apiClient.patch(
        `/rest/v1/profiles?id=eq.${user.id}`,
        { name: form.name, phone: form.phone },
        { headers: { Prefer: 'return=minimal' } }
      );
      // Update local store with new name/phone
      if (token) {
        await login(token, { ...user, name: form.name, phone: form.phone }, refreshToken ?? undefined);
      }
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Impossible de sauvegarder. Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
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

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-8">
          Mon profil
        </h1>

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> Profil mis à jour avec succès.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-cream-2 p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-orange flex items-center justify-center text-white font-bold text-3xl shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-heading font-bold text-xl text-ink">{user?.name ?? '—'}</p>
                <p className="text-sm text-ink-muted">Membre Looga</p>
              </div>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:opacity-80 transition-opacity"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 border-t border-cream-2 pt-6">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
              )}
              <div>
                <label className="block text-xs text-ink-muted uppercase tracking-wide mb-1.5">Nom complet</label>
                <input
                  type="text"
                  className="w-full border border-cream-2 rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted uppercase tracking-wide mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  className="w-full border border-cream-2 rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  className="w-full border border-cream-2 rounded-xl px-4 py-3 text-sm text-ink-muted bg-gray-50 cursor-not-allowed"
                  value={user?.email ?? ''}
                  disabled
                />
                <p className="text-xs text-ink-muted mt-1">L'email ne peut pas être modifié.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(null); setForm({ name: user?.name ?? '', phone: user?.phone ?? '' }); }}
                  className="flex items-center gap-1.5 border border-cream-2 text-ink font-semibold py-3 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <X className="w-4 h-4" /> Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 border-t border-cream-2 pt-6">
              <Field icon={UserIcon} label="Nom complet" value={user?.name} />
              <Field icon={Mail} label="Email" value={user?.email} />
              <Field icon={Phone} label="Téléphone" value={user?.phone} />
            </div>
          )}
        </div>
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
