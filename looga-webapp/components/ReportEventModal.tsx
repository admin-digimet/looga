'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

interface ReportEventModalProps {
  eventId: string;
  eventTitle: string;
  open: boolean;
  onClose: () => void;
}

const REASONS = [
  { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'faux_event', label: "Faux événement ou trompeur" },
  { value: 'arnaque', label: 'Arnaque ou fraude' },
  { value: 'doublon', label: 'Doublon d\'un autre événement' },
  { value: 'autre', label: 'Autre' },
];

export function ReportEventModal({ eventId, eventTitle, open, onClose }: ReportEventModalProps) {
  const { user, isAuthenticated, getFreshToken } = useAuthStore();
  const [reason, setReason] = useState(REASONS[0].value);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      const token = await getFreshToken();
      const reasonLabel = REASONS.find((r) => r.value === reason)?.label ?? reason;
      const finalReason = description.trim()
        ? `${reasonLabel} — ${description.trim()}`
        : reasonLabel;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          reporter_id: user.id,
          target_type: 'event',
          target_id: eventId,
          reason: finalReason,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Erreur lors de l\'envoi du signalement');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDescription('');
        setReason(REASONS[0].value);
      }, 1800);
    } catch (err) {
      setError((err as Error).message ?? 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-ink mb-1">Signaler cet événement</h3>
            <p className="text-sm text-ink-muted line-clamp-2">{eventTitle}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-orange/5 border border-orange/20 rounded-lg p-4 text-sm">
            <p className="text-ink mb-3">
              Tu dois être connecté pour signaler un événement.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-orange text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Se connecter
            </Link>
          </div>
        ) : success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            ✓ Signalement envoyé. Merci, notre équipe va l&apos;examiner.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Motif du signalement
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                disabled={submitting}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Détails <span className="text-ink-muted font-normal">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Décris ce qui pose problème (max 500 caractères)"
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange resize-none"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? 'Envoi…' : 'Signaler'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
