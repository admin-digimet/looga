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
    <div className="w-full max-w-[440px] rounded-[28px] border border-[#3D294B] bg-[#24152F]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-9">
      <div className="text-center mb-9">
        <Link href="/" className="inline-block text-[#FF701F] font-black text-4xl tracking-[-0.075em]">
          looga
        </Link>
        <h1 className="text-[28px] font-extrabold text-white mt-6 mb-2 tracking-tight">Content de te revoir.</h1>
        <p className="text-[#BFAFCB] text-sm leading-6">Connecte-toi pour retrouver tes billets et tes favoris.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#F5EFF8] mb-2">
            Adresse email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#533D61] bg-[#311F3D] text-white placeholder:text-[#A798B2] rounded-xl px-4 py-3.5 text-base outline-none focus:border-[#FF701F] focus:ring-2 focus:ring-[#FF701F]/25 transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#F5EFF8] mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#533D61] bg-[#311F3D] text-white placeholder:text-[#A798B2] rounded-xl px-4 py-3.5 text-base outline-none focus:border-[#FF701F] focus:ring-2 focus:ring-[#FF701F]/25 transition"
            placeholder="••••••••"
          />
        </div>

        {loginMutation.isError && (
          <div className="bg-[#4C202B] border border-[#B55C68] text-[#FFE1E4] text-sm rounded-xl px-4 py-3">
            {getErrorMessage(loginMutation.error)}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-[#FF701F] text-[#1A0D20] font-bold py-4 rounded-xl hover:bg-[#FF873D] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="text-center text-sm text-[#BFAFCB] mt-7">
        Pas encore de compte ?{' '}
        <Link
          href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : '/auth/register'}
          className="text-[#FF8B48] font-semibold hover:underline"
        >
          Créer un compte
        </Link>
      </p>

      <p className="text-center mt-5">
        <Link href="/" className="text-sm text-[#AFA1BC] hover:text-white transition">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#13091E] text-white font-sans flex items-center justify-center px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
