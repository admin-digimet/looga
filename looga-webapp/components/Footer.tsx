import Link from 'next/link';
import { Globe, ChevronDown } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-lg mb-4">Utiliser Looga</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/organisateur" className="hover:text-white">Créer un événement</Link></li>
              <li><Link href="/organisateur#tarifs" className="hover:text-white">Tarifs</Link></li>
              <li><Link href="/mobile" className="hover:text-white">Application mobile</Link></li>
              <li><Link href="/organisateur#guides" className="hover:text-white">Guides organisateurs</Link></li>
              <li><Link href="/securite" className="hover:text-white">Sécurité</Link></li>
              <li><Link href="/communaute" className="hover:text-white">Règles de la communauté</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Planifier des événements</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/organisateur" className="hover:text-white">Vente de billets en ligne</Link></li>
              <li><Link href="/organisateur" className="hover:text-white">Logiciel de billetterie</Link></li>
              <li><Link href="/organisateur" className="hover:text-white">Système de paiement</Link></li>
              <li><Link href="/organisateur" className="hover:text-white">Marketing événementiel</Link></li>
              <li><Link href="/organisateur" className="hover:text-white">Outils de promotion</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Trouver des événements</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-white">Événements en ligne</Link></li>
              <li><Link href="/" className="hover:text-white">Concerts & Festivals</Link></li>
              <li><Link href="/" className="hover:text-white">Classes & Ateliers</Link></li>
              <li><Link href="/" className="hover:text-white">Événements sportifs</Link></li>
              <li><Link href="/" className="hover:text-white">Salons professionnels</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Connectons-nous</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/aide" className="hover:text-white">Centre d&apos;aide</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contactez-nous</Link></li>
              <li><Link href="/communaute" className="hover:text-white">Communauté</Link></li>
              <li><Link href="/a-propos" className="hover:text-white">À propos de Looga</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700 text-xs text-gray-400">
          <p>© 2026 Looga</p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <Link href="/a-propos" className="hover:text-white">À propos</Link>
            <Link href="/aide" className="hover:text-white">Aide</Link>
            <Link href="/carrieres" className="hover:text-white">Carrières</Link>
            <Link href="/cgu" className="hover:text-white">Conditions</Link>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-1 cursor-pointer hover:text-white">
            <Globe className="w-4 h-4" />
            <span>Côte d&apos;Ivoire</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>
    </footer>
  );
}
