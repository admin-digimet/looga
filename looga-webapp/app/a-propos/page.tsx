import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'À propos — Looga',
  description: 'Looga est la plateforme événementielle qui réunit organisateurs et publics en Afrique de l’Ouest.',
};

export default function AboutPage() {
  return (
    <DynamicInfoPage
      pageKey="a-propos"
      fallbackTitle="À propos de Looga"
      fallbackIntro="La plateforme qui réunit les meilleurs événements et leurs publics en Afrique de l’Ouest."
      fallbackSections={[
        {
          heading: 'Notre mission',
          body: (
            <p>
              Looga rend la billetterie événementielle simple et accessible.
              Nous donnons aux organisateurs les outils pour vendre, scanner et
              suivre leurs événements en temps réel, et aux publics une expérience
              claire pour découvrir et acheter leurs billets en quelques clics.
            </p>
          ),
        },
        {
          heading: 'Là où nous opérons',
          body: (
            <p>
              Basés en Côte d’Ivoire, nous accompagnons des événements à Abidjan,
              Bouaké, Yamoussoukro, Grand-Bassam et plus largement dans la sous-région.
              Notre objectif : couvrir progressivement toute l’Afrique de l’Ouest.
            </p>
          ),
        },
        {
          heading: 'Nos valeurs',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Simplicité — un produit qui fonctionne, sans friction.</li>
              <li>Transparence — pas de frais cachés, paiements traçables.</li>
              <li>Proximité — nous comprenons les usages locaux et les paiements mobiles.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
