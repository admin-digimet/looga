import type { Metadata } from 'next';
import Link from 'next/link';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Règles de la communauté — Looga',
  description: 'Une communauté construite autour du respect et des bonnes expériences.',
};

export default function CommunautePage() {
  return (
    <DynamicInfoPage
      pageKey="communaute"
      fallbackTitle="Une communauté construite autour du respect"
      fallbackIntro="Looga rassemble des publics et des organisateurs autour d’événements de qualité. Ces règles garantissent une expérience saine, respectueuse et sécurisée pour tous."
      fallbackSections={[
        {
          heading: 'Ce que nous attendons',
          body: (
            <>
              <p className="mb-3">
                En utilisant Looga, chaque utilisateur et organisateur s’engage à contribuer à une expérience positive pour la communauté. Nous attendons :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>du respect dans tous les échanges, en ligne comme pendant les événements</li>
                <li>des informations exactes (nom, contact, identité)</li>
                <li>le respect des conditions de chaque événement (âge, dress code, accès, etc.)</li>
                <li>une utilisation honnête des billets et réservations</li>
                <li>un comportement responsable lors des événements</li>
              </ul>
              <p>Looga souhaite construire une communauté ouverte, moderne et respectueuse.</p>
            </>
          ),
        },
        {
          heading: 'Ce qui n’est pas accepté',
          body: (
            <>
              <p className="mb-3">
                Les comportements suivants sont strictement interdits sur la plateforme et lors des événements :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>discours haineux, racistes, sexistes ou discriminatoires</li>
                <li>harcèlement en ligne ou physique</li>
                <li>comportements agressifs ou menaçants</li>
                <li>fraude, falsification ou copie de billets</li>
                <li>revente frauduleuse de tickets</li>
                <li>faux événements ou informations trompeuses</li>
                <li>organisation d’événements dangereux ou illégaux</li>
              </ul>
              <p>Tout comportement pouvant nuire à la sécurité ou à l’expérience des utilisateurs peut entraîner des sanctions.</p>
            </>
          ),
        },
        {
          heading: 'Billets et réservations',
          body: (
            <>
              <p className="mb-3">
                Chaque billet généré sur Looga est personnel et sécurisé grâce à un QR Code unique. Toute tentative de :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>duplication</li>
                <li>falsification</li>
                <li>utilisation abusive</li>
                <li>revente non autorisée</li>
              </ul>
              <p>
                peut entraîner l’invalidation immédiate du billet ainsi que des sanctions sur le compte concerné.
              </p>
            </>
          ),
        },
        {
          heading: 'Modération et sécurité',
          body: (
            <>
              <p className="mb-3">Looga se réserve le droit de :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>suspendre un compte</li>
                <li>supprimer un événement</li>
                <li>limiter certaines fonctionnalités</li>
                <li>bloquer définitivement un utilisateur</li>
              </ul>
              <p>
                dans les cas de fraude, d’abus ou de non-respect des règles de la communauté. Notre objectif est de préserver une plateforme fiable et agréable pour tous.
              </p>
            </>
          ),
        },
        {
          heading: 'Signaler un problème',
          body: (
            <>
              <p className="mb-3">
                Si vous observez un comportement inapproprié, un problème lié à un événement ou une activité suspecte, contactez notre équipe.
              </p>
              <p className="mb-3">
                Email : <span className="font-medium text-ink">contact@looga-ci.com</span>
              </p>
              <p>
                Chaque signalement est analysé afin de protéger la sécurité et la qualité de l’expérience Looga.
              </p>
            </>
          ),
        },
        {
          heading: 'Construire une meilleure culture événementielle',
          body: (
            <>
              <p className="mb-4">
                Looga existe pour rapprocher les personnes autour de la musique, de la culture, des expériences et des moments partagés. Merci de contribuer à faire de la plateforme un espace plus positif, plus sûr et plus respectueux pour tous.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
                >
                  Voir les événements
                </Link>
                <Link
                  href="/mobile"
                  className="inline-block border border-gray-300 text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Télécharger l’application
                </Link>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
