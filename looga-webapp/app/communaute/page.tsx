import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Règles de la communauté — Looga',
  description: 'Les règles de comportement attendues sur Looga, pour les utilisateurs comme pour les organisateurs.',
};

export default function CommunautePage() {
  return (
    <DynamicInfoPage
      pageKey="communaute"
      fallbackTitle="Règles de la communauté"
      fallbackIntro="Looga rassemble des publics et des organisateurs autour d’événements de qualité. Ces règles garantissent une expérience saine et respectueuse pour tous."
      fallbackSections={[
        {
          heading: 'Ce que nous attendons',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Du respect dans tous les échanges, en ligne comme à l’événement</li>
              <li>Des informations exactes (nom, contact, identité)</li>
              <li>Le respect des conditions de chaque événement (âge, dress code, etc.)</li>
              <li>Une utilisation honnête des billets — pas de revente frauduleuse</li>
            </ul>
          ),
        },
        {
          heading: 'Ce qui n’est pas accepté',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Tout discours haineux, raciste, sexiste ou discriminatoire</li>
              <li>Le harcèlement en ligne ou sur les lieux d’événements</li>
              <li>La fraude, la falsification ou la copie de billets</li>
              <li>L’organisation d’événements dangereux ou illégaux</li>
            </ul>
          ),
        },
        {
          heading: 'En cas de manquement',
          body: (
            <p>
              Looga peut suspendre ou supprimer un compte qui contrevient à ces
              règles, sans préavis dans les cas graves. Pour signaler un
              comportement problématique, écrivez-nous à
              <span className="font-medium text-ink"> trust@looga.ci</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
