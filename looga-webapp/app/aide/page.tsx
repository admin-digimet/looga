import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpInfoPage } from '@/components/HelpInfoPage';

export const metadata: Metadata = {
  title: "Centre d'aide — Looga",
  description: "Réponses aux questions fréquentes sur l'utilisation de Looga, pour les utilisateurs et les organisateurs.",
};

export default function AidePage() {
  return (
    <HelpInfoPage
      pageKey="aide"
      fallbackTitle="Une question ? On est là."
      fallbackIntro="Trouve rapidement des réponses à tes questions et profite pleinement de Looga."
      fallbackSections={[
        {
          heading: 'Participants',
          body: (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-ink mb-1">Comment trouver un événement ?</p>
                <p>Sur la page d&apos;accueil, parcours les événements mis en avant. Tu peux aussi utiliser la page <Link href="/search" className="text-orange font-medium hover:underline">Recherche</Link> pour filtrer par catégorie, date ou ville.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Comment réserver un ticket ?</p>
                <p>Sur la page d&apos;un événement, clique sur <strong>Réserver</strong>, choisis ton type de billet, puis finalise le paiement avec les moyens de paiement proposés lors de la réservation. Le billet est disponible après confirmation du paiement.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Comment recevoir mon billet ?</p>
                <p>Après confirmation de ta réservation, ton billet et son QR code sont disponibles dans la rubrique <Link href="/tickets" className="text-orange font-medium hover:underline">Mes billets</Link>. Présente ce QR code à l’entrée de l’événement.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Que faire en cas de problème de réservation ?</p>
                <p>Si ton paiement a été débité mais que tu n&apos;as pas reçu ton billet, contacte-nous via la page <Link href="/contact" className="text-orange font-medium hover:underline">Contact</Link> en indiquant ton email et le nom de l&apos;événement.</p>
              </div>
            </div>
          ),
        },
        {
          heading: 'Organisateurs',
          body: (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-ink mb-1">Comment créer un événement ?</p>
                <p>Connecte-toi au <a href="https://dashboard.looga.ci" target="_blank" rel="noopener noreferrer" className="text-orange font-medium hover:underline">Dashboard organisateur</a>, clique sur <strong>Créer un événement</strong> et remplis les informations (titre, date, lieu, types de billets, image).</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Comment modifier un événement ?</p>
                <p>Dans ton dashboard, va dans <strong>Événements</strong>, clique sur l&apos;événement concerné puis sur <strong>Modifier</strong>. Les modifications sont appliquées immédiatement sur l&apos;app.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Comment voir mes réservations ?</p>
                <p>La page <strong>Vue d&apos;ensemble</strong> de ton dashboard affiche le nombre de billets vendus, le taux de remplissage et les scans en temps réel.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Comment recevoir les informations des participants ?</p>
                <p>Depuis la page détail de ton événement dans le dashboard, tu peux voir la liste des participants avec leurs noms et numéros de contact.</p>
              </div>
            </div>
          ),
        },
        {
          heading: 'Application mobile',
          body: (
            <>
              <div className="space-y-5 mb-4">
                <div>
                  <p className="font-semibold text-ink mb-1">Comment télécharger l&apos;application ?</p>
                  <p>L&apos;application Looga est disponible sur <Link href="/mobile" className="text-orange font-medium hover:underline">notre page mobile</Link>. En attendant la sortie sur les stores officiels, tu peux utiliser l&apos;application directement depuis ton navigateur.</p>
                </div>
                <div>
                  <p className="font-semibold text-ink mb-1">Comment se connecter ?</p>
                  <p>Utilise ton email et mot de passe Looga sur l&apos;écran de connexion. Si tu n&apos;as pas encore de compte, crée-en un gratuitement en quelques secondes.</p>
                </div>
                <div>
                  <p className="font-semibold text-ink mb-1">Problèmes de connexion</p>
                  <p>Si tu ne peux pas te connecter, vérifie ton email et mot de passe. Si tu as oublié ton mot de passe ou si le problème persiste, <Link href="/contact" className="text-orange font-medium hover:underline">contacte le support</Link>.</p>
                </div>
              </div>
            </>
          ),
        },
        {
          heading: 'Réservations & paiements',
          body: (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-ink mb-1">Comment fonctionne la réservation ?</p>
                <p>Sélectionne un événement, choisis ton type de billet et procède au paiement. Une fois le paiement confirmé, ton billet QR code est généré et accessible immédiatement dans <strong>Mes billets</strong>.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Est-ce sécurisé ?</p>
                <p>Oui. Les paiements sont traités par <strong>GeniusPay</strong>, un prestataire de paiement sécurisé. Looga ne stocke aucune donnée bancaire ou financière. Toutes les transactions sont chiffrées.</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Peut-on annuler une réservation ?</p>
                <p>La politique d&apos;annulation dépend de chaque organisateur et est précisée sur la page de l&apos;événement. En cas de litige, contacte-nous via la page <Link href="/contact" className="text-orange font-medium hover:underline">Contact</Link>.</p>
              </div>
            </div>
          ),
        },
        {
          heading: "Besoin d'aide personnalisée ?",
          body: (
            <>
              <p className="mb-4">
                Si tu ne trouves pas ta réponse ici, notre équipe est disponible pour t&apos;aider directement. Nous faisons de notre mieux pour répondre rapidement afin que tu puisses profiter de Looga sans interruption.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
                >
                  Contacter le support
                </Link>
                <Link
                  href="/"
                  className="inline-block border border-gray-300 text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Voir les événements
                </Link>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
