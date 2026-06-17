'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Tag, ScanLine, Clock, CreditCard, Loader2 } from 'lucide-react';
import { formatEventDate, formatPrice } from '@/lib/utils';
import { getPaymentStatus } from '@/lib/api/payment';
import type { Ticket, TicketStatus } from '@/types';
import { TicketQRModal } from './TicketQRModal';

interface Props {
  ticket: Ticket;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; fg: string; dot: string }> = {
  pending:   { label: 'En attente', bg: 'bg-[#FFB80022]', fg: 'text-[#9A6E00]',     dot: 'bg-[#FFB800]' },
  valid:     { label: 'Valide',     bg: 'bg-[#00C86422]', fg: 'text-[#007A3C]',     dot: 'bg-[#00C864]' },
  used:      { label: 'Utilisé',    bg: 'bg-black/8',     fg: 'text-[#6E6B66]',     dot: 'bg-[#6E6B66]' },
  expired:   { label: 'Expiré',     bg: 'bg-[#FF3B3B22]', fg: 'text-[#B22020]',     dot: 'bg-[#FF3B3B]' },
  cancelled: { label: 'Annulé',     bg: 'bg-black/8',     fg: 'text-[#6E6B66]',     dot: 'bg-[#6E6B66]' },
};

const CATEGORY_LABEL: Record<string, string> = {
  concerts:    'Concerts',
  soirees:     'Soirées',
  culture:     'Culture',
  sports:      'Sports',
  workshops:   'Ateliers',
  gastronomie: 'Gastronomie',
  conferences: 'Conférences',
  networking:  'Networking',
  mode:        'Mode',
  famille:     'Famille',
  humour:      'Humour',
  religieux:   'Religieux',
  cinema:      'Cinéma',
  caritatif:   'Caritatif',
  enfants:     'Enfants',
  gaming:      'Gaming',
  tournee:     'Tournée',
  salon:       'Salon',
  theatre:     'Théâtre',
  bien_etre:   'Bien-être',
  festival:    'Festival',
  auto_moto:   'Auto-Moto',
  autre:       'Événement',
};

export function TicketCard({ ticket }: Props) {
  const [qrOpen, setQrOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const status = STATUS_CONFIG[ticket.status];
  const isInactive = ticket.status === 'expired' || ticket.status === 'cancelled' || ticket.status === 'used';
  const qrValue = ticket.qrCode || ticket.ticketNumber;
  // Le QR n'est présentable à l'entrée que si le paiement est confirmé.
  // Un billet 'pending' (paiement non finalisé) ne doit jamais afficher de QR.
  const showQr = ticket.status === 'valid' || ticket.status === 'used';
  const isPending = ticket.status === 'pending';

  // Reprend le paiement : redirige directement vers le checkout GeniusPay
  // existant (stocké à l'init) plutôt que de relancer le choix du billet.
  async function handleResumePayment() {
    if (resuming) return;
    setResuming(true);
    try {
      if (ticket.paymentRef) {
        const payment = await getPaymentStatus(ticket.paymentRef);
        if (payment?.checkoutUrl) {
          window.location.href = payment.checkoutUrl;
          return;
        }
      }
      // Pas de checkout récupérable (expiré/introuvable) → relance depuis l'événement
      window.location.href = `/events/${ticket.eventId}`;
    } catch {
      window.location.href = `/events/${ticket.eventId}`;
    } finally {
      setResuming(false);
    }
  }

  return (
    <>
      <article
        className={`relative bg-white rounded-2xl overflow-hidden border border-black/5 shadow-[0_3px_10px_rgba(0,0,0,0.06)] ${
          isInactive ? 'opacity-75' : ''
        }`}
      >
        {/* HERO — image event */}
        <div className="relative h-[140px] w-full overflow-hidden">
          {ticket.eventImage ? (
            <img
              src={ticket.eventImage}
              alt={ticket.eventName}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange to-violet" />
          )}
          {/* Overlay gradient pour lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          {/* Badge statut */}
          <span
            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.fg} backdrop-blur-sm`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {/* Nom event */}
          <h3 className="absolute bottom-3 left-4 right-4 font-heading font-extrabold text-white text-lg leading-tight line-clamp-2 wrap-break-word">
            {ticket.eventName || 'Événement'}
          </h3>
        </div>

        {/* PERFORATION */}
        <div className="relative">
          {/* Encoches gauche/droite — couleur fond page */}
          <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cream" />
          <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cream" />
          <div className="mx-5 border-t-2 border-dashed border-black/10" />
        </div>

        {/* BODY — détails + QR */}
        <div className="p-5 flex flex-col sm:flex-row gap-5">
          {/* Infos event */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {ticket.eventDate && (
              <div className="flex items-center gap-2 text-sm text-ink">
                <Calendar className="w-4 h-4 text-orange shrink-0" />
                <span className="font-medium">{formatEventDate(ticket.eventDate, ticket.eventTime)}</span>
              </div>
            )}
            {ticket.eventLocation && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{ticket.eventLocation}</span>
              </div>
            )}
            {ticket.eventCategory && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Tag className="w-4 h-4 shrink-0" />
                <span>{CATEGORY_LABEL[ticket.eventCategory] ?? ticket.eventCategory}</span>
              </div>
            )}

            {/* Footer card : numéro + type + total */}
            <div className="pt-3 mt-1 border-t border-black/5 grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs">
              {ticket.ticketTypeName && (
                <>
                  <span className="text-ink-muted">Type</span>
                  <span className="font-semibold text-ink text-right">
                    {ticket.ticketTypeName} × {ticket.quantity}
                  </span>
                </>
              )}
              <span className="text-ink-muted">Total</span>
              <span className="font-heading font-extrabold text-orange text-right">
                {formatPrice(ticket.totalPrice)}
              </span>
              <span className="text-ink-muted">N° billet</span>
              <span className="font-mono text-[11px] text-ink text-right truncate">
                {ticket.ticketNumber}
              </span>
            </div>
          </div>

          {/* QR — affiché uniquement si le paiement est confirmé */}
          {showQr ? (
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              disabled={!qrValue}
              className="self-center sm:self-start shrink-0 group relative bg-white border-2 border-black/5 rounded-xl p-3 transition-all hover:border-orange/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Agrandir le QR code"
            >
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={110}
                  level="M"
                  marginSize={0}
                  className="block"
                />
              ) : (
                <div className="w-[110px] h-[110px] flex items-center justify-center text-xs text-ink-muted">
                  Pas de QR
                </div>
              )}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <ScanLine className="w-3 h-3" />
                Agrandir
              </span>
            </button>
          ) : isPending ? (
            <div className="self-center sm:self-start shrink-0 w-full sm:w-[136px] flex flex-col items-center justify-center gap-2.5 bg-[#FFB80012] border-2 border-dashed border-[#FFB80055] rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-[#9A6E00]" />
              <span className="text-xs font-semibold text-[#9A6E00] leading-tight">
                Paiement en attente
              </span>
              <span className="text-[10px] text-[#9A6E00]/80 leading-snug">
                Sans paiement, ce billet sera annulé sous ~30 min.
              </span>
              <button
                type="button"
                onClick={handleResumePayment}
                disabled={resuming}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait"
              >
                {resuming ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                {resuming ? 'Redirection…' : 'Finaliser'}
              </button>
            </div>
          ) : (
            <div className="self-center sm:self-start shrink-0 w-full sm:w-[136px] flex items-center justify-center bg-black/[0.03] border-2 border-dashed border-black/10 rounded-xl p-4 text-center text-xs text-ink-muted">
              Billet non valide
            </div>
          )}
        </div>
      </article>

      {qrOpen && showQr && (
        <TicketQRModal
          ticket={ticket}
          onClose={() => setQrOpen(false)}
        />
      )}
    </>
  );
}
