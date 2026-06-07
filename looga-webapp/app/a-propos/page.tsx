import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'À propos — Looga',
  description: 'Découvre, réserve et partage les meilleurs événements à Abidjan avec Looga.',
};

export default function AProposPage() {
  return (
    <DynamicInfoPage
      pageKey="a-propos"
      fallbackTitle="Découvre ce qui se passe autour de toi"
      fallbackIntro="Looga est la plateforme qui te permet de découvrir, réserver et partager les meilleurs événements à Abidjan, en quelques secondes."
      fallbackSections={[
        {
          heading: 'Une nouvelle façon de sortir à Abidjan',
          body: (
            <>
              <p className="mb-3">
                Trouver une bonne sortie ne devrait pas être compliqué. Entre les événements dispersés, les informations difficiles à trouver et les réservations peu pratiques, sortir demande souvent plus d’effort que nécessaire.
              </p>
              <p className="mb-3">
                <span className="font-medium text-ink">Looga simplifie tout.</span>
              </p>
              <p>
                Sur une seule plateforme, tu peux découvrir les événements autour de toi, réserver rapidement et partager avec tes amis.
              </p>
            </>
          ),
        },
        {
          heading: 'Notre vision : créer plus de moments à vivre',
          body: (
            <>
              <p className="mb-3">
                Looga ne se limite pas aux soirées. Notre objectif est de rassembler toutes les expériences qui permettent de passer un bon moment : concerts, festivals, sorties entre amis, activités et événements culturels.
              </p>
              <p>
                Nous voulons rendre la découverte simple, spontanée et accessible à tous.
              </p>
            </>
          ),
        },
        {
          heading: 'Comment ça marche',
          body: (
            <>
              <p className="mb-3">Simple, rapide, efficace :</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Découvre les événements autour de toi</li>
                <li>Choisis celui qui te correspond</li>
                <li>Réserve en quelques secondes</li>
                <li>Invite tes amis et profite</li>
              </ol>
            </>
          ),
        },
        {
          heading: 'Pour les organisateurs',
          body: (
            <>
              <p className="mb-3">
                Looga aide les organisateurs à gagner en visibilité et à gérer leurs réservations simplement.
              </p>
              <p>
                Crée ton événement, partage-le facilement et accède aux informations de tes participants en temps réel — directement depuis ton <a href="/organisateur" className="text-orange font-medium hover:underline">espace organisateur</a>.
              </p>
            </>
          ),
        },
        {
          heading: 'Prêt à sortir ?',
          body: (
            <>
              <p className="mb-4">
                Découvre les événements autour de toi dès maintenant et ne rate plus rien.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/"
                  className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
                >
                  Voir les événements
                </a>
                <a
                  href="/mobile"
                  className="inline-block border border-gray-300 text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Télécharger l’application
                </a>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
