'use client';

import { X, RotateCcw } from 'lucide-react';
import type { EventCategory } from '@/types';
import type { PricePreset, PeriodPreset } from '@/lib/api/events';

const ALL_CATEGORIES: { key: EventCategory; label: string }[] = [
  { key: 'concerts',    label: 'Concerts & Musique' },
  { key: 'soirees',     label: 'Soirées & Fêtes' },
  { key: 'culture',     label: 'Culture & Arts' },
  { key: 'sports',      label: 'Sports & Fitness' },
  { key: 'workshops',   label: 'Ateliers & Formation' },
  { key: 'gastronomie', label: 'Gastronomie & Food' },
  { key: 'conferences', label: 'Conférences & Séminaires' },
  { key: 'networking',  label: 'Networking & Business' },
  { key: 'mode',        label: 'Mode & Lifestyle' },
  { key: 'famille',     label: 'Famille & Loisirs' },
  { key: 'humour',      label: 'Humour & Stand-up' },
  { key: 'religieux',   label: 'Religieux & Spirituel' },
  { key: 'cinema',      label: 'Cinéma & Séries' },
  { key: 'caritatif',   label: 'Caritatif & Solidaire' },
  { key: 'enfants',     label: 'Enfants & Jeunesse' },
  { key: 'gaming',      label: 'Gaming & E-sport' },
  { key: 'tournee',     label: 'Caravane & Tournée' },
  { key: 'salon',       label: 'Salon & Exposition' },
  { key: 'theatre',     label: 'Théâtre & Spectacle' },
  { key: 'bien_etre',   label: 'Bien-être & Yoga' },
  { key: 'festival',    label: 'Festival & Carnaval' },
  { key: 'auto_moto',   label: 'Auto-Moto & Course' },
  { key: 'autre',       label: 'Autre' },
];

const POPULAR_CITIES = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'Grand-Bassam',
  'San-Pédro', 'Korhogo', 'Daloa', 'Man',
];

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
  const toggleCategory = (cat: EventCategory) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    onChange({ categories: next });
  };

  const toggleCity = (city: string) => {
    const next = cities.includes(city)
      ? cities.filter((c) => c !== city)
      : [...cities, city];
    onChange({ cities: next });
  };

  const activeCount =
    categories.length + cities.length + (period !== 'all' ? 1 : 0) + (price !== 'all' ? 1 : 0);

  return (
    <aside className="bg-white border border-gray-200 rounded-2xl p-5 lg:sticky lg:top-24 w-full lg:w-[280px] shrink-0 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-extrabold text-gray-900 text-lg">Filtres</h3>
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
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full"
              aria-label="Fermer les filtres"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Période */}
      <section className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Période</h4>
        <div className="space-y-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="period"
                checked={period === opt.key}
                onChange={() => onChange({ period: opt.key })}
                className="w-4 h-4 accent-orange cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Prix */}
      <section className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Prix</h4>
        <div className="space-y-1.5">
          {PRICE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={price === opt.key}
                onChange={() => onChange({ price: opt.key })}
                className="w-4 h-4 accent-orange cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Catégories {categories.length > 0 && <span className="text-orange">({categories.length})</span>}
        </h4>
        <div className="space-y-1">
          {ALL_CATEGORIES.map((cat) => (
            <label
              key={cat.key}
              className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={categories.includes(cat.key)}
                onChange={() => toggleCategory(cat.key)}
                className="w-4 h-4 accent-orange rounded cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Villes */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
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
                    ? 'bg-orange text-white border-orange'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange/50'
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
