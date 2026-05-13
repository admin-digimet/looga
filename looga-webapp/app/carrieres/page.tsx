import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Carrières — Looga',
  description: 'Rejoignez Looga et participez à la transformation de l’événementiel en Afrique de l’Ouest.',
};

export default function CarrieresPage() {
  return (
    <InfoPage
      title="Rejoignez Looga"
      intro="Nous bâtissons la plateforme événementielle de référence en Afrique de l’Ouest. Si l’aventure vous tente, on aimerait vous parler."
      sections={[
        {
          heading: 'Nous recrutons (bientôt)',
          body: (
            <p>
              Nous n’avons pas encore d’ouvertures publiques mais nous gardons
              toujours un œil ouvert pour les profils talentueux : ingénieurs,
              designers, business developers, commerciaux. Envoyez-nous une
              candidature spontanée à
              <span className="font-medium text-ink"> careers@looga.ci</span>.
            </p>
          ),
        },
        {
          heading: 'Pourquoi Looga ?',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Un produit utilisé par de vrais organisateurs et publics dès le jour 1</li>
              <li>Un marché immense, encore peu équipé en outils digitaux</li>
              <li>Une équipe resserrée où chaque contribution compte</li>
              <li>Le télétravail flexible sur la sous-région</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
