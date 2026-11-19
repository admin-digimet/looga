'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatEventDate } from '@/lib/utils';
import type { Ticket } from '@/types';

interface Props {
  ticket: Ticket;
  tickets?: Ticket[];
  onClose: () => void;
}

export function TicketQRModal({ ticket, tickets, onClose }: Props) {
  const slides = tickets?.length ? tickets : [ticket];
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const current = slides[index] ?? slides[0];
  const go = (next: number) => setIndex(Math.max(0, Math.min(slides.length - 1, next)));
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

  const qrValue = current.qrCode || current.ticketNumber;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="QR code du billet"
    >
      <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] overflow-y-auto">
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

        {slides.length > 1 && <div className="flex items-center justify-between px-5 pt-4 text-sm text-[#4A4050]">
          <button type="button" aria-label="Billet précédent" disabled={index === 0} onClick={() => go(index - 1)} className="rounded-full p-2 disabled:opacity-25"><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-semibold">Billet {index + 1} / {slides.length}</span>
          <button type="button" aria-label="Billet suivant" disabled={index === slides.length - 1} onClick={() => go(index + 1)} className="rounded-full p-2 disabled:opacity-25"><ChevronRight className="h-5 w-5" /></button>
        </div>}
        {/* QR géant */}
        <div className="px-6 py-8 flex flex-col items-center touch-pan-y" onTouchStart={(e) => { startX.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={(e) => { if (startX.current === null) return; const delta = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current; if (Math.abs(delta) > 55) go(index + (delta < 0 ? 1 : -1)); startX.current = null; }}>
          {qrValue ? (
            <div className="bg-white border-4 border-black/5 rounded-2xl p-4">
              <QRCodeSVG
                value={qrValue}
                size={256}
                level="H"
                marginSize={0}
                className="block max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center text-ink-muted text-sm border-2 border-dashed border-black/10 rounded-2xl">
              QR code indisponible
            </div>
          )}

          {/* Numéro de billet */}
          <p className="mt-5 font-mono text-sm text-ink-muted">
            {current.ticketNumber}
          </p>

          {/* Info event */}
          {current.eventName && (
            <div className="mt-4 text-center">
              <p className="font-heading font-bold text-ink text-base">{current.eventName}</p>
              {current.eventDate && (
                <p className="text-sm text-ink-muted mt-0.5">
                  {formatEventDate(current.eventDate, current.eventTime)}
                </p>
              )}
              {current.eventLocation && (
                <p className="text-xs text-ink-muted mt-0.5">{current.eventLocation}</p>
              )}
            </div>
          )}
        </div>

        {slides.length > 1 && <div className="flex justify-center gap-2 pb-3" aria-label="Position dans les billets">{slides.map((item, i) => <button key={item.id} type="button" onClick={() => go(i)} aria-label={`Afficher le billet ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-[#FF791F]' : 'w-2 bg-gray-300'}`} />)}</div>}
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
