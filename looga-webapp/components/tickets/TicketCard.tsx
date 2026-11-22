'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, MapPin, CreditCard, Loader2, QrCode, Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatEventDate } from '@/lib/utils';
import { getPaymentStatus } from '@/lib/api/payment';
import { downloadTicketPdf } from '@/lib/ticketPdf';
import type { Ticket } from '@/types';
import { TicketQRModal } from './TicketQRModal';

interface Props { ticket: Ticket; tickets?: Ticket[]; }
const labelFor = (status: Ticket['status']) => ({ valid: 'Valide', used: 'Utilisé', cancelled: 'Annulé', pending: 'En attente', expired: 'Expiré' })[status];

export function TicketCard({ ticket, tickets }: Props) {
  const group = tickets?.length ? tickets : [ticket];
  const [qrOpen, setQrOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const qrTickets = group.filter((item) => item.status === 'valid' && Boolean(item.qrCode || item.ticketNumber));
  const eventPast = ticket.eventDate && new Date(ticket.eventDate).getTime() < new Date().setHours(0, 0, 0, 0);
  const canQr = ticket.status === 'valid' && qrTickets.length > 0;
  const statusTone = ticket.status === 'valid' ? 'bg-emerald-500/20 text-emerald-200' : ticket.status === 'pending' ? 'bg-amber-500/20 text-amber-200' : ticket.status === 'cancelled' ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-[#D1C7DB]';
  const totalQuantity = group.length > 1 ? group.length : Math.max(1, ticket.quantity || 1);
  async function resume() {
    if (resuming || !ticket.paymentRef) return;
    setResuming(true);
    try {
      const payment = await getPaymentStatus(ticket.paymentRef);
      if (payment?.checkoutUrl) window.location.href = payment.checkoutUrl;
      else setPdfError('La reprise de ce paiement n’est pas disponible.');
    } catch { setPdfError('Impossible de reprendre ce paiement pour le moment.'); }
    finally { setResuming(false); }
  }
  return <>
    <article className={`overflow-hidden rounded-[22px] border border-[#493652] bg-[#261A31] text-white ${eventPast ? 'opacity-85' : ''}`}>
      <Link href={`/tickets/${ticket.id}`} className="flex gap-3 p-3 sm:gap-5 sm:p-4 hover:bg-white/[0.025]">
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF5C1A] to-[#4E276C] sm:h-32 sm:w-32">
          {ticket.eventImage && <img src={ticket.eventImage} alt="" loading="lazy" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <h3 className="min-w-0 flex-1 font-heading text-base font-extrabold leading-snug line-clamp-2">{ticket.eventName || 'Événement'}</h3>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusTone}`}>{eventPast && ticket.status === 'valid' ? 'Non utilisé' : labelFor(ticket.status)}</span>
          </div>
          {ticket.eventDate && <div className="flex items-start gap-2 text-xs text-[#FF9B59]"><Calendar className="h-4 w-4 shrink-0"/>{formatEventDate(ticket.eventDate, ticket.eventTime)}</div>}
          {ticket.eventLocation && <div className="flex items-start gap-2 text-xs text-[#CFC4D6]"><MapPin className="h-4 w-4 shrink-0"/><span className="line-clamp-2">{ticket.eventLocation}</span></div>}
          <span className="inline-block text-xs text-[#D2C6DD]">{totalQuantity} billet{totalQuantity > 1 ? 's' : ''} <ChevronRight className="inline h-4 w-4 text-[#FF5C1A]"/></span>
        </div>
      </Link>
      <div className="grid gap-2 border-t border-white/10 p-3 sm:p-4">
        {ticket.status === 'pending' ? <button onClick={resume} disabled={!ticket.paymentRef || resuming} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-3 py-2.5 text-sm font-semibold disabled:opacity-40"><CreditCard className="h-4 w-4"/>{resuming ? <Loader2 className="animate-spin h-4 w-4"/> : null}Reprendre le paiement</button> : canQr ? <button onClick={() => setQrOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-3 py-2.5 text-sm font-semibold"><QrCode className="h-4 w-4"/>Afficher le QR code</button> : <div className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 text-sm text-[#C5B9CD]">{ticket.status === 'used' ? 'Billet déjà utilisé' : ticket.status === 'cancelled' ? 'Billet annulé' : 'QR indisponible'}</div>}
        <button type="button" onClick={async () => { setPdfError(''); try { await downloadTicketPdf(ticket, 1, totalQuantity); } catch { setPdfError('Le PDF n’a pas pu être généré.'); } }} disabled={ticket.status === 'pending'} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FF5C1A] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4"/>Télécharger le PDF</button>
        {pdfError && <p role="alert" className="text-xs text-amber-200">{pdfError}</p>}
      </div>
      {group.map(t => (t.status === 'valid' && (t.qrCode || t.ticketNumber) ? <QRCodeCanvas key={t.id} id={`ticket-pdf-qr-${t.id}`} value={t.qrCode || t.ticketNumber} size={280} level="H" className="absolute -left-[10000px] top-0"/> : null))}
    </article>
    {qrOpen && <TicketQRModal ticket={qrTickets[0]} tickets={qrTickets} onClose={() => setQrOpen(false)}/>}
  </>;
}
