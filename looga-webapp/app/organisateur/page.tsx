import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  QrCode,
  Wallet,
  Sparkles,
  Image as ImageIcon,
  Share2,
  Users,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DASHBOARD_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Espace organisateur — Looga',
  description:
    'Créez votre événement en quelques minutes, vendez vos billets, suivez vos réservations en temps réel. Looga met à votre disposition tous les outils pour gérer vos événements.',
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
      'Vos clients paient via MTN Mobile Money, Orange Money, Wave ou carte. Vous demandez un reversement quand vous voulez.',
  },
];

const inclus = [
  'QR Codes sécurisés',
  'Paiement mobile money',
  'Billetterie digitale',
  'Dashboard organisateur',
  'Suivi des ventes en temps réel',
  'Gestion des participants',
  'Support organisateur',
  'Accès à l’audience Looga',
];

const guides = [
  {
    icon: Sparkles,
    title: 'Créer un bon événement',
    items: [
      'Créer une page événement efficace',
      'Choisir les bons visuels',
      'Rédiger une description claire',
      'Définir ses types de tickets',
      'Organiser son accès et ses réservations',
    ],
  },
  {
    icon: Share2,
    title: 'Vendre plus de tickets',
    items: [
      'Promouvoir son événement sur les réseaux sociaux',
      'Créer de l’engagement avant l’événement',
      'Utiliser WhatsApp efficacement',
      'Comprendre son audience',
      'Optimiser les ventes de dernière minute',
    ],
  },
  {
    icon: Users,
    title: 'Maîtriser les outils Looga',
    items: [
      'Créer un événement sur Looga',
      'Gérer les participants',
      'Utiliser les QR Codes',
      'Suivre les ventes en temps réel',
      'Gérer les réservations et tables',
    ],
  },
];

const faq = [
  {
    q: 'Ai-je besoin d’un abonnement ?',
    a: 'Non. Looga fonctionne uniquement avec une commission sur les ventes, sans frais fixes.',
  },
  {
    q: 'Quel est le tarif Looga ?',
    a: 'La plateforme applique une commission de 8 % par billet vendu. Aucun frais caché.',
  },
  {
    q: 'Puis-je suivre mes ventes ?',
    a: 'Oui, en temps réel depuis votre espace organisateur.',
  },
  {
    q: 'Les paiements sont-ils sécurisés ?',
    a: 'Oui. Les paiements sont traités par GeniusPay, et chaque QR Code est unique et sécurisé.',
  },
  {
    q: 'Puis-je créer plusieurs types de tickets ?',
    a: 'Oui — Standard, VIP, Table, tarifs préférentiels… vous configurez ce que vous voulez.',
  },
  {
    q: 'Puis-je gérer des réservations de tables ?',
    a: 'Oui, Looga permet aussi de gérer les réservations de tables, expériences et événements privés.',
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
              Créez votre événement en quelques minutes.
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-10">
              Remplissez les informations essentielles et commencez à recevoir des réservations immédiatement.
              Looga vous donne les outils, vous gardez le contrôle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={DASHBOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-ink font-bold py-4 px-8 rounded-full hover:bg-cream-2 transition-colors"
              >
                Commencer
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold py-4 px-8 rounded-full hover:bg-white/10 transition-colors"
              >
                Besoin d’aide ?
              </Link>
            </div>
          </div>
        </section>

        {/* Comment ça marche — Créer un événement */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
          <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-2">
            Simple, rapide, efficace
          </h2>
          <p className="text-ink-muted text-lg mb-12 max-w-2xl">
            Créer un événement sur Looga ne prend que quelques minutes. Vous renseignez les informations essentielles et votre événement est immédiatement visible par les utilisateurs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '1',
                title: 'Ce dont vous avez besoin',
                items: ['Nom de l’événement', 'Description', 'Date et heure', 'Lieu', 'Prix (ou gratuit)', 'Nombre de places', 'Image'],
                icon: ImageIcon,
              },
              {
                step: '2',
                title: 'Publication immédiate',
                items: ['Visible par tous les utilisateurs Looga', 'Apparaît dans la recherche', 'Listé sur la home si pertinent'],
                icon: Sparkles,
              },
              {
                step: '3',
                title: 'Partage facile',
                items: ['Lien partageable', 'Diffusable sur WhatsApp', 'Diffusable sur Instagram', 'Adapté aux réseaux sociaux'],
                icon: Share2,
              },
              {
                step: '4',
                title: 'Suivi en temps réel',
                items: ['Liste des participants', 'Évolution des réservations', 'Statistiques détaillées', 'Depuis le dashboard'],
                icon: BarChart3,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.step} className="bg-white rounded-2xl p-6 border border-cream-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-orange font-heading font-extrabold text-3xl">{card.step}</span>
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-heading font-bold text-ink text-lg mb-3">{card.title}</h3>
                  <ul className="space-y-1.5 text-sm text-ink-muted">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Atouts (existant gardé) */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20">
          <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-2">
            Tout ce qu’il vous faut. Rien de plus.
          </h2>
          <p className="text-ink-muted text-lg mb-12">
            Conçu pour les organisateurs en Côte d’Ivoire.
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
                  <h3 className="font-heading font-bold text-ink text-xl mb-3">{atout.title}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{atout.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TARIFS */}
        <section id="tarifs" className="bg-white py-20 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-orange/10 text-orange text-xs font-bold tracking-wider mb-4">
                  TARIFS
                </span>
                <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-4">
                  Une commission claire et transparente
                </h2>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-heading font-extrabold text-orange text-6xl">8 %</span>
                  <span className="text-ink-muted text-lg">par billet vendu</span>
                </div>
                <ul className="space-y-2.5 text-ink-muted mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <span>Aucun abonnement obligatoire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <span>Aucun frais caché</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <span>Vous ne payez que lorsque vous vendez</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <span>Reversement à la demande</span>
                  </li>
                </ul>
                <Link
                  href={DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange text-white font-bold py-3.5 px-7 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Créer un événement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="bg-cream rounded-2xl p-8 border border-cream-2">
                <h3 className="font-heading font-bold text-ink text-xl mb-5">
                  Tout est inclus dans la commission
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inclus.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-ink">
                      <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <p className="text-ink-muted text-xs mt-6">
                  Plus qu’une simple billetterie : Looga permet aussi de gérer les réservations de tables, expériences et événements privés.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDES */}
        <section id="guides" className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 scroll-mt-20">
          <span className="inline-block px-3 py-1 rounded-full bg-orange/10 text-orange text-xs font-bold tracking-wider mb-4">
            GUIDES ORGANISATEURS
          </span>
          <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-2">
            Tout ce qu’il faut pour réussir vos événements
          </h2>
          <p className="text-ink-muted text-lg mb-12 max-w-2xl">
            Organiser un événement demande plus que publier une affiche. Looga met à disposition des conseils pratiques pour aider les organisateurs à mieux gérer leurs événements, améliorer l’expérience des participants et augmenter leurs ventes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div key={guide.title} className="bg-white rounded-2xl p-6 border border-cream-2">
                  <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-heading font-bold text-ink text-lg mb-3">{guide.title}</h3>
                  <ul className="space-y-1.5 text-sm text-ink-muted">
                    {guide.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-ink/95 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-8 h-8 text-orange shrink-0" />
              <div className="flex-1">
                <h3 className="font-heading font-bold text-xl mb-2">Une équipe disponible pour vous aider</h3>
                <p className="text-white/70 text-sm mb-4">
                  Besoin d’aide pour la mise en ligne de votre événement, la stratégie de visibilité, la gestion des réservations ou des questions techniques ? L’équipe Looga vous accompagne.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-orange text-white font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Contacter l’équipe
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-20">
          <div className="max-w-[900px] mx-auto px-4 md:px-8">
            <h2 className="font-heading font-extrabold text-ink text-3xl md:text-4xl mb-10 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group bg-cream rounded-xl border border-cream-2 overflow-hidden"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-center justify-between font-heading font-bold text-ink hover:bg-cream-2 transition-colors">
                    <span>{item.q}</span>
                    <span className="text-orange text-2xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-ink-muted text-sm">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24 pt-20">
          <div className="rounded-3xl bg-ink text-white p-10 md:p-16 text-center">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Prêt à organiser votre prochain événement ?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Que vous organisiez une soirée, un concert, une expérience ou un événement culturel, Looga vous aide à offrir une meilleure expérience à votre audience.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={DASHBOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
              >
                Créer un événement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold py-4 px-8 rounded-full hover:bg-white/10 transition-colors"
              >
                Parler avec l’équipe
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
