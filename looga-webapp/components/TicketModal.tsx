'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useInitPayment, useInitFreeTicket } from '@/hooks/usePurchase';
import { formatPrice } from '@/lib/utils';
import type { Event, TicketType } from '@/types';
import type { AxiosError } from 'axios';

interface Props {
  event: Event;
  onClose: () => void;
}

type Step = 'select' | 'redirecting';

export function TicketModal({ event, onClose }: Props) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const initPaymentMutation = useInitPayment();
  const initFreeTicketMutation = useInitFreeTicket();

  // Session vraiment expirée (refresh impossible) → déconnexion propre +
  // redirection login. Renvoie true si c'était bien un cas 401.
  const handleSessionMaybeExpired = (err: unknown): boolean => {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401) {
      void logout();
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return true;
    }
    return false;
  };

  const availableTypes = event.ticketTypes.filter((t) => !t.soldOut);

  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<TicketType | null>(
    availableTypes[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const total = selectedType ? selectedType.price * quantity : 0;
  // Frais de service 2% (spec) — doit correspondre EXACTEMENT au montant débité
  // par l'Edge Function /payment/init (base + Math.round(base * 0.02)).
  const serviceFee = total > 0 ? Math.round(total * 0.02) : 0;
  const grandTotal = total + serviceFee;
  const isFree = total === 0;

  const isPending = initPaymentMutation.isPending || initFreeTicketMutation.isPending;
  const error = initPaymentMutation.error ?? initFreeTicketMutation.error;

  const getErrorMessage = (err: unknown): string => {
    const e = err as AxiosError<{ message?: string; error?: { message?: string } }>;
    const status = e?.response?.status;
    if (status === 401) return 'Session expirée. Reconnecte-toi puis réessaie.';
    if (status === 422) {
      return e.response?.data?.message ?? 'Données invalides.';
    }
    if (status === 409) return 'Stock épuisé pour ce billet.';
    if (e?.response?.data?.error?.message) return e.response.data.error.message;
    if (e?.response?.data?.message) return e.response.data.message;
    if (!e?.response) return 'Impossible de se connecter. Vérifie ta connexion internet.';
    return 'Une erreur est survenue. Réessaie.';
  };

  const handleContinue = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return;
    }
    if (!selectedType) return;

    setStep('redirecting');

    const payload = {
      eventId: event.id,
      ticketTypeId: selectedType.id,
      quantity,
    };

    if (isFree) {
      initFreeTicketMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
          router.push('/tickets');
        },
        onError: (err) => {
          setStep('select');
          handleSessionMaybeExpired(err);
        },
      });
    } else {
      initPaymentMutation.mutate(payload, {
        onSuccess: ({ checkoutUrl, reference }) => {
          if (reference) sessionStorage.setItem('looga_last_payment_ref', reference);
          window.location.href = checkoutUrl;
        },
        onError: (err) => {
          setStep('select');
          handleSessionMaybeExpired(err);
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-lg">Obtenir des billets</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ========= STEP: REDIRECTING ========= */}
          {step === 'redirecting' && (
            <div className="flex flex-col items-center text-center px-6 py-16">
              <Loader2 className="w-12 h-12 text-orange animate-spin mb-6" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isFree ? 'Création du billet…' : 'Préparation du paiement…'}
              </h3>
              <p className="text-sm text-gray-500">
                {isFree
                  ? 'Ton billet est en cours de génération.'
                  : 'Tu vas être redirigé vers la page de paiement sécurisée.'}
              </p>
            </div>
          )}

          {/* ========= STEP: SELECT ========= */}
          {step === 'select' && (
            <div className="px-6 py-5 space-y-6">
              {/* Event recap */}
              <div className="flex gap-3 items-center bg-gray-50 rounded-xl p-4">
                {event.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.image} alt={event.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{event.name}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>

              {/* Ticket types */}
              {availableTypes.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Tous les billets sont épuisés.</p>
              ) : (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Choisis ton billet</p>
                  <div className="space-y-2">
                    {event.ticketTypes.map((tt) => (
                      <button
                        key={tt.id}
                        disabled={tt.soldOut}
                        onClick={() => setSelectedType(tt)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                          tt.soldOut
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : selectedType?.id === tt.id
                            ? 'border-orange bg-orange/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{tt.name}</p>
                          {tt.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>
                          )}
                          {tt.advantages && (
                            <p className="text-xs text-orange mt-0.5">{tt.advantages}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          {tt.soldOut ? (
                            <span className="text-sm font-bold text-gray-400">Complet</span>
                          ) : (
                            <span className="text-base font-extrabold text-orange">
                              {tt.price === 0 ? 'Gratuit' : formatPrice(tt.price)}
                            </span>
                          )}
                          {!tt.soldOut && selectedType?.id === tt.id && (
                            <div className="mt-1 w-4 h-4 rounded-full border-2 border-orange ml-auto flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-orange" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {selectedType && (
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-700">Quantité</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-extrabold text-xl text-gray-900 w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recap (seulement si payant) */}
              {selectedType && !isFree && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{selectedType.name} × {quantity}</span>
                    <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frais de service (2%)</span>
                    <span className="font-semibold text-gray-900">{formatPrice(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-orange text-base">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Auth warning */}
              {!isAuthenticated && (
                <div className="bg-orange/10 border border-orange/30 rounded-xl p-4 text-sm text-orange-700">
                  Tu dois être connecté pour finaliser l&apos;achat.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {getErrorMessage(error)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer button */}
        {step === 'select' && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleContinue}
              disabled={!selectedType || availableTypes.length === 0 || isPending}
              className="w-full bg-orange text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {!isAuthenticated
                ? 'Se connecter pour continuer'
                : isFree
                ? 'Obtenir le billet gratuit'
                : `Payer ${formatPrice(grandTotal)}`}
              {!isPending && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
