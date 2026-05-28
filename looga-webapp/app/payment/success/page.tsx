'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getTicketByReference } from '@/lib/api/payment';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reference, setReference] = useState<string>(() =>
    searchParams.get('reference') ?? searchParams.get('ref') ?? ''
  );

  // Fallback : si Genius Pay ne renvoie pas la reference en query, on la lit
  // depuis sessionStorage (sauvée juste avant la redirection vers checkout).
  useEffect(() => {
    if (!reference && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('looga_last_payment_ref');
      if (stored) setReference(stored);
    }
  }, [reference]);

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const { data: ticket, error } = useQuery({
    queryKey: ['ticket-by-ref', reference],
    queryFn: () => getTicketByReference(reference),
    enabled: !!reference && !timedOut,
    refetchInterval: (query) => {
      const t = query.state.data;
      // Stop polling dès que le ticket atteint un état final (valid, used, expired, cancelled).
      // Continue de poller tant que c'est null ou `pending` (en attente du webhook).
      if (t && t.status !== 'pending') return false;
      return POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false,
  });

  // Si le webhook a marqué le ticket cancelled → redirect vers /payment/error
  useEffect(() => {
    if (ticket?.status === 'cancelled') {
      router.replace(`/payment/error?reference=${encodeURIComponent(reference)}`);
    }
  }, [ticket?.status, reference, router]);

  const isConfirmed = ticket?.status === 'valid' || ticket?.status === 'used';
  const hasReference = !!reference;
  const isPolling = hasReference && !isConfirmed && !timedOut && !error;

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 px-6 py-10 text-center">
          {!hasReference ? (
            <>
              <Clock className="w-14 h-14 text-orange mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-gray-900 mb-2">Référence manquante</h1>
              <p className="text-sm text-gray-500 mb-8">
                Impossible de retrouver ton paiement. Vérifie tes billets dans ton espace.
              </p>
              <Link
                href="/tickets"
                className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
              >
                Voir mes billets
              </Link>
            </>
          ) : isConfirmed && ticket ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Paiement confirmé 🎉</h1>
              <p className="text-sm text-gray-500 mb-2">
                Ton billet pour <strong className="text-gray-900">{ticket.eventName}</strong> est prêt.
              </p>
              <p className="text-xs text-gray-400 mb-8">
                Référence : {reference}
              </p>
              <Link
                href="/tickets"
                className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
              >
                Voir mes billets
              </Link>
            </>
          ) : timedOut ? (
            <>
              <Clock className="w-14 h-14 text-orange mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-gray-900 mb-2">Paiement en cours de traitement</h1>
              <p className="text-sm text-gray-500 mb-8">
                Ton paiement a été reçu, mais la confirmation prend plus de temps que prévu. Ton billet apparaîtra dans ton espace dès que c&apos;est validé.
              </p>
              <Link
                href="/tickets"
                className="inline-block bg-orange text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors"
              >
                Voir mes billets
              </Link>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
              <h1 className="text-lg font-bold text-gray-900 mb-2">Vérification du paiement…</h1>
              <p className="text-sm text-gray-500">
                Ne ferme pas cette page. Ton billet est en cours de génération.
              </p>
              {isPolling && (
                <p className="text-xs text-gray-400 mt-4">Référence : {reference}</p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  );
}
