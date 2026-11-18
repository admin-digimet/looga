import Link from 'next/link';
import { CATEGORY_GROUPS } from '@/components/search/SearchFilters';

const CATEGORIES = CATEGORY_GROUPS.map(group => ({ label: group.label, slugs: group.keys }));

export function AboutFooter() {
  return (
      <footer className="w-full px-0 pb-0" aria-label="Pied de page Looga">
        <div className="w-full bg-[#0e0e10] px-5 py-8 text-white sm:px-8 md:px-12 md:py-10 lg:px-[max(3rem,calc((100vw-1200px)/2))]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#39363e] pb-7">
            <Link href="/" className="font-heading text-[30px] font-extrabold tracking-[-1px] text-[#ff791f]">looga.</Link>
            <span className="text-sm text-[#bcb8c0]">La ville est à toi.</span>
          </div>
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3 sm:gap-9 sm:py-8 md:gap-12">
            <div>
              <h2 className="mb-3 text-base font-bold">Découvrir</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/search" className="hover:text-[#ff791f]">Tous les événements</Link></li>
                {CATEGORIES.map((category) => (
                  <li key={category.label}>
                    <Link href={`/search?categories=${category.slugs.join(',')}`} className="hover:text-[#ff791f]">
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-base font-bold">Looga</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/a-propos" className="hover:text-[#ff791f]">À propos</Link></li>
                <li><Link href="/organisateur" className="hover:text-[#ff791f]">Créer un événement</Link></li>
                <li><Link href="/aide" className="hover:text-[#ff791f]">Centre d&apos;aide</Link></li>
                <li><Link href="/contact" className="hover:text-[#ff791f]">Contact</Link></li>
                <li><Link href="/mobile" className="hover:text-[#ff791f]">Application mobile</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-base font-bold">Informations</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/cgu" className="hover:text-[#ff791f]">Conditions générales d&apos;utilisation</Link></li>
                <li><Link href="/confidentialite" className="hover:text-[#ff791f]">Politique de confidentialité</Link></li>
                <li><Link href="/securite" className="hover:text-[#ff791f]">Sécurité</Link></li>
                <li><Link href="/communaute" className="hover:text-[#ff791f]">Règles d&apos;utilisation</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#39363e] pt-5 sm:pt-7 text-sm text-[#a8a3ad] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Looga</span>
            <div className="flex items-center gap-5">
              <span aria-label="Instagram" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></span>
              <span aria-label="Facebook" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-4h-3.5V6.5c0-1.1.4-1.5 1.5-1.5H17V1.4A23 23 0 0 0 14.2 1C11.3 1 9.5 2.8 9.5 6v3H7v4h2.5v9z"/></svg></span>
              <span>Côte d&apos;Ivoire</span>
            </div>
          </div>
        </div>
      </footer>
  );
}
