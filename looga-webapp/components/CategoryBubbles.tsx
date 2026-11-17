'use client';

import Link from 'next/link';
import { Disc3, Music, PartyPopper, Sparkles, type LucideIcon } from 'lucide-react';
import type { EventCategory } from '@/types';

type Category = {
  label: string;
  slugs: EventCategory[];
  Icon: LucideIcon;
};

// Quatre catégories affichées sur l'accueil. Les catégories existantes
// restent inchangées dans la base de données et les autres pages.
const CATEGORIES: Category[] = [
  { label: 'Soirées & Clubs', slugs: ['soirees'], Icon: Disc3 },
  { label: 'Concerts & Live', slugs: ['concerts'], Icon: Music },
  { label: 'Festivals & Open Air', slugs: ['festival'], Icon: PartyPopper },
  {
    label: 'Lifestyle & Expériences',
    slugs: ['gastronomie', 'bien_etre', 'mode', 'workshops'],
    Icon: Sparkles,
  },
];

export function CategoryBubbles() {
  return (
    <nav aria-label="Catégories d'événements" className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
      {CATEGORIES.map(({ label, slugs, Icon }) => (
        <Link
          key={label}
          href={`/search?categories=${slugs.join(',')}`}
          className="group flex flex-col items-center gap-2 w-full max-w-44 focus:outline-none"
        >
          <span className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-colors group-hover:border-orange group-hover:bg-orange/5 group-hover:text-orange group-focus-visible:ring-4 group-focus-visible:ring-orange/30">
            <Icon size={26} strokeWidth={1.6} />
          </span>
          <span className="text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-orange">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
