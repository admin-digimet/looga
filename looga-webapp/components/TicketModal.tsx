'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Minus, Plus, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { usePurchase } from '@/hooks/usePurchase';
import { formatPrice } from '@/lib/utils';
import type { Event, TicketType, PaymentMethod } from '@/types';
import type { AxiosError } from 'axios';

interface Props {
  event: Event;
  onClose: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'mtn_momo',      label: 'MTN MoMo',      icon: '🟡' },
  { id: 'orange_money',  label: 'Orange Money',   icon: '🟠' },
  { id: 'wave',          label: 'Wave',            icon: '🔵' },
  { id: 'card',          label: 'Carte bancaire',  icon: '💳' },
];

const MOBILE_MONEY_IDS: PaymentMethod[] = ['mtn_momo', 'orange_money', 'wave'];

type Step = 'select' | 'payment' | 'success';

export function TicketModal({ event, onClose }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const purchaseMutation = usePurchase();

  const availableTypes = event.ticketTypes.filter((t) => !t.soldOut);

  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<TicketType | null>(
    availableTypes[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');

  const total = selectedType ? selectedType.price * quantity : 0;
  const serviceFee = Math.round(total * 0.05);
  const grandTotal = total + serviceFee;

  const getErrorMessage = (error: unknown): string => {
    const e = error as AxiosError<any>;
    const status = e?.response?.status;
    if (status === 422) {
      const errors = e.response?.data?.errors;
      if (errors) return Object.values(errors).flat().join(' ');
      return e.response?.data?.message ?? 'Données invalides.';
    }
    if (!e?.response) return 'Impossible de se connecter. Vérifiez votre connexion internet.';
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  const handleConfirm = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return;
    }
    if (!selectedType) return;

    purchaseMutation.mutate(
      {
        eventId: event.id,
        ticketTypeId: selectedType.id,
        quantity,
        paymentMethod,
        phoneNumber: MOBILE_MONEY_IDS.includes(paymentMethod) ? phoneNumber : undefined,
      },
      {
        onSuccess: () => setStep('success'),
      }
    );
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-lg">
            {step === 'success' ? 'Réservation confirmée 🎉' : 'Obtenir des billets'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ========= STEP: SUCCESS ========= */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center px-6 py-12">
              <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Paiement confirmé !</h3>
              <p className="text-gray-500 mb-2">
                Votre billet pour <strong>{event.name}</strong> a bien été enregistré.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Vous pouvez retrouver votre QR code dans la section Mes Billets.
              </p>
              <button
                onClick={() => { onClose(); router.push('/tickets'); }}
                className="w-full bg-orange text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-colors mb-3"
              >
                Voir mes billets
              </button>
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Continuer à explorer
              </button>
            </div>
          )}

          {/* ========= STEP: SELECT ========= */}
          {step === 'select' && (
            <div className="px-6 py-5 space-y-6">
              {/* Event recap */}
              <div className="flex gap-3 items-center bg-gray-50 rounded-xl p-4">
                {event.image && (
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
                  <p className="text-sm font-bold text-gray-700 mb-3">Choisissez votre billet</p>
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
                              {formatPrice(tt.price)}
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
            </div>
          )}

          {/* ========= STEP: PAYMENT ========= */}
          {step === 'payment' && (
            <div className="px-6 py-5 space-y-6">
              {/* Recap */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{selectedType?.name} × {quantity}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de service (5%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-orange text-base">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Mode de paiement</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === pm.id
                          ? 'border-orange bg-orange/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <span className="text-xs font-semibold text-gray-700 text-center">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number for mobile money */}
              {MOBILE_MONEY_IDS.includes(paymentMethod) && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange transition"
                  />
                </div>
              )}

              {/* Auth warning */}
              {!isAuthenticated && (
                <div className="bg-orange/10 border border-orange/30 rounded-xl p-4 text-sm text-orange-700">
                  Vous devez être connecté pour finaliser l&apos;achat.
                </div>
              )}

              {/* Error */}
              {purchaseMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {getErrorMessage(purchaseMutation.error)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-2">
            {step === 'select' ? (
              <button
                onClick={() => setStep('payment')}
                disabled={!selectedType || availableTypes.length === 0}
                className="w-full bg-orange text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continuer <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={purchaseMutation.isPending}
                  className="w-full bg-orange text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {purchaseMutation.isPending
                    ? 'Traitement en cours…'
                    : isAuthenticated
                    ? `Confirmer & Payer — ${formatPrice(grandTotal)}`
                    : 'Se connecter pour payer'}
                </button>
                <button
                  onClick={() => { setStep('select'); purchaseMutation.reset(); }}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
