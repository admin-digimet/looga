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
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Application mobile bientôt disponible — Looga',
  description:
    'L’application Looga arrive bientôt sur iOS et Android. En attendant, découvre les événements à Abidjan directement sur le web.',
};

const features = [
  {
    icon: Search,
    title: 'Découvre ce qui se passe à Abidjan',
    body: 'Concerts, soirées, festivals et expériences : retrouve plus facilement les sorties qui te correspondent.',
  },
  {
    icon: Zap,
    title: 'Des sorties plus simples à organiser',
    body: 'L’application est pensée pour faciliter la découverte des événements et les réservations depuis ton téléphone.',
  },
  {
    icon: Users,
    title: 'Partage les bons plans avec tes amis',
    body: 'Repère les événements qui te plaisent et partage tes idées de sorties avec tes proches.',
  },
  {
    icon: Ticket,
    title: 'Tes billets au même endroit',
    body: 'Nous préparons une expérience qui te permettra de retrouver facilement tes billets et tes réservations.',
  },
  {
    icon: MapPin,
    title: 'Imaginée pour Abidjan',
    body: 'Une expérience adaptée aux habitudes de sortie locales, pour découvrir et profiter pleinement de la ville.',
  },
];

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-[#14091e] font-sans text-white">
      <PublicHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 7% 23%, rgba(255,111,36,0.23) 0%, transparent 43%), linear-gradient(115deg, #32172d 0%, #21112c 52%, #14091e 100%)',
            }}
          />
          <div className="relative mx-auto max-w-[1150px] px-5 py-20 sm:px-8 md:py-28 lg:py-32">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff792b]/35 bg-[#ff792b]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#ffae76]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Bientôt disponible
            </div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
              Application mobile Looga
            </p>
            <h1 className="mb-7 max-w-4xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Looga arrive dans ta poche.
            </h1>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl">
              Tes événements préférés, tes sorties et tes meilleurs moments.
              Bientôt, retrouve l’expérience Looga sur iOS et Android.
            </p>

            <div className="mb-10 grid max-w-md grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm">
                <Apple className="h-7 w-7 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-bold">iOS</p>
                  <p className="text-sm text-white/60">À venir</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm">
                <Smartphone className="h-7 w-7 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-bold">Android</p>
                  <p className="text-sm text-white/60">À venir</p>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff781f] px-7 py-3 font-bold text-white transition-colors hover:bg-[#ff8d40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Découvrir les événements
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <p className="mt-4 text-sm text-white/60">
              En attendant l’application, profite de Looga directement sur le web.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ff8d40]">
              Ce qu’on prépare
            </p>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Une nouvelle façon de vivre tes sorties.
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Voici un aperçu des fonctionnalités envisagées pour l’application mobile.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-[#24152f] p-6 sm:p-7"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff781f]/15">
                    <Icon className="h-6 w-6 text-[#ff8d40]" aria-hidden="true" />
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-white/70">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 md:pb-28">
          <div className="mx-auto max-w-[1100px] rounded-3xl border border-white/10 bg-[#24152f] px-6 py-12 text-center sm:px-10 md:py-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ff8d40]">
              Disponible dès maintenant
            </p>
            <h2 className="mb-4 font-heading text-3xl font-extrabold sm:text-4xl">
              Looga est déjà sur le web.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-white/70">
              Pas besoin d’attendre pour découvrir les événements à Abidjan.
              Retrouve Looga depuis ton navigateur, sur téléphone ou ordinateur.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff781f] px-7 py-3 font-bold text-white transition-colors hover:bg-[#ff8d40]"
              >
                Voir les événements
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
