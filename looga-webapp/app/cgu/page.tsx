import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation — Looga',
  description: 'Conditions générales d’utilisation de la plateforme Looga.',
};

export default function CguPage() {
  return (
    <InfoPage
      title="Conditions générales d’utilisation"
      intro="Merci de lire attentivement ces conditions avant d’utiliser la plateforme Looga."
      sections={[
        {
          heading: '1. Objet',
          body: (
            <p>
              Les présentes conditions régissent l’accès et l’utilisation des
              services Looga par les utilisateurs (acheteurs de billets) et les
              organisateurs d’événements.
            </p>
          ),
        },
        {
          heading: '2. Inscription et compte',
          body: (
            <p>
              L’utilisation de Looga nécessite la création d’un compte. Vous vous
              engagez à fournir des informations exactes et à les maintenir à jour.
              Vous êtes responsable de la confidentialité de vos identifiants.
            </p>
          ),
        },
        {
          heading: '3. Achat de billets',
          body: (
            <p>
              L’achat d’un billet sur Looga vous donne accès à l’événement
              correspondant. Le billet est nominatif et non remboursable, sauf
              annulation par l’organisateur ou disposition légale contraire.
            </p>
          ),
        },
        {
          heading: '4. Paiement',
          body: (
            <p>
              Les paiements sont traités par nos partenaires (MTN Mobile Money,
              Orange Money, Wave, cartes bancaires). Looga ne stocke pas vos
              informations de paiement.
            </p>
          ),
        },
        {
          heading: '5. Responsabilité',
          body: (
            <p>
              Looga est un intermédiaire technique. La responsabilité de la tenue
              effective de l’événement incombe à l’organisateur.
            </p>
          ),
        },
        {
          heading: '6. Modification',
          body: (
            <p>
              Looga se réserve le droit de modifier ces conditions à tout moment.
              Les modifications prennent effet dès leur publication sur cette page.
            </p>
          ),
        },
        {
          heading: 'Contact',
          body: (
            <p>
              Pour toute question relative à ces conditions, contactez-nous à
              <span className="font-medium text-ink"> contact@looga.ci</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
