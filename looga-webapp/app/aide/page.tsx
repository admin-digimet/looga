import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Centre d’aide — Looga',
  description: 'Réponses aux questions fréquentes sur l’utilisation de Looga.',
};

const faqs = [
  {
    q: 'Comment acheter un billet ?',
    a: "Sélectionnez l'événement qui vous intéresse, choisissez votre type de billet et la quantité, puis payez via MTN Mobile Money, Orange Money, Wave ou carte bancaire. Le billet apparaît immédiatement dans la rubrique « Mes billets ».",
  },
  {
    q: 'Puis-je me faire rembourser ?',
    a: "Les billets sont en principe non remboursables. En cas d'annulation par l'organisateur, le remboursement est traité automatiquement sous 7 à 14 jours.",
  },
  {
    q: 'Comment présenter mon billet à l’entrée ?',
    a: "Ouvrez l'application ou la page « Mes billets », affichez le QR code et présentez-le au staff à l'entrée. Le QR fonctionne aussi sans connexion internet.",
  },
  {
    q: 'L’application mobile est-elle disponible ?',
    a: "L'application mobile Looga arrive très bientôt sur iOS et Android. En attendant, la version web fonctionne parfaitement sur smartphone.",
  },
  {
    q: 'Comment devenir organisateur ?',
    a: "Rendez-vous sur la page Devenir organisateur pour découvrir notre offre, puis créez votre compte depuis le tableau de bord organisateur.",
  },
  {
    q: 'Mon paiement n’a pas abouti, que faire ?',
    a: "Vérifiez votre solde et votre connexion, puis réessayez. Si le problème persiste, contactez-nous à contact@looga.ci avec une capture d'écran et nous traiterons votre demande rapidement.",
  },
];

export default function AidePage() {
  return (
    <InfoPage
      title="Centre d’aide"
      intro="Les réponses aux questions les plus fréquentes. Vous ne trouvez pas votre réponse ? Contactez-nous."
    >
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group bg-white rounded-xl border border-cream-2 overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none p-5 font-medium text-ink hover:bg-cream-2 transition-colors">
              <span className="text-sm md:text-base">{item.q}</span>
              <ChevronDown className="w-4 h-4 text-ink-muted shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>

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
    </InfoPage>
  );
}
