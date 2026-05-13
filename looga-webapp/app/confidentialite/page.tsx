import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Looga',
  description: 'Comment Looga collecte, utilise et protège vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <InfoPage
      title="Politique de confidentialité"
      intro="Nous prenons la protection de vos données personnelles au sérieux."
      sections={[
        {
          heading: 'Données collectées',
          body: (
            <p>
              Nous collectons les informations que vous nous fournissez lors de la
              création de compte (nom, email, téléphone) et lors de l’achat de
              billets (informations de transaction).
            </p>
          ),
        },
        {
          heading: 'Utilisation',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Gérer votre compte et vos billets</li>
              <li>Traiter vos paiements de manière sécurisée</li>
              <li>Vous envoyer des informations relatives à vos événements</li>
              <li>Améliorer notre service</li>
            </ul>
          ),
        },
        {
          heading: 'Partage avec des tiers',
          body: (
            <p>
              Nous partageons certaines données strictement nécessaires avec les
              organisateurs des événements pour lesquels vous achetez des billets,
              ainsi qu’avec nos prestataires de paiement. Aucune donnée n’est
              vendue à des tiers à des fins commerciales.
            </p>
          ),
        },
        {
          heading: 'Vos droits',
          body: (
            <p>
              Vous disposez d’un droit d’accès, de rectification et de suppression
              de vos données. Pour exercer ces droits, écrivez-nous à
              <span className="font-medium text-ink"> privacy@looga.ci</span>.
            </p>
          ),
        },
        {
          heading: 'Cookies',
          body: (
            <p>
              Nous utilisons uniquement des cookies techniques nécessaires au
              fonctionnement de la plateforme (session, panier). Aucun cookie
              publicitaire ou de tracking tiers.
            </p>
          ),
        },
      ]}
    />
  );
}
