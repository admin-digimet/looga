'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';

function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.includes('\\') || /[\u0000-\u001F\u007F]/.test(value)) return '/';
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\') || /[\u0000-\u001F\u007F]/.test(decoded)) {
      return '/';
    }
  } catch {
    return '/';
  }
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin({ onSuccess: () => router.push(redirect) });

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
          <label htmlFor="login-email" className="block text-sm font-semibold text-[#F5EFF8] mb-2">
            Adresse email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#533D61] bg-[#311F3D] text-white placeholder:text-[#A798B2] rounded-xl px-4 py-3.5 text-base outline-none focus:border-[#FF701F] focus:ring-2 focus:ring-[#FF701F]/25 transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold text-[#F5EFF8] mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#533D61] bg-[#311F3D] text-white placeholder:text-[#A798B2] rounded-xl px-4 py-3.5 pr-12 text-base outline-none focus:border-[#FF701F] focus:ring-2 focus:ring-[#FF701F]/25 transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#BFAFCB] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF701F]"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c7 0 10 7 10 7a14 14 0 0 1-3.1 4.1" />
                  <path d="M6.3 6.3A14.1 14.1 0 0 0 2 12s3 7 10 7a10.7 10.7 0 0 0 4.4-.9" />
                  <path d="m3 3 18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
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
          href={redirect !== '/' ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : '/auth/register'}
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
