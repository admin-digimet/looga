'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'Le paiement a été annulé. Tu peux réessayer quand tu veux.',
  failed: 'Le paiement a échoué. Vérifie ton solde ou tente une autre méthode.',
  insufficient_funds: 'Solde insuffisant. Recharge ton compte mobile money ou utilise une autre méthode.',
  card_declined: 'Ta carte a été refusée. Tente une autre carte ou un mobile money.',
  expired: 'La session de paiement a expiré. Recommence l’achat.',
  validation_error: 'Données de paiement invalides. Recommence depuis la page de l’événement.',
  default: 'Le paiement n’a pas pu aboutir. Réessaie ou contacte le support si le problème persiste.',
};

function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('ref') ?? '';
  const code = searchParams.get('error_code') ?? searchParams.get('code') ?? 'default';
  const eventId = searchParams.get('eventId') ?? searchParams.get('event_id') ?? '';

  const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default;

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 px-6 py-10 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Paiement non abouti</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          {reference && (
            <p className="text-xs text-gray-400 mb-8">Référence : {reference}</p>
          )}

          <div className="space-y-3">
            {eventId ? (
              <button
                onClick={() => router.push(`/events/${eventId}`)}
                className="w-full bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
              >
                Réessayer l&apos;achat
              </button>
            ) : (
              <Link
                href="/"
                className="block w-full bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            )}
            <Link
              href="/tickets"
              className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Voir mes billets
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange animate-spin" />
          </main>
          <Footer />
        </>
      }
    >
      <PaymentErrorContent />
    </Suspense>
  );
}
