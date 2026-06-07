import type { Metadata } from 'next';
import Link from 'next/link';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Sécurité — Looga',
  description: 'Comment Looga protège vos paiements, vos données et l’accès à vos événements.',
};

export default function SecuritePage() {
  return (
    <DynamicInfoPage
      pageKey="securite"
      fallbackTitle="Vos paiements et vos données sont notre priorité"
      fallbackIntro="Looga met en place des outils de sécurité pour protéger les utilisateurs, les organisateurs et l’expérience des événements."
      fallbackSections={[
        {
          heading: 'Des paiements fiables et protégés',
          body: (
            <>
              <p className="mb-3">
                Tous les paiements réalisés sur Looga sont traités par des partenaires certifiés et sécurisés, notamment <span className="font-medium text-ink">GeniusPay</span>.
              </p>
              <p className="font-semibold text-ink mb-2">Moyens de paiement pris en charge :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-4">
                <li>MTN Mobile Money</li>
                <li>Orange Money</li>
                <li>Wave</li>
                <li>Cartes bancaires</li>
              </ul>
              <p className="font-semibold text-ink mb-2">Looga ne stocke jamais :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>vos informations bancaires</li>
                <li>vos codes PIN</li>
                <li>vos informations sensibles de paiement</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Protection des comptes',
          body: (
            <>
              <p className="mb-3">
                Les comptes utilisateurs sont protégés grâce à des systèmes de chiffrement et de sécurité adaptés aux standards modernes.
              </p>
              <p className="mb-2">Nous recommandons également :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>d’utiliser un mot de passe unique</li>
                <li>de choisir un mot de passe complexe</li>
                <li>de ne jamais partager vos informations de connexion</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Billets sécurisés et QR Codes uniques',
          body: (
            <>
              <p className="mb-3">
                Chaque billet généré sur Looga possède un QR Code unique. Le QR Code :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>ne peut être validé qu’une seule fois</li>
                <li>permet de limiter les faux billets</li>
                <li>réduit les risques de fraude et de doublons</li>
              </ul>
              <p>Toute revente non autorisée peut entraîner l’invalidation automatique du billet.</p>
            </>
          ),
        },
        {
          heading: 'Lutte contre la fraude',
          body: (
            <>
              <p className="mb-3">
                Looga met en place différents outils afin d’améliorer la sécurité des événements et des transactions :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>validation des billets en temps réel</li>
                <li>contrôle des accès</li>
                <li>suivi des réservations</li>
                <li>surveillance des comportements suspects</li>
              </ul>
              <p>
                Notre objectif est de proposer une expérience plus fiable pour les organisateurs comme pour les participants.
              </p>
            </>
          ),
        },
        {
          heading: 'Signaler un incident',
          body: (
            <>
              <p className="mb-3">
                Si vous suspectez une activité frauduleuse sur votre compte, un paiement ou un événement, contactez immédiatement notre équipe.
              </p>
              <p className="mb-3">
                Email : <span className="font-medium text-ink">contact@looga-ci.com</span>
              </p>
              <p>
                Notre équipe analysera rapidement la situation afin de sécuriser votre compte et votre expérience.
              </p>
            </>
          ),
        },
        {
          heading: 'Une expérience plus sûre pour tous',
          body: (
            <>
              <p className="mb-4">
                Looga travaille à rendre les événements plus modernes, plus fluides et plus sécurisés pour toute la communauté.
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
