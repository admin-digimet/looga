import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, QrCode, Wallet } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DASHBOARD_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Devenir organisateur — Looga',
  description:
    'Vendez vos billets en ligne, scannez à l’entrée, suivez vos revenus en temps réel. Looga met à votre disposition tous les outils pour gérer vos événements.',
};

const atouts = [
  {
    icon: BarChart3,
    title: 'Tableau de bord temps réel',
    description:
      'Suivez vos ventes, votre taux de remplissage et vos revenus minute par minute depuis un dashboard dédié.',
  },
  {
    icon: QrCode,
    title: 'Contrôle d’accès QR',
    description:
      'Application scanner pour votre staff. Validation instantanée des billets, mode hors-ligne inclus.',
  },
  {
    icon: Wallet,
    title: 'Paiements locaux + reversement',
    description:
      'Vos clients paient via MTN, Orange Money, Wave ou carte. Vous demandez un reversement quand vous voulez.',
  },
];

export default function OrganisateurPage() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-95"
            style={{ background: 'linear-gradient(135deg, #FF5C1A 0%, #6B3FA0 100%)' }}
          />
          <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-20 md:py-28">
            <span className="inline-block px-4 py-1 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wider mb-6">
              ESPACE ORGANISATEUR
            </span>
            <h1 className="font-heading font-extrabold text-white text-4xl md:text-6xl tracking-tight leading-[1.05] max-w-3xl mb-6">
              Vos événements méritent une plateforme à la hauteur.
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-10">
              Vendez vos billets, scannez vos invités, suivez vos revenus.
              Looga vous donne les outils, vous gardez le contrôle.
            </p>
            <Link
              href={DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-ink font-bold py-4 px-8 rounded-full hover:bg-cream-2 transition-colors"
            >
              Accéder au tableau de bord
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Atouts */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
          <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-2">
            Tout ce qu’il vous faut. Rien de plus.
          </h2>
          <p className="text-ink-muted text-lg mb-12">
            Conçu pour les organisateurs en Afrique de l’Ouest.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {atouts.map((atout) => {
              const Icon = atout.icon;
              return (
                <div
                  key={atout.title}
                  className="bg-white rounded-2xl p-8 border border-cream-2 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-orange" />
                  </div>
                  <h3 className="font-heading font-bold text-ink text-xl mb-3">
                    {atout.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    {atout.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA bottom */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
          <div className="rounded-3xl bg-ink text-white p-10 md:p-16 text-center">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Prêt·e à publier votre prochain événement&nbsp;?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Créez votre compte organisateur en quelques minutes et lancez votre première vente.
            </p>
            <Link
              href={DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
            >
              Ouvrir le tableau de bord
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
