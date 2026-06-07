import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Zap,
  Users,
  Ticket,
  MapPin,
  Smartphone,
  Apple,
  Play,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Application mobile — Looga',
  description:
    'Découvrez les meilleurs événements, réservez en quelques secondes et partagez vos sorties avec l’application Looga.',
};

const features = [
  {
    icon: Search,
    title: 'Découvrez ce qui se passe à Abidjan',
    body: 'Concerts, soirées, festivals, expériences, événements lifestyle ou culturels. Looga vous permet de découvrir facilement tout ce qui se passe autour de vous, sur une seule application. Fini les événements dispersés entre Instagram, WhatsApp et le bouche-à-oreille.',
  },
  {
    icon: Zap,
    title: 'Une expérience pensée pour sortir facilement',
    body: 'Avec Looga, réserver une sortie devient simple. En quelques secondes, vous découvrez un événement, choisissez votre ticket, payez rapidement et recevez votre QR Code instantanément — directement depuis votre téléphone.',
  },
  {
    icon: Users,
    title: 'Les meilleures sorties se vivent ensemble',
    body: 'Invitez vos amis, partagez des événements et organisez vos sorties plus facilement. Looga est pensé pour rendre les expériences sociales plus simples et plus spontanées.',
  },
  {
    icon: Ticket,
    title: 'Vos tickets au même endroit',
    body: 'Tous vos tickets et réservations sont accessibles directement dans l’application. Plus besoin de rechercher des captures d’écran ou des messages perdus — vos QR Codes restent disponibles à tout moment.',
  },
  {
    icon: MapPin,
    title: 'Pensé pour Abidjan',
    body: 'Paiement mobile money, nightlife, événements culturels, réservations, expériences. Looga est construit pour la manière dont les gens découvrent et vivent réellement les sorties à Abidjan. Notre objectif : simplifier la découverte et rendre la culture plus accessible.',
  },
];

export default function MobilePage() {
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
              APPLICATION MOBILE
            </span>
            <h1 className="font-heading font-extrabold text-white text-4xl md:text-6xl tracking-tight leading-[1.05] max-w-3xl mb-6">
              Toute la ville dans votre poche.
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-10">
              Découvrez les meilleurs événements, réservez en quelques secondes et partagez vos sorties avec vos amis grâce à l’application Looga.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex items-center gap-2 bg-white/30 text-white font-bold py-4 px-8 rounded-full cursor-not-allowed"
              >
                <Smartphone className="w-5 h-5" />
                Télécharger (bientôt)
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold py-4 px-8 rounded-full hover:bg-white/10 transition-colors"
              >
                Découvrir les événements
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-20">
          <div className="space-y-12">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const reverse = idx % 2 === 1;
              return (
                <div
                  key={feature.title}
                  className={`grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 items-start ${reverse ? '' : ''}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-cream-2 flex items-center justify-center shadow-sm">
                    <Icon className="w-7 h-7 text-orange" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-ink text-2xl md:text-3xl mb-3">
                      {feature.title}
                    </h2>
                    <p className="text-ink-muted text-base leading-relaxed max-w-2xl">
                      {feature.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bientôt disponible */}
        <section className="bg-white py-20">
          <div className="max-w-[900px] mx-auto px-4 md:px-8 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-orange/10 text-orange text-xs font-bold tracking-wider mb-4">
              DISPONIBLE BIENTÔT
            </span>
            <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-4">
              L’expérience Looga arrive bientôt
            </h2>
            <p className="text-ink-muted text-lg mb-10 max-w-xl mx-auto">
              Téléchargez bientôt l’application Looga et commencez à découvrir une nouvelle façon de sortir à Abidjan.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex items-center gap-3 bg-ink text-white font-semibold py-4 px-7 rounded-2xl opacity-60 cursor-not-allowed"
              >
                <Apple className="w-7 h-7" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-80">Bientôt sur</div>
                  <div className="text-base">App Store</div>
                </div>
              </button>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex items-center gap-3 bg-ink text-white font-semibold py-4 px-7 rounded-2xl opacity-60 cursor-not-allowed"
              >
                <Play className="w-7 h-7" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-80">Bientôt sur</div>
                  <div className="text-base">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
          <div className="rounded-3xl bg-ink text-white p-10 md:p-16 text-center">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Prêt à découvrir votre prochaine sortie ?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez la communauté Looga et découvrez les meilleurs événements autour de vous.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-orange text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
              >
                Voir les événements
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
