'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';

type FormField = 'name' | 'email' | 'phone' | 'password' | 'password_confirmation';

const inputClass =
  'w-full rounded-2xl border border-[#51415e] bg-[#241a2e] px-4 py-3.5 text-sm text-white placeholder:text-[#998ca6] outline-none transition focus:border-[#ff791f] focus:ring-1 focus:ring-[#ff791f]';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });

  const registerMutation = useRegister({ onSuccess: () => router.push(redirect ?? '/') });

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
    const status = axiosError?.response?.status;
    if (status === 422) {
      const errors = axiosError.response?.data?.errors;
      if (errors) return Object.values(errors).flat().join(' ');
      return axiosError.response?.data?.message ?? 'Données invalides.';
    }
    if (!axiosError?.response) return 'Impossible de se connecter. Vérifiez votre connexion internet.';
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  const update = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('');
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    if (form.password !== form.password_confirmation) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }
    registerMutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      phone: form.phone || undefined,
    });
  };

  return (
    <div className="w-full max-w-[570px] rounded-[26px] border border-white/10 bg-[#190f22] p-5 shadow-[0_25px_90px_rgba(0,0,0,0.3)] sm:p-8">
      <div className="mb-7 text-center">
        <Link href="/" className="inline-block text-[29px] font-extrabold tracking-[-1.5px] text-[#ff791f]">
          looga.
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#f8f5fa] sm:text-[30px]">
          Bienvenue à Babi.
        </h1>
        <p className="mt-2 text-sm text-[#c3b9cc]">Crée ton compte. La ville n&apos;attend que toi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[22px] bg-[#25192f] p-4 sm:p-5">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-[#f0eaf3]">Nom complet</label>
          <input id="register-name" autoComplete="name" type="text" required value={form.name} onChange={update('name')} className={inputClass} placeholder="Ton nom et prénom" />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-[#f0eaf3]">Adresse e-mail</label>
          <input id="register-email" autoComplete="email" type="email" required value={form.email} onChange={update('email')} className={inputClass} placeholder="exemple@email.com" />
        </div>

        <div>
          <label htmlFor="register-phone" className="mb-2 block text-sm font-semibold text-[#f0eaf3]">
            Téléphone <span className="font-normal text-[#a99db5]">(optionnel)</span>
          </label>
          <input id="register-phone" autoComplete="tel" type="tel" value={form.phone} onChange={update('phone')} className={inputClass} placeholder="+225 07 00 00 00 00" />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-[#f0eaf3]">Mot de passe</label>
          <div className="relative">
            <input id="register-password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={update('password')} className={`${inputClass} pr-12`} placeholder="8 caractères minimum" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute inset-y-0 right-3 flex items-center text-[#b6a9c1] transition hover:text-white">
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="register-confirmation" className="mb-2 block text-sm font-semibold text-[#f0eaf3]">Confirmer le mot de passe</label>
          <div className="relative">
            <input id="register-confirmation" autoComplete="new-password" type={showConfirmation ? 'text' : 'password'} required minLength={8} value={form.password_confirmation} onChange={update('password_confirmation')} className={`${inputClass} pr-12`} placeholder="Confirme ton mot de passe" />
            <button type="button" onClick={() => setShowConfirmation((v) => !v)} aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'} className="absolute inset-y-0 right-3 flex items-center text-[#b6a9c1] transition hover:text-white">
              {showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {(validationError || registerMutation.isError) && (
          <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {validationError || getErrorMessage(registerMutation.error)}
          </div>
        )}

        <button type="submit" disabled={registerMutation.isPending} className="w-full rounded-2xl bg-[#ff631c] px-4 py-4 text-base font-bold text-white transition hover:bg-[#ff791f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f] disabled:cursor-not-allowed disabled:opacity-60">
          {registerMutation.isPending ? 'Création du compte…' : 'Créer mon compte'}
        </button>
        <p className="text-center text-sm text-[#c3b9cc]">
          Déjà dans la famille ?{' '}
          <Link href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'} className="font-semibold text-[#ff791f] hover:underline">Se connecter</Link>
        </p>
      </form>

      <p className="mt-5 text-center">
        <Link href="/" className="text-sm text-[#a99db5] transition hover:text-white">← Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#392047_0%,#1c1126_45%,#120c1a_100%)] px-4 py-10 font-sans sm:py-14">
      <Suspense fallback={<div className="text-sm text-white/70">Chargement…</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
