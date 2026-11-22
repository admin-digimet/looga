'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, ChevronDown, Minus, Plus, Loader2, Info, LockKeyhole, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useInitPayment, useInitFreeTicket } from '@/hooks/usePurchase';
import { formatPrice } from '@/lib/utils';
import type { Event, TicketType } from '@/types';
import type { AxiosError } from 'axios';

interface Props { event: Event; onClose: () => void; }
type Step = 'select' | 'payment' | 'redirecting';

export function TicketModal({ event, onClose }: Props) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const initPaymentMutation = useInitPayment();
  const initFreeTicketMutation = useInitFreeTicket();
  const availableTypes = event.ticketTypes.filter((type) => !type.soldOut);
  const [step, setStep] = useState<Step>('select');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(availableTypes[0]?.id ?? null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const selectedType: TicketType | null = event.ticketTypes.find((type) => type.id === selectedTypeId && !type.soldOut) ?? null;
  const quantity = selectedType ? (quantities[selectedType.id] ?? 1) : 0;
  const total = selectedType ? selectedType.price * quantity : 0;
  // This mirrors the existing payment initiation calculation; the provider/server remains authoritative.
  const serviceFee = total > 0 ? Math.round(total * 0.02) : 0;
  const grandTotal = total + serviceFee;
  const isFree = total === 0;
  const isPending = initPaymentMutation.isPending || initFreeTicketMutation.isPending;
  const error = initPaymentMutation.error ?? initFreeTicketMutation.error;

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isPending) onClose(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isPending, onClose]);

  function setActiveQuantity(type: TicketType, next: number) {
    if (type.soldOut || isPending) return;
    setSelectedTypeId(type.id);
    setQuantities((previous) => ({ ...previous, [type.id]: Math.max(1, Math.min(10, next)) }));
  }

  const handleSessionMaybeExpired = (err: unknown): boolean => {
    if ((err as AxiosError)?.response?.status !== 401) return false;
    void logout();
    router.push(`/auth/login?redirect=/events/${event.id}`);
    return true;
  };

  const getErrorMessage = (err: unknown): string => {
    const e = err as AxiosError<{ message?: string; error?: { message?: string } }>;
    const status = e?.response?.status;
    if (status === 401) return 'Session expirée. Reconnecte-toi puis réessaie.';
    if (status === 422) return e.response?.data?.message ?? 'Données invalides.';
    if (status === 409) return 'Stock épuisé pour ce billet.';
    if (e?.response?.data?.error?.message) return e.response.data.error.message;
    if (e?.response?.data?.message) return e.response.data.message;
    if (!e?.response) return 'Impossible de se connecter. Vérifie ta connexion internet.';
    return 'Une erreur est survenue. Réessaie.';
  };

  const handleContinue = () => {
    if (!selectedType || isPending) return;
    if (isFree) { void handleSubmit(); return; }
    setStep('payment');
  };

  const handleSubmit = async () => {
    if (!selectedType || isPending) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return;
    }
    const payload = { eventId: event.id, ticketTypeId: selectedType.id, quantity };
    setStep('redirecting');
    if (isFree) {
      initFreeTicketMutation.mutate(payload, {
        onSuccess: () => { onClose(); router.push('/tickets'); },
        onError: (err) => { setStep('select'); handleSessionMaybeExpired(err); },
      });
    } else {
      initPaymentMutation.mutate(payload, {
        onSuccess: ({ checkoutUrl, reference }) => {
          if (reference) sessionStorage.setItem('looga_last_payment_ref', reference);
          window.location.href = checkoutUrl;
        },
        onError: (err) => { setStep('payment'); handleSessionMaybeExpired(err); },
      });
    }
  };

  const outlineButton = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#594568] text-white transition hover:border-[#FF5C1A] disabled:cursor-not-allowed disabled:opacity-40';
  const recap = (
    <div className="space-y-2.5 text-sm">
      <div className="flex items-center justify-between gap-3"><span className="text-[#C7B7D0]">{selectedType?.name} × {quantity}</span><span className="font-semibold text-white">{formatPrice(total)}</span></div>
      {serviceFee > 0 && <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1 text-[#C7B7D0]">Frais de service (2 %) <span title="Frais estimés selon le calcul actuel du paiement. Le serveur confirme le montant à débiter."><Info className="h-3.5 w-3.5" aria-label="Information sur les frais" /></span></span><span className="text-white">{formatPrice(serviceFee)}</span></div>}
      <div className="flex items-center justify-between border-t border-[#574165] pt-3"><span className="font-bold text-white">Total</span><span className="font-extrabold text-[#FF5C1A]">{formatPrice(grandTotal)}</span></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:px-4" onClick={(e) => { if (e.target === e.currentTarget && !isPending) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Choix des billets" className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-[#4A3657] bg-[#160B23] text-white shadow-2xl sm:max-w-xl sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#3F2C4C] px-5 py-4 sm:px-6">
          <div><h2 className="font-heading text-xl font-extrabold">Obtenir des billets</h2><p className="mt-1 text-xs text-[#BDAFC8]">Billets <span className="mx-1 text-[#FF5C1A]">→</span> Paiement <span className="mx-1 text-[#FF5C1A]">→</span> Confirmation</p></div>
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-full p-2 text-[#D0C4D8] hover:bg-[#30203D] disabled:opacity-50" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === 'redirecting' ? (
            <div className="flex flex-col items-center py-14 text-center"><Loader2 className="mb-5 h-12 w-12 animate-spin text-[#FF5C1A]"/><h3 className="text-lg font-bold">{isFree ? 'Création du billet…' : 'Préparation du paiement…'}</h3><p className="mt-2 text-sm text-[#BDAFC8]">{isFree ? 'Ton billet est en cours de génération.' : 'Tu vas être redirigé vers le paiement proposé par notre prestataire.'}</p></div>
          ) : (
            <div className="space-y-5">
              {step === 'payment' && <button type="button" onClick={() => setStep('select')} className="flex items-center gap-2 text-sm text-[#FF5C1A]"><ChevronLeft className="h-4 w-4"/>Modifier mes billets</button>}
              <div className="flex items-center gap-3 rounded-2xl border border-[#483451] bg-[#24152F] p-3">
                {event.image && <img src={event.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
                <div className="min-w-0"><p className="truncate font-bold">{event.name}</p><p className="mt-1 truncate text-xs text-[#BDAFC8]">{event.location}</p></div>
              </div>
              {step === 'select' ? <>
                <div><h3 className="mb-3 font-heading text-base font-bold">Choisis tes billets</h3>
                  <div className="space-y-3">
                    {event.ticketTypes.map((type) => {
                      const active = selectedTypeId === type.id && !type.soldOut;
                      const count = active ? quantity : 0;
                      return <div key={type.id} className={`rounded-2xl border p-4 transition-colors ${type.soldOut ? 'border-[#46354F] bg-[#21182B] opacity-60' : active ? 'border-[#FF5C1A] bg-[#2C1B37]' : 'border-[#493752] bg-[#251731]'}`}>
                        <button type="button" disabled={type.soldOut || isPending} onClick={() => setActiveQuantity(type, quantities[type.id] ?? 1)} className="flex w-full items-start justify-between gap-4 text-left disabled:cursor-not-allowed" aria-pressed={active}>
                          <div className="min-w-0"><p className="font-heading font-bold">{type.name}</p>{type.description && <p className="mt-1 text-xs text-[#BDAFC8]">{type.description}</p>}{type.advantages && <p className="mt-1.5 text-xs text-[#FFB08E]">{type.advantages}</p>}</div>
                          <div className="shrink-0 text-right"><p className={`font-extrabold ${type.price === 0 ? 'text-[#FF5C1A]' : 'text-white'}`}>{type.price === 0 ? 'Gratuit' : formatPrice(type.price)}</p>{type.soldOut && <span className="mt-1 block text-xs text-[#D0C2D8]">Épuisé</span>}</div>
                        </button>
                        {!type.soldOut && <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#493752] pt-3"><span className="text-xs text-[#BDAFC8]">Quantité {active ? `· Sous-total : ${formatPrice(type.price * count)}` : ''}</span><div className="flex items-center gap-2"><button type="button" className={outlineButton} disabled={!active || count <= 1 || isPending} onClick={() => setActiveQuantity(type, count - 1)} aria-label={`Retirer un billet ${type.name}`}><Minus className="h-4 w-4"/></button><span className="w-6 text-center font-bold tabular-nums">{count}</span><button type="button" className={outlineButton} disabled={isPending || (active && count >= 10)} onClick={() => setActiveQuantity(type, count + 1 || 1)} aria-label={`Ajouter un billet ${type.name}`}><Plus className="h-4 w-4"/></button></div></div>}
                      </div>;
                    })}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#BAABCA]">Pour le moment, une seule catégorie peut être réservée par transaction. La sélection de plusieurs catégories sera proposée après vérification du système.</p>
                </div>
                {availableTypes.length === 0 && <p className="rounded-xl bg-[#2F2038] p-4 text-sm">Tous les billets sont épuisés.</p>}
                {selectedType && <div className="hidden rounded-2xl border border-[#493752] bg-[#251731] p-4 sm:block"><h3 className="mb-3 font-bold">Récapitulatif</h3>{recap}</div>}
              </> : <>
                <div className="rounded-2xl border border-[#493752] bg-[#251731] p-4"><h3 className="mb-3 font-heading font-bold">Récapitulatif de ta réservation</h3>{recap}</div>
                <div className="rounded-2xl border border-[#493752] bg-[#251731] p-4"><h3 className="mb-2 font-heading font-bold">Paiement</h3><div className="flex items-center justify-between gap-3 rounded-xl border border-[#FF5C1A] bg-[#35213D] p-3"><div><p className="font-semibold">Paiement via notre prestataire</p><p className="mt-1 text-xs text-[#BDAFC8]">Choisis ton moyen de paiement sur la page sécurisée du prestataire.</p></div><Check className="h-5 w-5 shrink-0 text-[#FF5C1A]" /></div></div>
                <p className="text-xs leading-relaxed text-[#BDAFC8]">Le montant final est calculé selon les règles actuelles. Vérifie le montant présenté par le prestataire avant de confirmer.</p>
              </>}
              {!isAuthenticated && <p className="rounded-xl border border-[#FF5C1A]/40 bg-[#FF5C1A]/10 p-3 text-sm text-[#FFB08E]">Tu dois être connecté pour finaliser la réservation.</p>}
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{getErrorMessage(error)}</p>}
            </div>
          )}
        </div>
        {step !== 'redirecting' && <div className="shrink-0 border-t border-[#493752] bg-[#1D1128] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          {step === 'select' && selectedType && <button type="button" onClick={() => setExpanded(!expanded)} className="mb-3 flex w-full items-center justify-between text-left text-sm" aria-expanded={expanded}><span className="font-medium">{quantity} billet{quantity > 1 ? 's' : ''} · <span className="text-[#FF5C1A] font-bold">{formatPrice(grandTotal)}</span></span><span className="flex items-center gap-1 text-[#BDAFC8]">Détails <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}/></span></button>}
          {step === 'select' && expanded && selectedType && <div className="mb-3 rounded-xl bg-[#2C1B37] p-3">{recap}</div>}
          <button type="button" onClick={step === 'select' ? handleContinue : () => void handleSubmit()} disabled={!selectedType || isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-4 py-3 font-bold text-white hover:bg-[#F15313] disabled:cursor-not-allowed disabled:opacity-45">
            {!isAuthenticated ? 'Se connecter pour continuer' : step === 'payment' ? <> <LockKeyhole className="h-4 w-4"/> Payer {formatPrice(grandTotal)}</> : isFree ? 'Obtenir le billet gratuit' : 'Réserver'}
            {step === 'select' && <ChevronRight className="h-4 w-4"/>}
          </button>
        </div>}
      </div>
    </div>
  );
}
