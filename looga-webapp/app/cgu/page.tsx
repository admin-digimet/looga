import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation — Looga',
  description: 'Conditions générales d’utilisation de la plateforme Looga.',
};

export default function CguPage() {
  return (
    <DynamicInfoPage
      pageKey="cgu"
      fallbackTitle="Conditions générales d’utilisation"
      fallbackIntro="Les présentes Conditions Générales d’Utilisation (CGU) régissent l’accès et l’utilisation de la plateforme Looga. Merci de les lire attentivement avant toute utilisation du service."
      fallbackSections={[
        {
          heading: 'Article 2 — Objet',
          body: (
            <>
              <p className="mb-3">Looga est une plateforme permettant :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>la découverte d’événements</li>
                <li>la mise en relation entre utilisateurs et organisateurs</li>
                <li>l’achat de billets et la réservation de services (tables, accès VIP, etc.)</li>
              </ul>
              <p>L’utilisation de la plateforme implique l’acceptation pleine et entière des présentes CGU.</p>
            </>
          ),
        },
        {
          heading: 'Article 3 — Accès à la plateforme',
          body: (
            <>
              <p className="mb-3">La plateforme est accessible via site internet et/ou application mobile.</p>
              <p className="mb-3">Looga s’efforce d’assurer l’accessibilité du service sans garantir une disponibilité ininterrompue.</p>
              <p>Looga peut suspendre l’accès pour maintenance, mise à jour ou raisons techniques.</p>
            </>
          ),
        },
        {
          heading: 'Article 4 — Création de compte',
          body: (
            <>
              <p className="mb-3">Certaines fonctionnalités nécessitent la création d’un compte.</p>
              <p className="mb-2">L’utilisateur s’engage à :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>fournir des informations exactes</li>
                <li>maintenir la confidentialité de ses identifiants</li>
                <li>signaler toute utilisation frauduleuse</li>
              </ul>
              <p>L’utilisateur est responsable de toute activité effectuée depuis son compte.</p>
            </>
          ),
        },
        {
          heading: 'Article 5 — Obligations de l’utilisateur',
          body: (
            <>
              <p className="mb-2">L’utilisateur s’engage à :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>utiliser la plateforme conformément à sa finalité</li>
                <li>ne pas porter atteinte au bon fonctionnement du service</li>
                <li>ne pas contourner les systèmes de sécurité</li>
                <li>ne pas publier de contenu illicite ou frauduleux</li>
                <li>ne pas revendre ou utiliser frauduleusement des billets</li>
              </ul>
              <p>Toute violation peut entraîner la suspension ou suppression du compte.</p>
            </>
          ),
        },
        {
          heading: 'Article 6 — Compte organisateur',
          body: (
            <>
              <p className="mb-2">L’organisateur s’engage à :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-4">
                <li>disposer de toutes les autorisations nécessaires</li>
                <li>fournir des informations exactes</li>
                <li>respecter la réglementation ivoirienne</li>
                <li>respecter la capacité des lieux</li>
                <li>ne pas pratiquer de survente</li>
              </ul>
              <p className="mb-2">L’organisateur est seul responsable :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>de l’organisation de l’événement</li>
                <li>de son bon déroulement</li>
                <li>du respect des obligations légales et sécuritaires</li>
              </ul>
              <p>Looga se réserve le droit de refuser ou retirer tout événement non conforme.</p>
            </>
          ),
        },
        {
          heading: 'Article 7 — Billetterie et paiements',
          body: (
            <>
              <p className="mb-3">
                Les paiements sont traités via un prestataire sécurisé, notamment <span className="font-medium text-ink">GeniusPay</span>.
              </p>
              <p className="mb-3">Looga agit en qualité d’intermédiaire technique.</p>
              <p className="mb-3">
                Les fonds issus de la vente de billets sont destinés à l’organisateur, sous déduction des commissions applicables.
              </p>
              <p>Looga ne stocke pas les données de paiement et n’a pas accès aux informations bancaires complètes.</p>
            </>
          ),
        },
        {
          heading: 'Article 8 — Relation contractuelle',
          body: (
            <>
              <p className="mb-3">
                L’achat d’un billet constitue un contrat direct entre l’utilisateur et l’organisateur.
              </p>
              <p>Looga n’est pas partie à ce contrat et agit uniquement comme intermédiaire technique.</p>
            </>
          ),
        },
        {
          heading: 'Article 9 — Remboursement et annulation',
          body: (
            <>
              <p className="mb-3">Les conditions de remboursement sont définies par l’organisateur.</p>
              <p className="mb-2">En cas d’annulation ou modification d’un événement :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>l’organisateur est seul responsable</li>
                <li>Looga ne garantit pas le remboursement</li>
              </ul>
              <p>Looga peut intervenir à titre commercial sans y être obligée.</p>
            </>
          ),
        },
        {
          heading: 'Article 10 — Accès aux événements',
          body: (
            <>
              <p className="mb-3">Les billets sont fournis sous format numérique (QR code ou équivalent).</p>
              <p className="mb-3">L’utilisateur doit présenter son billet pour accéder à l’événement.</p>
              <p className="mb-2">Toute tentative de fraude (duplication, revente abusive, falsification) peut entraîner :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>l’annulation du billet</li>
                <li>le refus d’accès sans remboursement</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Article 11 — Responsabilité',
          body: (
            <>
              <p className="mb-3">Looga agit en qualité d’intermédiaire technique.</p>
              <p className="mb-2">Looga ne saurait être tenue responsable :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-4">
                <li>des événements organisés</li>
                <li>de leur qualité ou conformité</li>
                <li>de leur annulation ou modification</li>
                <li>des dommages liés à l’événement</li>
              </ul>
              <p className="mb-2">Looga ne garantit pas :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>la disponibilité des événements</li>
                <li>leur conformité aux attentes</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Article 12 — Données personnelles',
          body: (
            <>
              <p className="mb-3">
                Les données sont traitées conformément à la <a href="/confidentialite" className="text-orange font-medium hover:underline">politique de confidentialité</a> de Looga.
              </p>
              <p className="mb-3">
                Certaines données peuvent être transmises aux organisateurs pour la gestion des événements.
              </p>
              <p>Looga s’engage à ne pas vendre les données des utilisateurs.</p>
            </>
          ),
        },
        {
          heading: 'Article 13 — Propriété intellectuelle',
          body: (
            <>
              <p className="mb-3">
                Tous les éléments de la plateforme sont protégés par le droit de la propriété intellectuelle.
              </p>
              <p>Toute reproduction ou exploitation sans autorisation est interdite.</p>
            </>
          ),
        },
        {
          heading: 'Article 14 — Suspension et résiliation',
          body: (
            <>
              <p className="mb-2">Looga peut suspendre ou supprimer un compte en cas :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>de violation des CGU</li>
                <li>de fraude</li>
                <li>de comportement nuisible</li>
              </ul>
              <p>Cette suspension peut être immédiate sans préavis en cas de faute grave.</p>
            </>
          ),
        },
        {
          heading: 'Article 15 — Force majeure',
          body: (
            <p>
              Looga ne pourra être tenue responsable en cas de force majeure empêchant le fonctionnement du service ou la tenue des événements.
            </p>
          ),
        },
        {
          heading: 'Article 16 — Modification des CGU',
          body: (
            <>
              <p className="mb-3">Looga peut modifier les présentes CGU à tout moment.</p>
              <p>La version applicable est celle en vigueur lors de l’utilisation de la plateforme.</p>
            </>
          ),
        },
        {
          heading: 'Article 17 — Droit applicable',
          body: (
            <>
              <p className="mb-3">Les présentes CGU sont soumises au droit ivoirien.</p>
              <p>Tout litige fera l’objet d’une tentative de résolution amiable avant toute action judiciaire.</p>
            </>
          ),
        },
      ]}
    />
  );
}
