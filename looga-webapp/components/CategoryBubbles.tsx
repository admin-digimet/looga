'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Music, Disc3, PartyPopper, Flower2, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import type { EventCategory } from '@/types';

interface Category {
  slugs: EventCategory[];
  label: string;
  Icon: LucideIcon;
}

// Catégories de l'app (alignées avec la DB) — cliquables vers la recherche.
const CATEGORIES: Category[] = [
  { slugs: ['soirees'], label: 'Soirées & Clubs', Icon: Disc3 },
  { slugs: ['concerts'], label: 'Concerts & Live', Icon: Music },
  { slugs: ['festival'], label: 'Festivals & Open Air', Icon: PartyPopper },
  { slugs: ['gastronomie', 'bien_etre', 'mode', 'workshops'], label: 'Lifestyle & Expériences', Icon: Flower2 },
];

export function CategoryBubbles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    window.addEventListener('resize', updateArrows);

    // Nudge au chargement : petit aller-retour pour signaler que ça défile.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    if (el && !prefersReduced && el.scrollWidth > el.clientWidth) {
      t1 = setTimeout(() => el.scrollTo({ left: 36, behavior: 'smooth' }), 600);
      t2 = setTimeout(() => el.scrollTo({ left: 0, behavior: 'smooth' }), 1100);
    }
    return () => {
      window.removeEventListener('resize', updateArrows);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateArrows]);

  const scrollByDir = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Fondu + flèche gauche */}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
          <button
            type="button"
            aria-label="Catégories précédentes"
            onClick={() => scrollByDir(-1)}
            className="hidden sm:flex absolute left-0 top-[28px] z-20 w-9 h-9 items-center justify-center rounded-full bg-white border border-black/10 shadow-md text-gray-700 hover:text-orange hover:border-orange/40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Rangée scrollable */}
      <nav
        ref={scrollRef}
        onScroll={updateArrows}
        aria-label="Catégories d'événements"
        className="flex gap-5 sm:gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {CATEGORIES.map(({ slugs, label, Icon }) => (
          <Link
            key={label}
            href={`/search?categories=${slugs.join(',')}`}
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

      {/* Fondu + flèche droite */}
      {canRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />
          <button
            type="button"
            aria-label="Catégories suivantes"
            onClick={() => scrollByDir(1)}
            className="hidden sm:flex absolute right-0 top-[28px] z-20 w-9 h-9 items-center justify-center rounded-full bg-white border border-black/10 shadow-md text-gray-700 hover:text-orange hover:border-orange/40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
