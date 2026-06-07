import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable — Looga',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-4xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FF5C1A 0%, #6B3FA0 100%)' }}
        >
          404
        </div>
        <h1 className="font-heading font-extrabold text-ink text-4xl md:text-5xl mb-4">
          Page introuvable
        </h1>
        <p className="text-ink-muted text-lg max-w-md mb-10">
          La page que tu cherches n&apos;existe pas ou a été déplacée. Retourne sur la page d&apos;accueil pour découvrir les événements.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
          >
            Voir les événements
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-gray-300 text-ink font-semibold py-4 px-8 rounded-full hover:bg-white transition-colors"
          >
            Contacter le support
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
