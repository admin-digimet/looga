import type { Metadata } from 'next';
import { DynamicInfoPage } from '@/components/DynamicInfoPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Looga',
  description: 'Comment Looga collecte, utilise et protège vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <DynamicInfoPage
      pageKey="confidentialite"
      fallbackTitle="Politique de confidentialité"
      fallbackIntro="La présente politique de confidentialité a pour objet d’informer les utilisateurs de la plateforme Looga sur la manière dont leurs données personnelles sont collectées, utilisées et protégées, conformément à la réglementation applicable en matière de protection des données. Les termes « Looga », « nous », « notre » désignent Looga. Les termes « vous », « votre » désignent tout utilisateur de la plateforme."
      fallbackSections={[
        {
          heading: '2. Données personnelles collectées',
          body: (
            <>
              <p className="font-semibold text-ink mb-2">2.1 Données collectées automatiquement</p>
              <p className="mb-3">
                Lors de l’utilisation de la plateforme, certaines données sont collectées automatiquement :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-5">
                <li>Adresse IP</li>
                <li>Informations sur l’appareil (type, système d’exploitation)</li>
                <li>Données de connexion et d’usage</li>
                <li>Données de localisation (sous réserve de votre consentement)</li>
              </ul>
              <p className="font-semibold text-ink mb-2">2.2 Données fournies volontairement</p>
              <p className="mb-3">Vous pouvez être amené à nous fournir :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Nom et prénom</li>
                <li>Adresse e-mail</li>
                <li>Numéro de téléphone</li>
                <li>Photo de profil</li>
                <li>Identifiants de connexion</li>
                <li>Informations liées aux achats (billets, réservations)</li>
                <li>Données professionnelles (pour les organisateurs)</li>
              </ul>
            </>
          ),
        },
        {
          heading: '3. Finalités du traitement',
          body: (
            <>
              <p className="mb-3">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Gestion des comptes utilisateurs</li>
                <li>Vente de billets en ligne</li>
                <li>Gestion des réservations (tables, services, accès VIP)</li>
                <li>Gestion des invitations et listes d’accès</li>
                <li>Génération de billets et factures</li>
                <li>Communication et assistance utilisateur</li>
                <li>Envoi d’informations et notifications liées aux événements</li>
                <li>Recommandation personnalisée d’événements</li>
                <li>Sécurité et prévention de la fraude</li>
                <li>Analyse statistique et amélioration de la plateforme</li>
                <li>Respect des obligations légales</li>
              </ul>
            </>
          ),
        },
        {
          heading: '4. Bases légales du traitement',
          body: (
            <>
              <p className="mb-3">Les traitements sont fondés sur :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Votre consentement</li>
                <li>L’exécution d’un contrat (achat de billets, utilisation du service)</li>
                <li>Le respect d’une obligation légale</li>
                <li>L’intérêt légitime de Looga (amélioration du service, sécurité)</li>
              </ul>
            </>
          ),
        },
        {
          heading: '5. Paiements',
          body: (
            <>
              <p className="mb-3">
                Les paiements effectués sur la plateforme Looga sont traités par des prestataires de paiement sécurisés, notamment <span className="font-medium text-ink">GeniusPay</span>.
              </p>
              <p className="mb-3">
                Looga ne stocke pas les données bancaires ou financières des utilisateurs. Ces données sont directement collectées et traitées par les prestataires de paiement, conformément à leurs propres politiques de confidentialité et aux normes de sécurité en vigueur.
              </p>
              <p>Looga n’a à aucun moment accès aux informations complètes de paiement.</p>
            </>
          ),
        },
        {
          heading: '6. Partage des données',
          body: (
            <>
              <p className="mb-3">Vos données peuvent être partagées avec :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-5">
                <li>Les équipes internes de Looga</li>
                <li>Des prestataires techniques (hébergement, paiement, support)</li>
                <li>Les autorités administratives ou judiciaires lorsque la loi l’exige</li>
              </ul>
              <p className="font-semibold text-ink mb-2">Cas spécifique des événements</p>
              <p className="mb-3">
                Dans le cadre de la gestion des événements, certaines données (nom, numéro, informations de participation) peuvent être transmises aux organisateurs.
              </p>
              <p className="mb-2">Cette transmission est strictement limitée à :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>la gestion des accès</li>
                <li>la communication liée à l’événement</li>
                <li>les statistiques de participation</li>
              </ul>
              <p className="mb-3">
                Les organisateurs s’engagent à ne pas utiliser ces données à des fins commerciales sans votre consentement.
              </p>
              <p className="font-semibold text-ink">Looga ne vend jamais les données des utilisateurs.</p>
            </>
          ),
        },
        {
          heading: '7. Hébergement et transfert des données',
          body: (
            <>
              <p className="mb-3">
                Les données sont hébergées chez des prestataires techniques sécurisés. Elles peuvent être stockées ou traitées en dehors de la Côte d’Ivoire.
              </p>
              <p>
                Dans ce cas, Looga s’assure que des garanties appropriées sont mises en place afin de garantir la sécurité et la confidentialité des données (chiffrement, protocoles sécurisés, etc.).
              </p>
            </>
          ),
        },
        {
          heading: '8. Durée de conservation',
          body: (
            <>
              <p className="mb-3">Les données sont conservées pour les durées suivantes :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-medium text-ink">Données de compte</span> : durée d’utilisation + 2 ans</li>
                <li><span className="font-medium text-ink">Données de transaction</span> : jusqu’à 10 ans</li>
                <li><span className="font-medium text-ink">Logs techniques</span> : 12 mois</li>
                <li><span className="font-medium text-ink">Photos de profil</span> : jusqu’à suppression du compte</li>
              </ul>
            </>
          ),
        },
        {
          heading: '9. Sécurité des données',
          body: (
            <>
              <p className="mb-3">
                Looga met en œuvre des mesures techniques et organisationnelles pour garantir :
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>La confidentialité des données</li>
                <li>La protection contre les accès non autorisés</li>
                <li>Le chiffrement des échanges</li>
                <li>La gestion sécurisée des accès</li>
              </ul>
            </>
          ),
        },
        {
          heading: '10. Cookies',
          body: (
            <>
              <p className="mb-3">La plateforme utilise des cookies pour :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>assurer son bon fonctionnement</li>
                <li>analyser l’utilisation</li>
                <li>améliorer l’expérience utilisateur</li>
              </ul>
              <p>
                Une bannière de consentement aux cookies est affichée lors de votre première visite, conformément à la réglementation en vigueur.
              </p>
            </>
          ),
        },
        {
          heading: '11. Droits des utilisateurs',
          body: (
            <>
              <p className="mb-3">Vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Droit d’accès</li>
                <li>Droit de rectification</li>
                <li>Droit de suppression</li>
                <li>Droit d’opposition</li>
                <li>Droit à la portabilité</li>
              </ul>
              <p className="mb-2">
                Vous pouvez exercer vos droits en nous contactant.
              </p>
              <p>
                Looga s’engage à répondre à toute demande dans un délai maximum de <span className="font-medium text-ink">30 jours</span>.
              </p>
            </>
          ),
        },
        {
          heading: '12. Protection des mineurs',
          body: (
            <>
              <p className="mb-3">
                La plateforme est réservée aux personnes âgées de <span className="font-medium text-ink">16 ans et plus</span>.
              </p>
              <p>
                Si des données concernant un mineur sont collectées sans autorisation parentale, elles seront supprimées dans les plus brefs délais.
              </p>
            </>
          ),
        },
        {
          heading: '13. Contact',
          body: (
            <>
              <p className="mb-2">Pour toute question relative à la protection des données :</p>
              <p className="mb-1">📧 Email : <span className="font-medium text-ink">contact@looga.com</span></p>
              <p>🏢 Adresse : <span className="font-medium text-ink">Abidjan, Côte d'Ivoire</span></p>
            </>
          ),
        },
        {
          heading: '14. Modifications',
          body: (
            <p>
              Looga se réserve le droit de modifier la présente politique à tout moment. La version applicable est celle publiée sur la plateforme.
            </p>
          ),
        },
      ]}
    />
  );
}
