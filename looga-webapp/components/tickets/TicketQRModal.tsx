'use client';

import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';
import { formatEventDate } from '@/lib/utils';
import type { Ticket } from '@/types';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketQRModal({ ticket, onClose }: Props) {
  // Lock scroll + Escape pour fermer
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const qrValue = ticket.qrCode || ticket.ticketNumber;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="QR code du billet"
    >
      <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h2 className="font-heading font-extrabold text-ink text-lg">Présente ce QR à l&apos;entrée</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* QR géant */}
        <div className="px-6 py-8 flex flex-col items-center">
          {qrValue ? (
            <div className="bg-white border-4 border-black/5 rounded-2xl p-4">
              <QRCodeSVG
                value={qrValue}
                size={280}
                level="H"
                marginSize={0}
                className="block"
              />
            </div>
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center text-ink-muted text-sm border-2 border-dashed border-black/10 rounded-2xl">
              QR code indisponible
            </div>
          )}

          {/* Numéro de billet */}
          <p className="mt-5 font-mono text-sm text-ink-muted">
            {ticket.ticketNumber}
          </p>

          {/* Info event */}
          {ticket.eventName && (
            <div className="mt-4 text-center">
              <p className="font-heading font-bold text-ink text-base">{ticket.eventName}</p>
              {ticket.eventDate && (
                <p className="text-sm text-ink-muted mt-0.5">
                  {formatEventDate(ticket.eventDate, ticket.eventTime)}
                </p>
              )}
              {ticket.eventLocation && (
                <p className="text-xs text-ink-muted mt-0.5">{ticket.eventLocation}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/5 bg-cream-2">
          <p className="text-center text-xs text-ink-muted">
            Garde ton téléphone à portée. Le scanner Looga lira ce code à l&apos;entrée.
          </p>
        </div>
      </div>
    </div>
  );
}
