'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { useTickets } from '@/hooks/useTickets';
import { formatEventDate, formatPrice } from '@/lib/utils';
import type { TicketStatus } from '@/types';

const STATUS_STYLE: Record<TicketStatus, string> = {
  valid: 'bg-green-100 text-green-700',
  used: 'bg-gray-100 text-gray-500',
  expired: 'bg-red-100 text-red-600',
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  valid: '✓ Valide',
  used: 'Utilisé',
  expired: 'Expiré',
};

export default function TicketsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (!isAuthenticated && !authLoading)) return null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Mes Billets</h1>

        {ticketsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-40" />
            ))}
          </div>
        ) : !tickets?.length ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎫</p>
            <p className="text-gray-500 text-lg mb-2">Aucun billet pour le moment</p>
            <p className="text-gray-400 text-sm mb-8">Découvrez les événements et réservez votre place !</p>
            <Link
              href="/"
              className="bg-orange text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-colors"
            >
              Explorer les événements
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Top */}
                <div className="flex gap-4 p-5">
                  {ticket.eventImage ? (
                    <img
                      src={ticket.eventImage}
                      alt={ticket.eventName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange/15 flex items-center justify-center text-2xl shrink-0">
                      🎉
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{ticket.eventName}</h3>
                    <p className="text-sm text-orange font-semibold">
                      {formatEventDate(ticket.eventDate, ticket.eventTime)}
                    </p>
                    <p className="text-sm text-gray-500">{ticket.eventLocation}</p>
                  </div>
                  <span className={`self-start text-xs font-bold px-3 py-1 rounded-full shrink-0 ${STATUS_STYLE[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status]}
                  </span>
                </div>

                {/* Divider with holes */}
                <div className="relative border-t border-dashed border-gray-200 mx-5" />

                {/* Bottom — QR + details */}
                <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-3">
                    <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                      <code className="text-xs text-gray-500 break-all text-center px-2">
                        {ticket.qrCode || ticket.ticketNumber}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-900">{ticket.ticketTypeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantité</span>
                      <span className="font-semibold text-gray-900">{ticket.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-semibold text-orange">{formatPrice(ticket.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-400 text-xs">N° billet</span>
                      <span className="font-mono text-xs text-gray-500">{ticket.ticketNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
