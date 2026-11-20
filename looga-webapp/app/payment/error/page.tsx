'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock3, Loader2, ShieldAlert, Ticket, Compass } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { getTicketByReference } from '@/lib/api/payment';

// Ces motifs viennent du retour navigateur du prestataire : ils ne prouvent
// PAS, à eux seuls, qu'une transaction a définitivement échoué.
const REPORTED_ERRORS: Record<string, { title: string; message: string }> = {
  cancelled: { title: 'Paiement annulé', message: 'Tu as interrompu le paiement.' },
  failed: { title: 'Le paiement a échoué', message: 'Le prestataire a signalé un échec de paiement.' },
  insufficient_funds: { title: 'Solde insuffisant', message: 'Le prestataire a signalé un solde insuffisant.' },
  card_declined: { title: 'Carte refusée', message: 'Le prestataire a signalé un refus de la carte.' },
  expired: { title: 'Session de paiement expirée', message: 'La session de paiement semble avoir expiré.' },
  validation_error: { title: 'Informations de paiement invalides', message: 'Certaines informations de paiement semblent incorrectes.' },
  default: { title: "Le paiement n'a pas abouti", message: 'Le prestataire a signalé un problème de paiement.' },
};

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

function PaymentErrorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const queryReference = params.get('reference') ?? params.get('ref') ?? '';
  const [reference, setReference] = useState(queryReference);
  const code = params.get('error_code') ?? params.get('code') ?? 'default';
  const reported = Object.prototype.hasOwnProperty.call(REPORTED_ERRORS, code)
    ? REPORTED_ERRORS[code]
    : REPORTED_ERRORS.default;

  useEffect(() => {
    if (queryReference) {
      setReference(queryReference);
      return;
    }
    // Même secours que sur /payment/success.
    setReference(sessionStorage.getItem('looga_last_payment_ref') ?? '');
  }, [queryReference]);

  const { data: ticket, isFetching, isError } = useQuery({
    queryKey: ['ticket-by-ref', reference],
    queryFn: () => getTicketByReference(reference),
    enabled: Boolean(reference),
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Un billet confirmé suffit à empêcher d'annoncer un échec.
      if (status === 'valid' || status === 'used') return false;
      // Une annulation / expiration de billet ne suffit PAS à prouver
      // l'échec de la transaction financière : continuer à vérifier.
      return 5_000;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if ((ticket?.status === 'valid' || ticket?.status === 'used') && reference) {
      router.replace(`/payment/success?reference=${encodeURIComponent(reference)}`);
    }
  }, [ticket?.status, reference, router]);

  // IMPORTANT : getTicketByReference renvoie un statut de BILLET, pas
  // une preuve définitive de paiement échoué. Sans API de statut de
  // transaction vérifié côté serveur, on NE propose PAS de réessayer.
  const confirmed = ticket?.status === 'valid' || ticket?.status === 'used';

  return (
    <PageFrame>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#492735]">
        {confirmed || (reference && isFetching && !ticket) ? (
          <Loader2 className="h-9 w-9 animate-spin text-[#ff791f]" aria-hidden="true" />
        ) : (
          <Clock3 className="h-9 w-9 text-[#ff9a5a]" aria-hidden="true" />
        )}
      </div>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
        {confirmed ? 'Paiement confirmé' : 'Nous vérifions ton paiement'}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#c7b9d0]">
        {confirmed
          ? 'Ton billet est confirmé. Tu vas être redirigé vers la confirmation.'
          : "Nous ne pouvons pas encore confirmer le statut de ton paiement. Si ton compte a été débité, évite de recommencer le paiement."}
      </p>

      {!confirmed && (
        <div className="mt-6 rounded-xl border border-[#59435f] bg-[#352440] p-4 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#ff791f]" aria-hidden="true" />
            Avant de réessayer
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#c7b9d0]">
            Consulte d'abord « Mes billets » pour vérifier ta réservation. Le retour du prestataire ne suffit pas à confirmer un échec définitif.
          </p>
          {code !== 'default' && (
            <p className="mt-3 text-xs leading-relaxed text-[#c7b9d0]">
              <span className="font-semibold text-white">Information signalée : {reported.title}.</span> {reported.message}
            </p>
          )}
          {isError && (
            <p className="mt-2 flex items-start gap-2 text-xs text-[#ffb49c]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              La vérification est momentanément indisponible.
            </p>
          )}
        </div>
      )}

      {reference && <p className="mt-5 break-all text-xs text-[#9f8eb0]">Référence : {reference}</p>}
      <div className="mt-7 space-y-3">
        <Link href="/tickets" className={primaryButton}>
          <Ticket className="h-4 w-4" aria-hidden="true" /> Voir mes billets
        </Link>
        <Link href="/" className={secondaryButton}>
          <Compass className="h-4 w-4" aria-hidden="true" /> Découvrir d'autres événements
        </Link>
      </div>
      {!confirmed && (
        <p className="mt-5 text-xs leading-relaxed text-[#9f8eb0]">
          Le bouton « Réessayer l'achat » sera disponible une fois l'échec confirmé par le service de paiement.
        </p>
      )}
    </PageFrame>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <PageFrame>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#ff791f]" aria-label="Chargement" />
      </PageFrame>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}
