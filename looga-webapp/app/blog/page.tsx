import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Blog — Looga',
  description: 'Conseils pour organisateurs, coulisses produit et actualités événementielles en Afrique de l’Ouest.',
};

export default function BlogPage() {
  return (
    <InfoPage
      title="Le blog Looga"
      intro="Conseils pour organisateurs, coulisses produit et actualités de la scène événementielle ouest-africaine."
    >
      <div className="bg-white rounded-2xl p-8 md:p-12 border border-cream-2 text-center">
        <p className="text-ink-muted text-sm md:text-base mb-2">
          Nos premiers articles arrivent très bientôt.
        </p>
        <p className="text-ink-muted text-sm md:text-base mb-6">
          En attendant, jetez un œil aux événements qui se passent près de chez vous.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange text-white text-sm font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity"
        >
          Voir les événements
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </InfoPage>
  );
}
