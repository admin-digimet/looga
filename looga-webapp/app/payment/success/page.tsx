'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Clock3, Ticket, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { getTicketByReference } from '@/lib/api/payment';

const POLL_INTERVAL_MS = 2_000;
const LONG_WAIT_MS = 30_000;

const primaryButton = 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff791f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#ff8a3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f]';
const secondaryButton = 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#604968] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#392844] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f]';

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#130b1e] font-sans text-white">
      <PublicHeader />
      <main className="flex w-full flex-1 items-center justify-center px-5 py-12 md:px-8 md:py-20">
        <section className="w-full max-w-[460px] rounded-[24px] border border-[#45314e] bg-[#24172f] px-6 py-9 text-center shadow-xl shadow-black/10 sm:px-9 sm:py-11" aria-live="polite">
          {children}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function TicketLink() {
  return <Link href="/tickets" className={primaryButton}><Ticket className="h-4 w-4" aria-hidden="true" />Voir mes billets</Link>;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryReference = searchParams.get('reference') ?? searchParams.get('ref') ?? '';
  const [reference, setReference] = useState(queryReference);
  const [elapsed, setElapsed] = useState(false);

  // Le prestataire peut revenir sans référence dans l'URL.
  // On conserve le mécanisme de secours existant, stocké avant le checkout.
  useEffect(() => {
    if (queryReference) {
      setReference(queryReference);
      return;
    }
    const stored = sessionStorage.getItem('looga_last_payment_ref');
    setReference(stored ?? '');
  }, [queryReference]);

  useEffect(() => {
    setElapsed(false);
    if (!reference) return;
    const timer = window.setTimeout(() => setElapsed(true), LONG_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [reference]);

  const { data: ticket, error, refetch, isFetching } = useQuery({
    queryKey: ['ticket-by-ref', reference],
    queryFn: () => getTicketByReference(reference),
    enabled: Boolean(reference),
    retry: 1,
    // Le message change après 30 secondes, mais la vérification continue.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'valid' || status === 'used' || status === 'cancelled' || status === 'expired') return false;
      return POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (ticket?.status === 'cancelled' && reference) {
      router.replace(`/payment/error?reference=${encodeURIComponent(reference)}`);
    }
  }, [ticket?.status, reference, router]);

  const confirmed = ticket?.status === 'valid' || ticket?.status === 'used';
  const expired = ticket?.status === 'expired';

  if (!reference) {
    return <>
      <Clock3 className="mx-auto mb-5 h-14 w-14 text-[#ff791f]" aria-hidden="true" />
      <h1 className="font-heading text-2xl font-extrabold">Référence manquante</h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-[#b8a8c9]">Impossible de retrouver la référence de ton paiement. Vérifie tes billets dans ton espace.</p>
      <TicketLink />
    </>;
  }

  if (confirmed && ticket) {
    return <>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#204734]">
        <Check className="h-9 w-9 text-[#71e3a5]" strokeWidth={3} aria-hidden="true" />
      </div>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">Paiement confirmé !</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#c7b9d0]">
        C&apos;est dans la poche ! Ton billet pour <strong className="text-white">{ticket.eventName}</strong> est prêt.
      </p>
      <div className="mt-6 rounded-xl bg-[#352440] p-4 text-left">
        <div className="flex items-center gap-2 text-sm font-semibold text-white"><Ticket className="h-5 w-5 text-[#ff791f]" aria-hidden="true" />Ton billet est disponible</div>
        <p className="mt-2 text-xs leading-relaxed text-[#b8a8c9]">Retrouve ton billet et son QR code dans « Mes billets ».</p>
      </div>
      <div className="mt-6 space-y-3">
        <TicketLink />
        <Link href="/" className={secondaryButton}><Compass className="h-4 w-4" aria-hidden="true" />Découvrir d&apos;autres événements</Link>
      </div>
      <p className="mt-6 break-all text-xs text-[#9f8eb0]">Référence : {reference}</p>
    </>;
  }

  if (expired) {
    return <>
      <AlertCircle className="mx-auto mb-5 h-14 w-14 text-[#ff791f]" aria-hidden="true" />
      <h1 className="font-heading text-xl font-extrabold">Billet expiré</h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-[#b8a8c9]">Le billet associé à cette référence est expiré. Consulte « Mes billets » pour vérifier son statut.</p>
      <TicketLink />
    </>;
  }

  if (ticket?.status === 'cancelled') {
    return <>
      <Loader2 className="mx-auto mb-4 h-11 w-11 animate-spin text-[#ff791f]" aria-hidden="true" />
      <p className="text-sm text-[#b8a8c9]">Redirection vers le suivi de ton paiement…</p>
    </>;
  }

  if (elapsed) {
    return <>
      <Clock3 className="mx-auto mb-5 h-14 w-14 text-[#ff791f]" aria-hidden="true" />
      <h1 className="font-heading text-xl font-extrabold leading-snug">La confirmation prend un peu plus de temps…</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#b8a8c9]">Nous vérifions toujours ton paiement. Tu peux consulter « Mes billets » pour suivre sa confirmation. Évite de recommencer le paiement tant que son statut n&apos;est pas clarifié.</p>
      <div className="mt-6"><TicketLink /></div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9f8eb0]"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Vérification toujours en cours</p>
      <p className="mt-3 break-all text-xs text-[#9f8eb0]">Référence : {reference}</p>
    </>;
  }

  return <>
    {error && !isFetching ? <AlertCircle className="mx-auto mb-5 h-12 w-12 text-[#ff791f]" aria-hidden="true" /> : <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-[#ff791f]" aria-hidden="true" />}
    <h1 className="font-heading text-xl font-extrabold">Vérification du paiement…</h1>
    <p className="mt-3 text-sm leading-relaxed text-[#b8a8c9]">Nous attendons la confirmation de ton paiement avant de rendre ton billet disponible.</p>
    {error && <button type="button" onClick={() => void refetch()} className={`${secondaryButton} mt-5`}><RefreshCw className="h-4 w-4" aria-hidden="true" />Réessayer la vérification</button>}
    <p className="mt-5 break-all text-xs text-[#9f8eb0]">Référence : {reference}</p>
  </>;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageFrame><Loader2 className="mx-auto h-12 w-12 animate-spin text-[#ff791f]" aria-label="Chargement" /></PageFrame>}>
      <PageFrame><PaymentSuccessContent /></PageFrame>
    </Suspense>
  );
}
