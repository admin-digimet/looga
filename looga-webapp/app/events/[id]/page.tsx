'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Clock, MapPin, Share, Heart, Flag, ChevronDown, Globe, ExternalLink } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { TicketModal } from '@/components/TicketModal';
import { EventCard } from '@/components/EventCard';
import { ReportEventModal } from '@/components/ReportEventModal';
import { useEvent, useSimilarEvents } from '@/hooks/useEvents';
import { useSavedStore } from '@/lib/store/savedStore';
import { formatEventDate, formatPrice, formatPriceFrom } from '@/lib/utils';

function EventDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-9 py-8 animate-pulse">
      <div className="w-24 h-4 bg-[#30243d] rounded mb-6" />
      <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-[#30243d] rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-[#30243d] rounded w-3/4" />
          <div className="h-20 bg-[#30243d] rounded" />
          <div className="h-6 bg-[#30243d] rounded w-1/2" />
          <div className="h-4 bg-[#30243d] rounded w-full" />
          <div className="h-4 bg-[#30243d] rounded w-full" />
          <div className="h-4 bg-[#30243d] rounded w-2/3" />
        </div>
        <div className="hidden lg:block">
          <div className="h-52 bg-[#30243d] rounded-xl" />
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
  const [now, setNow] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoading || !event || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = document.querySelectorAll<HTMLElement>('[data-event-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => {
      element.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-4');
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('opacity-0', 'translate-y-4'));
    };
  }, [isLoading, event]);

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
      <div className="min-h-screen bg-[#130d1c] text-white font-sans">
        <PublicHeader />
        <main><EventDetailSkeleton /></main>
        <PublicFooter />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-[#130d1c] text-white font-sans">
        <PublicHeader />
        <main className="max-w-[1200px] mx-auto px-4 py-16 text-center">
          <p className="text-[#c6bcd0] mb-4">Événement introuvable.</p>
          <button onClick={() => router.push('/')} className="text-orange hover:underline font-semibold">
            Retour à l&apos;accueil
          </button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Afficher un décompte uniquement si la date et l'heure sont interprétables.
  const eventDateString = event.date ? String(event.date) : '';
  const eventTimeString = event.time ? String(event.time).trim() : '';
  const timeMatch = eventTimeString.match(/^(\d{1,2}):(\d{2})/);
  const eventDay = eventDateString.match(/^(\d{4}-\d{2}-\d{2})/);
  const eventDateTime = eventDay && timeMatch
    ? new Date(`${eventDay[1]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00`)
    : null;
  const targetTime = eventDateTime && !Number.isNaN(eventDateTime.getTime())
    ? eventDateTime.getTime()
    : null;
  const remaining = targetTime !== null && now !== null ? Math.max(0, targetTime - now) : null;
  const countdown = remaining !== null && remaining > 0 ? {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
  } : null;

  const organizer = event.organizer;
  const organizerInitial = (organizer?.name ?? event.organizerName ?? 'O').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#130d1c] text-white font-sans">
      <PublicHeader />
      <main>
        <div className="max-w-[1400px] mx-auto px-4 md:px-9 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-[#ff791f] hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux événements
          </button>

          {/* Hero image — plus haute sur mobile (affiches portrait lisibles), large sur desktop */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-[#24152f] rounded-[24px] overflow-hidden relative mb-8 border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            {event.image ? (
              <>
                <img
                  src={event.image}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 bg-gradient-to-t from-[#130d1c]/60 via-transparent to-[#130d1c]/20">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="h-full max-w-full object-contain shadow-2xl rounded-lg motion-safe:animate-[fadeIn_700ms_ease-out]"
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
              className="p-2.5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
            >
              <Share className="w-5 h-5 text-[#bcb0ca]" />
            </button>
            <button
              type="button"
              onClick={() => toggleSaved(event.id)}
              aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isSaved}
              className="p-2.5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSaved ? 'text-orange fill-orange' : 'text-[#bcb0ca]'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* ---- Main content ---- */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 md:mb-8 wrap-break-word">
                {event.name}
              </h1>

              {countdown && (
                <section aria-label="Compte à rebours" className="mb-7 rounded-2xl border border-[#ff791f]/25 bg-[#24172e] px-5 py-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ff9954]">Ça commence dans</p>
                  <div className="flex items-center gap-3 sm:gap-5" aria-live="off">
                    {([
                      ['Jours', countdown.days],
                      ['Heures', countdown.hours],
                      ['Minutes', countdown.minutes],
                    ] as const).map(([label, value]) => (
                      <div key={label} className="min-w-[64px] rounded-xl bg-[#34243e] px-3 py-2 text-center">
                        <div className="text-2xl font-extrabold tabular-nums text-white">{String(value).padStart(2, '0')}</div>
                        <div className="text-[11px] text-[#c6bcd0]">{label}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Organizer card */}
              <div data-event-reveal className="flex flex-wrap items-center justify-between bg-[#21172c] border border-white/10 p-4 rounded-xl mb-8 gap-4">
                <div className="flex items-center gap-4">
                  {organizer?.logo_url ? (
                    <img
                      src={organizer.logo_url}
                      alt={organizer.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange/15 rounded-full flex items-center justify-center text-orange font-bold text-xl shrink-0">
                      {organizerInitial}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#9f93ad] uppercase tracking-wide font-semibold mb-0.5">
                      Organisé par
                    </p>
                    <p className="font-bold text-white text-base">
                      {organizer?.name ?? event.organizerName ?? 'Organisateur'}
                    </p>
                    {organizer?.description && (
                      <p className="text-xs text-[#b9aec7] mt-0.5 line-clamp-2">
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
              <div data-event-reveal className="space-y-5 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#2b2037] rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#bcb0ca]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{formatEventDate(event.date)}</p>
                    <p className="text-[#b9aec7] text-sm">{event.time || 'Heure à confirmer'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#2b2037] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#bcb0ca]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{event.location || 'Lieu à confirmer'}</p>
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
                <div data-event-reveal className="rounded-xl overflow-hidden mb-10 border border-white/10" style={{ height: 260 }}>
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
                  <h2 className="text-2xl font-bold text-white mb-4">Aperçu</h2>
                  <div className="text-[#d3cbdc] text-[15px] leading-relaxed mb-12 whitespace-pre-line">
                    {event.description}
                  </div>
                </>
              )}

              {/* Catégories de billets : présentation uniquement ; achat dans TicketModal */}
              {event.ticketTypes?.length > 0 && (
                <section data-event-reveal className="mb-12">
                  <h2 className="text-2xl font-bold text-white mb-4">Billets disponibles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.ticketTypes.map((tt) => (
                      <div key={tt.id} className={`rounded-2xl border p-5 transition-all duration-200 ${tt.soldOut ? 'border-white/10 bg-[#201828] opacity-65' : 'border-white/10 bg-[#241a30] hover:-translate-y-0.5 hover:border-[#ff791f]/60 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-white">{tt.name}</h3>
                          {tt.soldOut && <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#c6bcd0]">COMPLET</span>}
                        </div>
                        {tt.description && <p className="mt-2 text-sm text-[#b9aec7]">{tt.description}</p>}
                        {tt.advantages && <p className="mt-2 text-xs text-[#ff9954]">{tt.advantages}</p>}
                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                          <strong className="text-lg text-[#ff791f]">{formatPrice(tt.price)}</strong>
                          <button type="button" onClick={() => setShowModal(true)} disabled={tt.soldOut || event.isSoldOut}
                            className="rounded-lg bg-[#ff791f] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#ff8e42] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#9f93ad]">
                            {tt.soldOut || event.isSoldOut ? 'Indisponible' : 'Réserver'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ interactive : ne pas inventer de conditions propres à l'organisateur */}
              <h2 className="text-2xl font-bold text-white mb-6">Foire aux questions</h2>
              <div data-event-reveal className="space-y-3 mb-16">
                {[
                  { question: "Comment récupérer mon billet après l'achat ?", answer: 'Après confirmation de votre commande, retrouvez votre billet et son QR code dans la rubrique « Mes billets » de votre compte Looga.' },
                  { question: 'Puis-je obtenir un remboursement ?', answer: 'Les conditions de remboursement dépendent de la politique applicable à cet événement. Consultez les conditions de vente ou contactez l’organisateur avant votre achat.' },
                  { question: "L'événement est-il accessible aux personnes à mobilité réduite ?", answer: 'Cette information n’est pas précisée ici. Contactez l’organisateur pour confirmer les conditions d’accessibilité.' },
                  { question: 'Y a-t-il un parking disponible sur place ?', answer: 'La disponibilité d’un parking n’est pas confirmée. Renseignez-vous auprès de l’organisateur ou du lieu.' },
                ].map(({ question, answer }, i) => (
                  <div key={question} className="overflow-hidden rounded-xl border border-white/10 bg-[#21172c]">
                    <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#eee7f4] transition hover:text-[#ff9954]">
                      {question}
                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-[#ff791f]' : 'text-[#a99ab9]'}`} />
                    </button>
                    {openFaq === i && <p className="px-5 pb-5 text-sm leading-relaxed text-[#c6bcd0]">{answer}</p>}
                  </div>
                ))}
              </div>

              {/* Événements similaires */}
              {similarEvents && similarEvents.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">
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
              <div className="sticky top-28 bg-[#21172c] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                {event.isSoldOut && (
                  <div className="text-center text-[10px] font-extrabold py-1.5 tracking-wider text-red-700 bg-red-100">
                    COMPLET
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {formatPriceFrom(event.minPrice)}
                  </h3>
                  <p className="text-[#b9aec7] text-sm mb-1">
                    {formatEventDate(event.date, event.time)}
                  </p>
                  <p className="text-[#b9aec7] text-sm mb-6 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location || 'Lieu à confirmer'}
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={event.isSoldOut}
                    className="w-full bg-[#ff791f] text-white font-bold text-base py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:bg-white/15 disabled:cursor-not-allowed"
                  >
                    {event.isSoldOut ? 'Complet' : 'Obtenir des billets'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky buy bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1b1226]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-40">
          <button
            onClick={() => setShowModal(true)}
            disabled={event.isSoldOut}
            className="w-full bg-[#ff791f] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:bg-white/15"
          >
            {event.isSoldOut ? 'Complet' : `Obtenir des billets — ${formatPriceFrom(event.minPrice)}`}
          </button>
        </div>
      </main>
      <div className="pb-24 lg:pb-0"><PublicFooter /></div>

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
