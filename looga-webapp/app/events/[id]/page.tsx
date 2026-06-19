'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Clock, MapPin, Share, Heart, Flag, ChevronDown, Globe, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TicketModal } from '@/components/TicketModal';
import { EventCard } from '@/components/EventCard';
import { ReportEventModal } from '@/components/ReportEventModal';
import { useEvent, useSimilarEvents } from '@/hooks/useEvents';
import { useSavedStore } from '@/lib/store/savedStore';
import { formatEventDate, formatPrice, formatPriceFrom } from '@/lib/utils';

function EventDetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-pulse">
      <div className="w-24 h-4 bg-gray-200 rounded mb-6" />
      <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-gray-200 rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="hidden lg:block">
          <div className="h-52 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: event, isLoading, isError } = useEvent(id);
  const [showModal, setShowModal] = useState(false);
  const { data: similarEvents } = useSimilarEvents({
    category: event?.category,
    excludeId: event?.id ?? '',
    limit: 4,
  });
  const isSaved = useSavedStore((s) => (event ? s.saved.includes(event.id) : false));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  async function handleShare() {
    if (!event) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const data = { title: event.name, text: `Découvre ${event.name} sur Looga`, url };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage('Lien copié dans le presse-papier ✓');
        setTimeout(() => setShareMessage(null), 2500);
      }
    } catch {
      // user cancelled share — no-op
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <main><EventDetailSkeleton /></main>
        <Footer />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 mb-4">Événement introuvable.</p>
          <button onClick={() => router.push('/')} className="text-orange hover:underline font-semibold">
            Retour à l&apos;accueil
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const organizer = event.organizer;
  const organizerInitial = (organizer?.name ?? event.organizerName ?? 'O').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-orange hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux événements
          </button>

          {/* Hero image — plus haute sur mobile (affiches portrait lisibles), large sur desktop */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-gray-900 rounded-xl overflow-hidden relative mb-8">
            {event.image ? (
              <>
                <img
                  src={event.image}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="h-full max-w-full object-contain shadow-2xl rounded-lg"
                  />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl">🎉</div>
            )}
          </div>

          {/* Action icons */}
          <div className="flex justify-end items-center gap-4 mb-4">
            {shareMessage && (
              <span className="text-xs text-green-600 font-medium animate-in fade-in">
                {shareMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Partager l'événement"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => toggleSaved(event.id)}
              aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isSaved}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSaved ? 'text-orange fill-orange' : 'text-gray-600'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ---- Main content ---- */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6 md:mb-8 wrap-break-word">
                {event.name}
              </h1>

              {/* Organizer card */}
              <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-xl mb-8 gap-4">
                <div className="flex items-center gap-4">
                  {organizer?.logo_url ? (
                    <img
                      src={organizer.logo_url}
                      alt={organizer.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange/15 rounded-full flex items-center justify-center text-orange font-bold text-xl shrink-0">
                      {organizerInitial}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                      Organisé par
                    </p>
                    <p className="font-bold text-gray-900 text-base">
                      {organizer?.name ?? event.organizerName ?? 'Organisateur'}
                    </p>
                    {organizer?.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {organizer.description}
                      </p>
                    )}
                    {organizer?.website && (
                      <a
                        href={organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange flex items-center gap-1 mt-1 hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        Site web
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="space-y-5 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{formatEventDate(event.date)}</p>
                    <p className="text-gray-500 text-sm">{event.time || 'Heure à confirmer'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{event.location || 'Lieu à confirmer'}</p>
                    {event.locationUrl && (
                      <a
                        href={event.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange hover:underline flex items-center gap-1 mt-0.5"
                      >
                        Voir sur la carte <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Map embed */}
              {event.location && (
                <div className="rounded-xl overflow-hidden mb-10 border border-gray-200" style={{ height: 260 }}>
                  <iframe
                    title="Localisation"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location + ', Abidjan')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              )}

              {/* Description */}
              {event.description && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Aperçu</h2>
                  <div className="text-gray-700 text-[15px] leading-relaxed mb-12 whitespace-pre-line">
                    {event.description}
                  </div>
                </>
              )}

              {/* Ticket types */}
              {event.ticketTypes?.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Billets disponibles</h2>
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-12">
                    {event.ticketTypes.map((tt, i) => (
                      <div
                        key={tt.id}
                        className={`flex items-center justify-between px-5 py-4 ${
                          i > 0 ? 'border-t border-gray-100' : ''
                        } ${tt.soldOut ? 'opacity-50' : ''}`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{tt.name}</p>
                          {tt.description && (
                            <p className="text-gray-500 text-xs mt-0.5">{tt.description}</p>
                          )}
                          {tt.advantages && (
                            <p className="text-xs text-orange mt-0.5">{tt.advantages}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className={`font-extrabold text-base ${tt.soldOut ? 'text-gray-400' : 'text-orange'}`}>
                            {tt.soldOut ? 'Complet' : formatPrice(tt.price)}
                          </span>
                          {!tt.soldOut && (
                            <button
                              onClick={() => setShowModal(true)}
                              className="block text-xs text-orange hover:underline mt-1"
                            >
                              Réserver →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* FAQ */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Foire aux questions</h2>
              <div className="space-y-2 mb-16">
                {[
                  "Comment récupérer mon billet après l'achat ?",
                  'Puis-je obtenir un remboursement ?',
                  "L'événement est-il accessible aux personnes à mobilité réduite ?",
                  'Y a-t-il un parking disponible sur place ?',
                ].map((q, i) => (
                  <details key={i} className="group border-b border-gray-200 py-4">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-orange transition-colors">
                      {q}
                      <span className="transition group-open:rotate-180 text-gray-400">
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </summary>
                    <div className="text-gray-600 mt-4 text-sm pr-8 leading-relaxed">
                      Votre billet vous sera envoyé par email dès la confirmation du paiement. Vous pouvez
                      également le retrouver dans la section &quot;Mes billets&quot; de votre compte Looga.
                    </div>
                  </details>
                ))}
              </div>

              {/* Événements similaires */}
              {similarEvents && similarEvents.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Pourrait aussi t&apos;intéresser
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    {similarEvents.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-center mb-16 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-2 text-orange hover:underline text-sm font-semibold"
                >
                  <Flag className="w-4 h-4" /> Signaler cet événement
                </button>
              </div>
            </div>

            {/* ---- Sticky sidebar ---- */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-28 bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
                {event.isSoldOut && (
                  <div className="text-center text-[10px] font-extrabold py-1.5 tracking-wider text-red-700 bg-red-100">
                    COMPLET
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {formatPriceFrom(event.minPrice)}
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">
                    {formatEventDate(event.date, event.time)}
                  </p>
                  <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location || 'Lieu à confirmer'}
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={event.isSoldOut}
                    className="w-full bg-orange text-white font-bold text-base py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {event.isSoldOut ? 'Complet' : 'Obtenir des billets'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky buy bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <button
            onClick={() => setShowModal(true)}
            disabled={event.isSoldOut}
            className="w-full bg-orange text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-300"
          >
            {event.isSoldOut ? 'Complet' : `Obtenir des billets — ${formatPriceFrom(event.minPrice)}`}
          </button>
        </div>
      </main>
      <Footer />

      {/* Ticket purchase modal */}
      {showModal && <TicketModal event={event} onClose={() => setShowModal(false)} />}

      {/* Report event modal */}
      <ReportEventModal
        eventId={event.id}
        eventTitle={event.name}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
