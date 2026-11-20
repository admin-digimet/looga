'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, UserRound, X } from 'lucide-react';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useAuthStore } from '@/lib/store/authStore';

/** Navigation commune aux pages publiques de Looga. */
export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/search', label: 'Découvrir' },
    { href: '/favorites', label: 'Mes favoris' },
    { href: '/organisateur', label: 'Organisateurs' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#13091e]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-3 px-5 md:px-9">
        <Link href="/" className="font-heading text-[30px] font-extrabold tracking-[-2px] text-[#ff791f]" aria-label="Looga — Accueil">looga.</Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-9 text-sm font-semibold md:flex">
          <Link href="/search" className="hover:text-[#ff791f]">Découvrir</Link>
          <Link href="/organisateur" className="hover:text-[#ff791f]">Organisateurs</Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/search" aria-label="Rechercher des événements" className="rounded-full p-2 hover:text-[#ff791f]"><Search className="h-6 w-6" /></Link>
          {authLoading ? <span className="h-9 w-9 animate-pulse rounded-full bg-white/10" /> : isAuthenticated ? <ProfileMenu /> : <Link href="/auth/login" aria-label="Se connecter" className="rounded-full bg-white/10 p-2.5 hover:bg-white/20"><UserRound className="h-5 w-5" /></Link>}
          <button type="button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} aria-controls="looga-mobile-nav" onClick={() => setMenuOpen(v => !v)} className="rounded-full p-2 hover:bg-white/10 md:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="looga-mobile-nav" aria-label="Navigation mobile" className="flex flex-col gap-1 border-t border-white/10 px-5 py-3 text-sm font-semibold md:hidden">
          {links.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f]">{link.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
