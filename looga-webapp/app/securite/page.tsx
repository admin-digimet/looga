import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Sécurité — Looga',
  description: 'Comment Looga protège vos paiements, vos données et vos billets.',
};

export default function SecuritePage() {
  return (
    <DynamicInfoPage
      pageKey="securite"
      fallbackTitle="Sécurité"
      fallbackIntro="Vos paiements et vos données sont notre priorité absolue."
      fallbackSections={[
        {
          heading: 'Paiements sécurisés',
          body: (
            <p>
              Tous les paiements (MTN Mobile Money, Orange Money, Wave, cartes
              bancaires) sont traités par nos partenaires certifiés. Looga ne
              stocke jamais vos informations bancaires ni vos codes PIN.
            </p>
          ),
        },
        {
          heading: 'Authentification',
          body: (
            <p>
              Vos identifiants sont protégés par chiffrement. Nous recommandons
              fortement d’utiliser un mot de passe unique et complexe pour votre
              compte Looga.
            </p>
          ),
        },
        {
          heading: 'Anti-fraude billetterie',
          body: (
            <p>
              Chaque billet est unique et associé à un QR code qui ne peut être
              validé qu’une seule fois à l’entrée de l’événement. La revente
              non autorisée invalide automatiquement le billet.
            </p>
          ),
        },
        {
          heading: 'Signaler un incident',
          body: (
            <p>
              Si vous suspectez une activité frauduleuse sur votre compte ou un
              événement, contactez-nous immédiatement à
              <span className="font-medium text-ink"> security@looga.ci</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
