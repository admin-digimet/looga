'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin({ onSuccess: () => router.push(redirect ?? '/') });

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<any>;
    const status = axiosError?.response?.status;
    if (status === 401) return 'Email ou mot de passe incorrect.';
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
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="text-orange font-bold text-3xl tracking-tighter">
          looga
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-4 mb-2">Bienvenue</h1>
        <p className="text-gray-500 text-sm">Connectez-vous pour accéder à vos billets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Adresse email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
            placeholder="••••••••"
          />
        </div>

        {loginMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {getErrorMessage(loginMutation.error)}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-orange text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{' '}
        <Link
          href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : '/auth/register'}
          className="text-orange font-semibold hover:underline"
        >
          Créer un compte
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

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
