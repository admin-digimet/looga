'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CreditCard, Loader2, QrCode, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatEventDate } from '@/lib/utils';
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

export function TicketCard({ ticket }: Props) {
  const [qrOpen, setQrOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const status = STATUS_CONFIG[ticket.status];
  const qrValue = ticket.qrCode || ticket.ticketNumber;
  // Le QR n'est présentable à l'entrée que si le paiement est confirmé.
  // Un billet 'pending' (paiement non finalisé) ne doit jamais afficher de QR.
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

  const eventTimestamp = ticket.eventDate ? new Date(ticket.eventDate).getTime() : NaN;
  const eventPast = Number.isFinite(eventTimestamp) && eventTimestamp < new Date().setHours(0, 0, 0, 0);
  const displayStatus = ticket.status === 'valid' && eventPast
    ? { label: 'Non utilisé', bg: 'bg-white/10', fg: 'text-[#D4CBDD]', dot: 'bg-[#BEB3CA]' }
    : ticket.status === 'cancelled'
      ? { label: 'Annulé', bg: 'bg-[#C92A3B]', fg: 'text-white', dot: 'bg-white' }
      : ticket.status === 'valid'
        ? { label: 'Valide', bg: 'bg-emerald-500/20', fg: 'text-emerald-300', dot: 'bg-emerald-400' }
        : { ...status, fg: ticket.status === 'pending' ? 'text-amber-300' : 'text-[#D4CBDD]' };
  const canPresent = ticket.status === 'valid' && !eventPast && Boolean(qrValue);
  const canInspect = ticket.status === 'valid' && !eventPast && Boolean(qrValue);
  const calendarDate = ticket.eventDate ? new Date(ticket.eventDate) : null;
  const calendarUrl = calendarDate && !Number.isNaN(calendarDate.getTime())
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.eventName || 'Événement Looga')}&dates=${calendarDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${new Date(calendarDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent('Événement sur Looga')}&location=${encodeURIComponent(ticket.eventLocation || '')}`
    : null;

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-[#493652] bg-[#261A31] text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
        <div className="flex gap-3 p-3 sm:gap-5 sm:p-4">
          <div className="h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF791F] to-[#4E276C] sm:h-36 sm:w-36">
            {ticket.eventImage && <img src={ticket.eventImage} alt={ticket.eventName || 'Affiche de l’événement'} loading="lazy" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="min-w-0 flex-1 font-heading text-base font-extrabold leading-snug sm:text-lg">{ticket.eventName || 'Événement'}</h3>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${displayStatus.bg} ${displayStatus.fg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${displayStatus.dot}`} />{displayStatus.label}
              </span>
            </div>
            {ticket.eventDate && <div className="flex items-start gap-2 text-xs text-[#FF9B59] sm:text-sm"><Calendar className="mt-0.5 h-4 w-4 shrink-0"/><span>{formatEventDate(ticket.eventDate, ticket.eventTime)}</span></div>}
            {ticket.eventLocation && <div className="flex items-start gap-2 text-xs text-[#C6BAD0] sm:text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/><span className="line-clamp-2">{ticket.eventLocation}</span></div>}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-[#DDD3E6]">{ticket.quantity > 1 ? `${ticket.quantity} billets` : '1 billet'}</span>
              {ticket.ticketTypeName && <span className="max-w-full truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-[#DDD3E6]">{ticket.ticketTypeName}</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 border-t border-white/10 p-3 sm:grid-cols-2 sm:p-4">
          {isPending ? (
            <button type="button" onClick={handleResumePayment} disabled={resuming} className="flex items-center justify-center gap-2 rounded-xl bg-[#FF791F] px-4 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60">
              {resuming ? <Loader2 className="h-4 w-4 animate-spin"/> : <CreditCard className="h-4 w-4"/>}{resuming ? 'Redirection…' : 'Finaliser mon paiement'}
            </button>
          ) : canInspect ? (
            <button type="button" onClick={() => setQrOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#FF791F] px-4 py-3 text-sm font-bold text-white hover:brightness-110">
              <QrCode className="h-4 w-4"/>Voir mon billet
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-[#D4CBDD]"><ChevronRight className="h-4 w-4"/>Billet indisponible</div>
          )}
          <Link href={`/events/${ticket.eventId}`} className="flex items-center justify-center gap-2 rounded-xl bg-[#41314D] px-4 py-3 text-sm font-bold text-white hover:bg-[#513B60]">
            <ExternalLink className="h-4 w-4"/>Voir l&apos;événement
          </Link>
        </div>
        {canPresent && calendarUrl && <div className="border-t border-white/10 px-4 pb-3 text-right"><a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#FF9B59] hover:underline">Ajouter au calendrier</a></div>}
      </article>
      {qrOpen && canInspect && <TicketQRModal ticket={ticket} onClose={() => setQrOpen(false)} />}
    </>
  );
}
