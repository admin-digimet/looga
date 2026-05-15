import type { Metadata } from 'next';
import Link from 'next/link';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Centre d’aide — Looga',
  description: 'Réponses aux questions fréquentes sur l’utilisation de Looga.',
};

const FALLBACK_FAQS = [
  {
    heading: 'Comment acheter un billet ?',
    body: "Sélectionnez l'événement qui vous intéresse, choisissez votre type de billet et la quantité, puis payez via MTN Mobile Money, Orange Money, Wave ou carte bancaire. Le billet apparaît immédiatement dans la rubrique « Mes billets ».",
  },
  {
    heading: 'Puis-je me faire rembourser ?',
    body: "Les billets sont en principe non remboursables. En cas d'annulation par l'organisateur, le remboursement est traité automatiquement sous 7 à 14 jours.",
  },
  {
    heading: 'Comment présenter mon billet à l’entrée ?',
    body: "Ouvrez l'application ou la page « Mes billets », affichez le QR code et présentez-le au staff à l'entrée. Le QR fonctionne aussi sans connexion internet.",
  },
  {
    heading: 'L’application mobile est-elle disponible ?',
    body: "L'application mobile Looga arrive très bientôt sur iOS et Android. En attendant, la version web fonctionne parfaitement sur smartphone.",
  },
  {
    heading: 'Comment devenir organisateur ?',
    body: "Rendez-vous sur la page Devenir organisateur pour découvrir notre offre, puis créez votre compte depuis le tableau de bord organisateur.",
  },
  {
    heading: 'Mon paiement n’a pas abouti, que faire ?',
    body: "Vérifiez votre solde et votre connexion, puis réessayez. Si le problème persiste, contactez-nous à contact@looga.ci avec une capture d'écran et nous traiterons votre demande rapidement.",
  },
];

export default function AidePage() {
  return (
    <DynamicInfoPage
      pageKey="aide"
      accordion
      fallbackTitle="Centre d’aide"
      fallbackIntro="Les réponses aux questions les plus fréquentes. Vous ne trouvez pas votre réponse ? Contactez-nous."
      fallbackSections={FALLBACK_FAQS}
      fallbackExtra={
        <div className="mt-10 bg-white rounded-2xl p-6 border border-cream-2 text-center">
          <p className="text-sm text-ink-muted mb-3">
            Vous n’avez pas trouvé votre réponse ?
          </p>
          <Link
            href="/contact"
            className="inline-block bg-orange text-white text-sm font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity"
          >
            Contactez-nous
          </Link>
        </div>
      }
    />
  );
}
