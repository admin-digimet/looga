'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl"
          style={{ background: 'linear-gradient(135deg, #FF5C1A 0%, #6B3FA0 100%)' }}
        >
          ⚡
        </div>
        <h1 className="font-heading font-extrabold text-ink text-4xl md:text-5xl mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-ink-muted text-lg max-w-md mb-10">
          Quelque chose s&apos;est mal passé. Réessaie, ou retourne à l&apos;accueil.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-orange text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-gray-300 text-ink font-semibold py-4 px-8 rounded-full hover:bg-white transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
