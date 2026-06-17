import Link from 'next/link';
import {
  Music, Disc3, Landmark, Trophy, Wrench, UtensilsCrossed, Presentation,
  Handshake, Shirt, Users, Laugh, Church, Film, HeartHandshake, Baby,
  Gamepad2, Route, Store, Drama, Flower2, PartyPopper, Car,
  type LucideIcon,
} from 'lucide-react';
import type { EventCategory } from '@/types';

interface Category {
  slug: EventCategory;
  label: string;
  Icon: LucideIcon;
}

// Catégories de l'app (alignées avec la DB) — cliquables vers la recherche.
const CATEGORIES: Category[] = [
  { slug: 'concerts',    label: 'Concerts',     Icon: Music },
  { slug: 'soirees',     label: 'Soirées',      Icon: Disc3 },
  { slug: 'festival',    label: 'Festival',     Icon: PartyPopper },
  { slug: 'culture',     label: 'Culture',      Icon: Landmark },
  { slug: 'theatre',     label: 'Théâtre',      Icon: Drama },
  { slug: 'cinema',      label: 'Cinéma',       Icon: Film },
  { slug: 'humour',      label: 'Humour',       Icon: Laugh },
  { slug: 'sports',      label: 'Sports',       Icon: Trophy },
  { slug: 'gaming',      label: 'Gaming',       Icon: Gamepad2 },
  { slug: 'gastronomie', label: 'Gastronomie',  Icon: UtensilsCrossed },
  { slug: 'workshops',   label: 'Ateliers',     Icon: Wrench },
  { slug: 'conferences', label: 'Conférences',  Icon: Presentation },
  { slug: 'networking',  label: 'Networking',   Icon: Handshake },
  { slug: 'salon',       label: 'Salon',        Icon: Store },
  { slug: 'mode',        label: 'Mode',         Icon: Shirt },
  { slug: 'bien_etre',   label: 'Bien-être',    Icon: Flower2 },
  { slug: 'famille',     label: 'Famille',      Icon: Users },
  { slug: 'enfants',     label: 'Enfants',      Icon: Baby },
  { slug: 'religieux',   label: 'Religieux',    Icon: Church },
  { slug: 'caritatif',   label: 'Caritatif',    Icon: HeartHandshake },
  { slug: 'tournee',     label: 'Tournée',      Icon: Route },
  { slug: 'auto_moto',   label: 'Auto-Moto',    Icon: Car },
];

export function CategoryBubbles() {
  return (
    <nav
      aria-label="Catégories d'événements"
      className="flex gap-5 sm:gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map(({ slug, label, Icon }) => (
        <Link
          key={slug}
          href={`/search?categories=${slug}`}
          className="group flex flex-col items-center gap-2 shrink-0 w-20 focus:outline-none"
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
