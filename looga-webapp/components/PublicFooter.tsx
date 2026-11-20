'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
// Catégories publiques stables : mêmes intitulés et slugs que le footer validé.
// Ne pas importer SearchFilters ici : le footer doit rester indépendant des filtres.
const CATEGORIES = [
  { label: 'Soirées & Clubs', slugs: ['soirees'] },
  { label: 'Concerts & Live', slugs: ['concerts', 'tournee', 'theatre', 'humour'] },
  { label: 'Festivals & Open Air', slugs: ['festival', 'culture', 'sports', 'auto_moto'] },
  { label: 'Lifestyle & Expériences', slugs: [
    'workshops', 'gastronomie', 'conferences', 'networking', 'mode', 'famille',
    'religieux', 'cinema', 'caritatif', 'enfants', 'gaming', 'salon', 'bien_etre', 'autre',
  ] },
];

export function PublicFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (name: string) => setOpenSection(current => current === name ? null : name);
  return (
    <footer
      className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 pb-5 md:px-9 md:pb-9"
      aria-label="Pied de page Looga"
    >
      <div className="mx-auto w-full max-w-[1400px] rounded-[22px] bg-[#0e0e10] px-5 py-5 text-white md:px-8 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#39363e] pb-5 md:pb-7">
            <Link href="/" className="font-heading text-[30px] font-extrabold tracking-[-1px] text-[#FF5C1A]">looga.</Link>
            <span className="text-sm text-[#bcb8c0]">La ville est à toi.</span>
          </div>
          <div className="grid grid-cols-1 gap-0 py-2 md:grid-cols-3 md:gap-12 md:py-8">
            <div>
              <h2 className="md:mb-3 text-base font-bold"><button type="button" aria-expanded={openSection === 'Découvrir'} aria-controls="footer-découvrir" onClick={() => toggleSection('Découvrir')} className="flex w-full items-center justify-between py-2.5 text-left md:pointer-events-none md:py-0"><span>Découvrir</span><ChevronDown size={18} className={`transition-transform md:hidden ${openSection === 'Découvrir' ? 'rotate-180' : ''}`} /></button></h2>
              <ul id="footer-découvrir" className={`space-y-3 pb-3 text-sm text-[#c6c1c9] md:block md:pb-0 ${openSection === 'Découvrir' ? 'block' : 'hidden'}`}>
                <li><Link href="/search" className="hover:text-[#FF5C1A]">Tous les événements</Link></li>
                {CATEGORIES.map((category) => (
                  <li key={category.label}>
                    <Link href={`/search?categories=${category.slugs.join(',')}`} className="hover:text-[#FF5C1A]">
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="md:mb-3 text-base font-bold"><button type="button" aria-expanded={openSection === 'Looga'} aria-controls="footer-looga" onClick={() => toggleSection('Looga')} className="flex w-full items-center justify-between py-2.5 text-left md:pointer-events-none md:py-0"><span>Looga</span><ChevronDown size={18} className={`transition-transform md:hidden ${openSection === 'Looga' ? 'rotate-180' : ''}`} /></button></h2>
              <ul id="footer-looga" className={`space-y-3 pb-3 text-sm text-[#c6c1c9] md:block md:pb-0 ${openSection === 'Looga' ? 'block' : 'hidden'}`}>
                <li><Link href="/a-propos" className="hover:text-[#FF5C1A]">À propos</Link></li>
                <li><Link href="/organisateur" className="hover:text-[#FF5C1A]">Créer un événement</Link></li>
                <li><Link href="/aide" className="hover:text-[#FF5C1A]">Centre d&apos;aide</Link></li>
                <li><Link href="/contact" className="hover:text-[#FF5C1A]">Contact</Link></li>
                <li><Link href="/mobile" className="hover:text-[#FF5C1A]">Application mobile</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="md:mb-3 text-base font-bold"><button type="button" aria-expanded={openSection === 'Informations'} aria-controls="footer-informations" onClick={() => toggleSection('Informations')} className="flex w-full items-center justify-between py-2.5 text-left md:pointer-events-none md:py-0"><span>Informations</span><ChevronDown size={18} className={`transition-transform md:hidden ${openSection === 'Informations' ? 'rotate-180' : ''}`} /></button></h2>
              <ul id="footer-informations" className={`space-y-3 pb-3 text-sm text-[#c6c1c9] md:block md:pb-0 ${openSection === 'Informations' ? 'block' : 'hidden'}`}>
                <li><Link href="/cgu" className="hover:text-[#FF5C1A]">Conditions générales d&apos;utilisation</Link></li>
                <li><Link href="/confidentialite" className="hover:text-[#FF5C1A]">Politique de confidentialité</Link></li>
                <li><Link href="/securite" className="hover:text-[#FF5C1A]">Sécurité</Link></li>
                <li><Link href="/communaute" className="hover:text-[#FF5C1A]">Règles d&apos;utilisation</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#39363e] pt-4 text-sm text-[#a8a3ad] sm:flex-row sm:items-center sm:justify-between sm:pt-7">
            <span>© 2026 Looga</span>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-center gap-5" aria-label="Réseaux sociaux">
                <span aria-label="Instagram" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></span>
                <span aria-label="Facebook" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-4h-3.5V6.5c0-1.1.4-1.5 1.5-1.5H17V1.4A23 23 0 0 0 14.2 1C11.3 1 9.5 2.8 9.5 6v3H7v4h2.5v9z"/></svg></span>
              </div>
              <span className="block">Côte d&apos;Ivoire</span>
            </div>
          </div>
        </div>
      </footer>
  );
}
