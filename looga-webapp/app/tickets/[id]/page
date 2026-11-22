'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Calendar, MapPin, ChevronLeft, ChevronRight, QrCode, Download } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { useAuthStore } from '@/lib/store/authStore';
import { useTickets } from '@/hooks/useTickets';
import { TicketQRModal } from '@/components/tickets/TicketQRModal';
import { downloadTicketPdf } from '@/lib/ticketPdf';
import { formatEventDate } from '@/lib/utils';
import type { Ticket } from '@/types';

function displayStatus(status: Ticket['status']) { return ({ valid: 'Valide', used: 'Utilisé', cancelled: 'Annulé', expired: 'Expiré', pending: 'En attente' })[status]; }
export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>(); const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: tickets, isLoading } = useTickets();
  const [index, setIndex] = useState(0); const [qrOpen, setQrOpen] = useState(false); const [pdfError, setPdfError] = useState('');
  const group = useMemo(() => {
    const anchor = tickets?.find(t => t.id === params.id);
    if (!anchor) return [];
    return anchor.paymentRef ? (tickets || []).filter(t => t.paymentRef === anchor.paymentRef && t.eventId === anchor.eventId) : [anchor];
  }, [tickets, params.id]);
  useEffect(() => { if (!authLoading && !isAuthenticated) router.replace('/auth/login'); }, [authLoading, isAuthenticated, router]);
  const ticket = group[index] || group[0];
  const eventPast = ticket?.eventDate && new Date(ticket.eventDate).getTime() < new Date().setHours(0, 0, 0, 0);
  const canShowQr = ticket?.status === 'valid' && Boolean(ticket.qrCode || ticket.ticketNumber);
  const activeQr = group.filter(t => t.status === 'valid' && Boolean(t.qrCode || t.ticketNumber) );
  if (authLoading || !isAuthenticated) return null;
  return <div className="min-h-screen flex flex-col bg-[#160F20] text-white"><PublicHeader/><main className="mx-auto w-full max-w-[850px] flex-1 px-4 py-8 md:px-8">
    <Link href="/tickets" className="inline-flex items-center gap-2 text-sm text-[#FF9B59] mb-6"><ArrowLeft className="h-4 w-4"/>Mes billets</Link>
    {isLoading ? <div className="animate-pulse h-[400px] rounded-3xl bg-white/10"/> : !ticket ? <p>Cette réservation est introuvable.</p> : <>
      <h1 className="font-heading text-2xl font-extrabold mb-2">{ticket.eventName || 'Détail de la réservation'}</h1>
      <p className="mb-6 text-sm text-[#C8BBD2]">{formatEventDate(ticket.eventDate, ticket.eventTime)} · {group.length === 1 ? Math.max(1, ticket.quantity || 1) : group.length} billet(s)</p>
      <div className="mb-3 flex items-center justify-between"><h2 className="font-heading font-bold">Mes billets</h2><span className="text-sm text-[#FF9B59]">{index + 1} / {group.length}</span></div>
      <div className="flex gap-3 items-center"><button type="button" disabled={index === 0} onClick={() => setIndex(n => n - 1)} aria-label="Billet précédent" className="rounded-full bg-white/10 p-2 disabled:opacity-30"><ChevronLeft/></button>
        <div className="min-w-0 flex-1 overflow-hidden rounded-[22px] border border-[#5A3A5D] bg-[#24162F]">
          <div className="relative h-40 bg-gradient-to-br from-[#FF5C1A] to-[#452261]">{ticket.eventImage && <img src={ticket.eventImage} alt="" className="h-full w-full object-cover"/>}<div className="absolute inset-0 bg-gradient-to-t from-[#24162F] to-transparent"/><h3 className="absolute bottom-3 left-4 font-heading text-xl font-extrabold">{ticket.eventName}</h3></div>
          <div className="space-y-3 px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-[#FF9B59]">{ticket.ticketTypeName || 'Billet'}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{displayStatus(ticket.status)}</span></div>
            <div className="flex gap-2 text-sm"><Calendar className="h-4 w-4 text-[#FF5C1A]"/>{formatEventDate(ticket.eventDate, ticket.eventTime)}</div>{ticket.eventLocation && <div className="flex gap-2 text-sm"><MapPin className="h-4 w-4 text-[#FF5C1A]"/>{ticket.eventLocation}</div>}
            <p className="text-xs text-[#CBBFD5]">Billet {String(index + 1).padStart(2,'0')}/{String(group.length).padStart(2,'0')}</p>
          </div>
          <div className="relative mx-4 border-t-2 border-dashed border-[#FF5C1A]/60 before:absolute before:-left-7 before:-top-3 before:h-6 before:w-6 before:rounded-full before:bg-[#160F20] after:absolute after:-right-7 after:-top-3 after:h-6 after:w-6 after:rounded-full after:bg-[#160F20]"/>
          <div className="flex flex-col items-center px-4 py-5">
            {canShowQr ? <div className="rounded-xl bg-white p-3"><QRCodeCanvas id={`ticket-pdf-qr-${ticket.id}`} value={ticket.qrCode || ticket.ticketNumber} size={220} level="H"/></div> : <div className="rounded-xl bg-white/10 px-6 py-16 text-center text-sm text-[#D2C8DC]">{ticket.status === 'used' ? 'Billet déjà utilisé' : ticket.status === 'cancelled' ? 'Billet annulé' : ticket.status === 'pending' ? 'Réservation en attente' : 'QR indisponible'}</div>}
            <p className="mt-3 max-w-full break-all font-mono text-xs text-[#C4B7D0]">{ticket.ticketNumber || ticket.id}</p>
          </div>
        </div><button type="button" disabled={index === group.length - 1} onClick={() => setIndex(n => n + 1)} aria-label="Billet suivant" className="rounded-full bg-white/10 p-2 disabled:opacity-30"><ChevronRight/></button></div>
      <div className="mt-4 grid gap-2"><button disabled={!canShowQr} onClick={() => setQrOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] font-semibold disabled:opacity-40"><QrCode className="h-4 w-4"/>Afficher le QR code</button><button disabled={ticket.status === 'pending'} onClick={async () => { setPdfError(''); try { await downloadTicketPdf(ticket, index + 1, group.length); } catch { setPdfError('Impossible de générer le PDF.'); } }} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FF5C1A] font-semibold disabled:opacity-40"><Download className="h-4 w-4"/>Télécharger le PDF</button>{pdfError && <p className="text-amber-200 text-xs">{pdfError}</p>}</div>
      <details className="mt-6 rounded-2xl border border-white/10 bg-[#24162F] p-4"><summary className="cursor-pointer font-semibold">Détails de la réservation</summary><div className="mt-4 space-y-2 text-sm text-[#D0C3D8]"><p>Référence : {ticket.paymentRef || ticket.ticketNumber || ticket.id}</p><p>Événement : {ticket.eventName}</p><p>Catégorie : {ticket.ticketTypeName || 'Non renseignée'}</p><p>Statut : {displayStatus(ticket.status)}</p></div></details>
      {qrOpen && canShowQr && <TicketQRModal ticket={activeQr[0]} tickets={activeQr} onClose={() => setQrOpen(false)}/>}
    </>}
  </main><PublicFooter/></div>;
}
