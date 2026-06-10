'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User as UserIcon, Pencil, X, Check, Camera } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { apiClient } from '@/lib/api/client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, login, token, refreshToken, getFreshToken } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', phone: user.phone ?? '' });
  }, [user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);

    try {
      // Rafraîchir le token une seule fois pour toute la sauvegarde
      const freshToken = await getFreshToken();
      if (!freshToken) {
        setError('Session expirée. Déconnecte-toi et reconnecte-toi.');
        setSaving(false);
        return;
      }

      let avatarUrl = user.avatar_url ?? null;

      if (avatarFile) {
        const imageCompression = (await import('browser-image-compression')).default;
        const compressed = await imageCompression(avatarFile, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 400,
          useWebWorker: true,
          fileType: 'image/webp',
        });
        const buffer = await compressed.arrayBuffer();
        const uploadRes = await fetch('/api/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${freshToken}`,
            'Content-Type': 'image/webp',
            'x-user-id': user.id,
          },
          body: buffer,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error ?? 'Upload échoué');
        }
        const { url } = await uploadRes.json();
        avatarUrl = url;
      }

      await axios.patch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
        { name: form.name, phone: form.phone, avatar_url: avatarUrl },
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${freshToken}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        }
      );

      await login(freshToken, { ...user, name: form.name, phone: form.phone, avatar_url: avatarUrl }, refreshToken ?? undefined);
      setSuccess(true);
      setEditing(false);
      setAvatarFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Impossible de sauvegarder. Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm({ name: user?.name ?? '', phone: user?.phone ?? '' });
    if (fileRef.current) fileRef.current.value = '';
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
  const displayAvatar = avatarPreview ?? user?.avatar_url ?? null;

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
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-orange flex items-center justify-center shrink-0">
                  {displayAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-3xl">{initial}</span>
                  )}
                </div>
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-orange border-2 border-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
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
                <p className="text-xs text-ink-muted mt-1">L&apos;email ne peut pas être modifié.</p>
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
                  onClick={cancelEdit}
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
