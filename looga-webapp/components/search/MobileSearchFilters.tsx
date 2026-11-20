'use client';

import { X, RotateCcw } from 'lucide-react';
import type { EventCategory } from '@/types';
import type { PeriodPreset, PricePreset } from '@/lib/api/events';
import { CATEGORY_GROUPS } from './SearchFilters';

const periods: { value: PeriodPreset; label: string }[] = [
  { value: 'all', label: 'À tout moment' }, { value: 'today', label: "Aujourd’hui" },
  { value: 'tonight', label: 'Ce soir' }, { value: 'week', label: 'Cette semaine' },
  { value: 'weekend', label: 'Ce week-end' },
];
const prices: { value: PricePreset; label: string }[] = [
  { value: 'all', label: 'Tous les prix' }, { value: 'free', label: 'Gratuit' }, { value: 'paid', label: 'Payant' },
];
const cities = ['Abidjan', 'Grand-Bassam', 'Assinie'];
type Filters = { categories: EventCategory[]; cities: string[]; period: PeriodPreset; price: PricePreset };
type Props = Filters & { onChange: (patch: Partial<Filters>) => void; onReset: () => void; onClose: () => void; onApply: () => void };
const basePill = 'rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors min-h-11';
const pill = (active: boolean) => `${basePill} ${active ? 'border-[#FF5C1A] bg-[#FF5C1A] text-white' : 'border-white/15 bg-[#382044] text-white/80 hover:border-[#FF5C1A]/60'}`;

export function MobileSearchFilters({ categories, cities: selectedCities, period, price, onChange, onReset, onClose, onApply }: Props) {
  const toggleGroup = (keys: EventCategory[]) => {
    const allSelected = keys.every((key) => categories.includes(key));
    onChange({ categories: allSelected ? categories.filter((key) => !keys.includes(key)) : [...new Set([...categories, ...keys])] });
  };
  const toggleCity = (city: string) => onChange({ cities: selectedCities.includes(city) ? selectedCities.filter((c) => c !== city) : [...selectedCities, city] });
  return (
    <>
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/25" aria-hidden="true" />
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h3 className="font-heading text-xl font-extrabold text-white">Filtres</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-xs text-[#FF5C1A]"><RotateCcw size={13}/> Réinitialiser</button>
          <button type="button" onClick={onClose} aria-label="Fermer les filtres" className="rounded-full p-2 text-white/75 hover:bg-white/10"><X size={20}/></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
        <section><h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Période</h4><div className="flex flex-wrap gap-2">
          {periods.map((option) => <button key={option.value} type="button" aria-pressed={period === option.value} onClick={() => onChange({ period: option.value })} className={pill(period === option.value)}>{option.label}</button>)}
        </div></section>
        <section><h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Prix</h4><div className="flex flex-wrap gap-2">
          {prices.map((option) => <button key={option.value} type="button" aria-pressed={price === option.value} onClick={() => onChange({ price: option.value })} className={pill(price === option.value)}>{option.label}</button>)}
        </div></section>
        <section><h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Catégories</h4><div className="flex flex-wrap gap-2">
          {CATEGORY_GROUPS.map((group) => { const active = group.keys.every((key) => categories.includes(key)); return <button key={group.label} type="button" aria-pressed={active} onClick={() => toggleGroup(group.keys)} className={pill(active)}>{group.label}</button>; })}
        </div></section>
        <section><h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Villes</h4><div className="flex flex-wrap gap-2">
          {cities.map((city) => <button key={city} type="button" aria-pressed={selectedCities.includes(city)} onClick={() => toggleCity(city)} className={pill(selectedCities.includes(city))}>{city}</button>)}
        </div></section>
      </div>
      <div className="shrink-0 border-t border-white/10 bg-[#21132b] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button type="button" onClick={onApply} className="min-h-12 w-full rounded-xl bg-[#FF5C1A] px-5 py-3 font-bold text-white hover:bg-[#FF7438]">Afficher les résultats</button>
      </div>
    </>
  );
}
