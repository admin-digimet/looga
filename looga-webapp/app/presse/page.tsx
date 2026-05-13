import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Presse — Looga',
  description: 'Ressources presse et contact média de Looga.',
};

export default function PressePage() {
  return (
    <InfoPage
      title="Espace presse"
      intro="Vous écrivez sur l’événementiel, la tech ou l’économie en Afrique de l’Ouest ? Nous serons heureux de vous parler."
      sections={[
        {
          heading: 'Contact presse',
          body: (
            <p>
              Pour toute demande d’interview, de témoignage ou de chiffres,
              écrivez-nous à
              <span className="font-medium text-ink"> press@looga.ci</span>.
              Nous répondons sous 48h ouvrées.
            </p>
          ),
        },
        {
          heading: 'Kit de communication',
          body: (
            <p>
              Le kit presse (logos, captures, présentation produit) est disponible
              sur demande. Précisez votre support et l’angle de votre article.
            </p>
          ),
        },
        {
          heading: 'À propos de Looga',
          body: (
            <p>
              Looga est une plateforme événementielle qui simplifie la billetterie
              et le contrôle d’accès pour les organisateurs en Afrique de l’Ouest,
              avec une intégration native des paiements mobiles locaux.
            </p>
          ),
        },
      ]}
    />
  );
}
