'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

export function ContactForm() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/support_messages`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          user_id: user?.id ?? null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Envoi impossible');
      }

      setSuccess(true);
      setForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError((err as Error).message ?? 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
          <Send className="w-5 h-5 text-green-700" />
        </div>
        <h3 className="font-heading font-bold text-ink text-lg mb-1">Message envoyé</h3>
        <p className="text-sm text-ink-muted mb-4">
          Merci ! Notre équipe revient vers toi sous 24 à 48 h.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-orange text-sm font-semibold hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-cream-2 space-y-4">
      <h2 className="font-heading font-bold text-ink text-xl mb-1">Écrivez-nous</h2>
      <p className="text-ink-muted text-sm mb-4">
        Remplissez ce formulaire — réponse sous 24 à 48 h ouvrées.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Nom complet</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
            placeholder="Diabaté Ismael"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
            placeholder="toi@exemple.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Sujet</label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          disabled={submitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
          placeholder="Une question sur un événement"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          disabled={submitting}
          rows={6}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange resize-none"
          placeholder="Décris ta demande en détail (max 2000 caractères)"
        />
        <p className="text-xs text-ink-muted mt-1">{form.message.length} / 2000</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? 'Envoi…' : (
          <>
            <Send className="w-4 h-4" /> Envoyer
          </>
        )}
      </button>
    </form>
  );
}
