'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRegister } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });
  const registerMutation = useRegister({ onSuccess: () => router.push(redirect ?? '/') });

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<any>;
    const status = axiosError?.response?.status;
    if (status === 422) {
      const errors = axiosError.response?.data?.errors;
      if (errors) return Object.values(errors).flat().join(' ');
      return axiosError.response?.data?.message ?? 'Données invalides.';
    }
    if (!axiosError?.response) return 'Impossible de se connecter. Vérifiez votre connexion internet.';
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      phone: form.phone || undefined,
    });
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="text-orange font-bold text-3xl tracking-tighter">
          looga
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-4 mb-2">Créer un compte</h1>
        <p className="text-gray-500 text-sm">Rejoignez Looga pour découvrir les meilleurs événements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Téléphone <span className="font-normal text-gray-400">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="+225 07 00 00 00 00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={update('password')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="••••••••"
          />
        </div>

        {registerMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {getErrorMessage(registerMutation.error)}
          </div>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-orange text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{' '}
        <Link
          href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'}
          className="text-orange font-semibold hover:underline"
        >
          Se connecter
        </Link>
      </p>

      <p className="text-center mt-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center px-4 py-12">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
