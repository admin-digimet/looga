'use client';

import { X, RotateCcw } from 'lucide-react';
import type { EventCategory } from '@/types';
import type { PricePreset, PeriodPreset } from '@/lib/api/events';

// Regroupement d'affichage uniquement : les catégories historiques restent dans la base.
// Chaque sélection envoie les identifiants historiques à l'API de recherche.
export const CATEGORY_GROUPS: { label: string; keys: EventCategory[] }[] = [
  { label: 'Soirées & Clubs', keys: ['soirees'] },
  { label: 'Concerts & Live', keys: ['concerts', 'tournee', 'theatre', 'humour'] },
  { label: 'Festivals & Open Air', keys: ['festival', 'culture', 'sports', 'auto_moto'] },
  { label: 'Lifestyle & Expériences', keys: [
    'workshops', 'gastronomie', 'conferences', 'networking', 'mode', 'famille',
    'religieux', 'cinema', 'caritatif', 'enfants', 'gaming', 'salon', 'bien_etre', 'autre',
  ] },
];

const POPULAR_CITIES = ['Abidjan', 'Grand-Bassam', 'Assinie'];

const PERIOD_OPTIONS: { key: PeriodPreset; label: string }[] = [
  { key: 'all',     label: 'À tout moment' },
  { key: 'today',   label: "Aujourd'hui" },
  { key: 'weekend', label: 'Ce week-end' },
  { key: 'week',    label: 'Cette semaine' },
  { key: 'month',   label: 'Ce mois-ci' },
];

const PRICE_OPTIONS: { key: PricePreset; label: string }[] = [
  { key: 'all',  label: 'Tous les prix' },
  { key: 'free', label: 'Gratuit' },
  { key: 'paid', label: 'Payant' },
];

interface Props {
  categories: EventCategory[];
  cities: string[];
  period: PeriodPreset;
  price: PricePreset;
  onChange: (next: { categories?: EventCategory[]; cities?: string[]; period?: PeriodPreset; price?: PricePreset }) => void;
  onReset: () => void;
  onClose?: () => void; // Drawer mobile
}

export function SearchFilters({
  categories,
  cities,
  period,
  price,
  onChange,
  onReset,
  onClose,
}: Props) {
  const toggleCategoryGroup = (keys: EventCategory[]) => {
    const active = keys.some((key) => categories.includes(key));
    const next = active
      ? categories.filter((key) => !keys.includes(key))
      : Array.from(new Set([...categories, ...keys]));
    onChange({ categories: next });
  };

  const toggleCity = (city: string) => {
    const next = cities.includes(city)
      ? cities.filter((c) => c !== city)
      : [...cities, city];
    onChange({ cities: next });
  };

  const activeCount =
    CATEGORY_GROUPS.filter((group) => group.keys.some((key) => categories.includes(key))).length + cities.length + (period !== 'all' ? 1 : 0) + (price !== 'all' ? 1 : 0);

  return (
    <aside className="bg-[#21132b] border border-white/10 rounded-2xl p-4 lg:p-5 lg:sticky lg:top-24 w-full lg:w-[280px] shrink-0 max-h-[calc(100vh-7rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#5a386a_#21132b] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-[#21132b] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#5a386a] hover:[&::-webkit-scrollbar-thumb]:bg-[#ff791f]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-extrabold text-white text-lg">Filtres</h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Réinitialiser
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-white/10 rounded-full"
              aria-label="Fermer les filtres"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          )}
        </div>
      </div>

      {/* Période */}
      <section className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Période</h4>
        <div className="space-y-1">
          {PERIOD_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2.5 py-1 cursor-pointer group"
            >
              <input
                type="radio"
                name="period"
                checked={period === opt.key}
                onChange={() => onChange({ period: opt.key })}
                className="w-4 h-4 accent-[#ff791f] cursor-pointer"
              />
              <span className="text-sm text-white/75 group-hover:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Prix */}
      <section className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Prix</h4>
        <div className="space-y-1">
          {PRICE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2.5 py-1 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={price === opt.key}
                onChange={() => onChange({ price: opt.key })}
                className="w-4 h-4 accent-[#ff791f] cursor-pointer"
              />
              <span className="text-sm text-white/75 group-hover:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
          Catégories {categories.length > 0 && <span className="text-orange">({CATEGORY_GROUPS.filter((group) => group.keys.some((key) => categories.includes(key))).length})</span>}
        </h4>
        <div className="space-y-1">
          {CATEGORY_GROUPS.map((group) => {
            const selected = group.keys.every((key) => categories.includes(key));
            const partiallySelected = !selected && group.keys.some((key) => categories.includes(key));
            return (
              <label key={group.label} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected}
                  ref={(el) => { if (el) el.indeterminate = partiallySelected; }}
                  onChange={() => toggleCategoryGroup(group.keys)}
                  className="w-4 h-4 accent-[#ff791f] rounded cursor-pointer"
                />
                <span className="text-sm text-white/75 group-hover:text-white">{group.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Villes */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
          Villes {cities.length > 0 && <span className="text-orange">({cities.length})</span>}
        </h4>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CITIES.map((city) => {
            const active = cities.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-[#ff791f] text-[#14091f] border-[#ff791f]'
                    : 'bg-[#382044] text-white/75 border-white/20 hover:border-orange/50'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
