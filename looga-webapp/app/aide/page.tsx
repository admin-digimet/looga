import type { Metadata } from 'next';
import Link from 'next/link';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Centre d’aide — Looga',
  description: 'Réponses aux questions fréquentes sur l’utilisation de Looga, pour les utilisateurs et les organisateurs.',
};

export default function AidePage() {
  return (
    <DynamicInfoPage
      pageKey="aide"
      fallbackTitle="Centre d’aide Looga"
      fallbackIntro="Trouve rapidement des réponses à tes questions et apprends à utiliser Looga facilement."
      fallbackSections={[
        {
          heading: 'Comment pouvons-nous t’aider ?',
          body: (
            <p>
              Que tu sois utilisateur ou organisateur, cette page regroupe les réponses aux questions les plus fréquentes sur l’utilisation de Looga.
            </p>
          ),
        },
        {
          heading: 'Utilisateurs',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Comment trouver un événement ?</li>
              <li>Comment réserver un ticket ?</li>
              <li>Comment recevoir mon billet ?</li>
              <li>Que faire en cas de problème de réservation ?</li>
            </ul>
          ),
        },
        {
          heading: 'Organisateurs',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Comment créer un événement ?</li>
              <li>Comment modifier un événement ?</li>
              <li>Comment voir mes réservations ?</li>
              <li>Comment recevoir les informations des participants ?</li>
            </ul>
          ),
        },
        {
          heading: 'Application mobile',
          body: (
            <>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Comment télécharger l’application ?</li>
                <li>Comment se connecter ?</li>
                <li>Problèmes de connexion</li>
              </ul>
              <p>
                Plus d’infos sur l’app mobile :{' '}
                <Link href="/mobile" className="text-orange font-medium hover:underline">découvrir Looga mobile</Link>.
              </p>
            </>
          ),
        },
        {
          heading: 'Réservations & paiements',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Comment fonctionne la réservation ?</li>
              <li>Est-ce sécurisé ?</li>
              <li>Peut-on annuler une réservation ?</li>
            </ul>
          ),
        },
        {
          heading: 'Besoin d’aide personnalisée ?',
          body: (
            <>
              <p className="mb-4">
                Si tu ne trouves pas ta réponse ici, notre équipe est disponible pour t’aider directement. Nous faisons de notre mieux pour répondre rapidement afin que tu puisses profiter de Looga sans interruption.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
                >
                  Contacter le support
                </Link>
                <Link
                  href="/"
                  className="inline-block border border-gray-300 text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Voir les événements
                </Link>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
