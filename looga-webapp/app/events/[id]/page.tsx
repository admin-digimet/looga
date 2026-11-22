'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Share, Heart, Flag, ChevronDown, Globe, ExternalLink, X } from 'lucide-react';
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
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const galleryCountRef = useRef(1);
  const artistsCarouselRef = useRef<HTMLDivElement | null>(null);
  const similarCarouselRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (photoIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhotoIndex(null);
      if (e.key === 'ArrowRight') setPhotoIndex((i) => i === null ? null : (i + 1) % galleryCountRef.current);
      if (e.key === 'ArrowLeft') setPhotoIndex((i) => i === null ? null : (i - 1 + galleryCountRef.current) % galleryCountRef.current);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [photoIndex]);
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

  // Uniquement les médias effectivement transmis par l'API.
  const gallery = Array.from(new Set([event.image, ...(event.images ?? [])].filter((image): image is string => typeof image === 'string' && image.trim().length > 0)));
  galleryCountRef.current = Math.max(1, gallery.length);
  const hasGallery = gallery.length > 1;
  const canShowDirections = !!event.locationUrl && /^https?:\/\//i.test(event.locationUrl);
  const eventTime = event.time ? String(event.time).replace(/^(\d{1,2}):(\d{2})(?::\d{2})?$/, '$1h$2') : null;
  const organizer = event.organizer;
  const organizerInitial = (organizer?.name ?? event.organizerName ?? 'O').charAt(0).toUpperCase();
  const availableTicketTypes = event.ticketTypes.filter((type) => !type.soldOut && type.active !== false);
  const hasFreeTicket = availableTicketTypes.some((type) => type.price === 0);
  const hasPaidTicket = availableTicketTypes.some((type) => type.price > 0);
  const startingPrice = availableTicketTypes.length ? Math.min(...availableTicketTypes.map((type) => type.price)) : event.minPrice;
  const fixedTicketLabel = event.isSoldOut ? 'Billets épuisés' : hasFreeTicket && hasPaidTicket ? 'Obtenir des billets' : hasFreeTicket ? 'Obtenir des billets — Gratuit' : Number.isFinite(startingPrice) ? `Billets dès ${new Intl.NumberFormat('fr-FR').format(startingPrice)} FCFA` : 'Obtenir des billets';

  return (
    <div className="min-h-screen bg-[#130d1c] text-white font-sans">
      <PublicHeader />
      <main>
        <div className="max-w-[1400px] mx-auto px-4 md:px-9 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-[#FF5C1A] hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux événements
          </button>

          {/* Hero événement : photographie panoramique, titre et actions superposés */}
          <section className="relative mb-8 aspect-[4/3] overflow-hidden rounded-[24px] border border-white/10 bg-[#24152f] shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:aspect-[16/9] lg:aspect-[21/9]">
            {event.image ? (
              <img src={event.image} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl" aria-label="Image indisponible">🎉</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#130d1c] via-[#130d1c]/25 to-[#130d1c]/30" />
            <div className="absolute right-3 top-3 z-10 flex gap-2 sm:right-5 sm:top-5">
              <button type="button" onClick={handleShare} aria-label="Partager l'événement" className="rounded-full border border-white/20 bg-[#130d1c]/70 p-3 text-white backdrop-blur hover:bg-[#130d1c]/90"><Share className="h-5 w-5" /></button>
              <button type="button" onClick={() => toggleSaved(event.id)} aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isSaved} className="rounded-full border border-white/20 bg-[#130d1c]/70 p-3 backdrop-blur hover:bg-[#130d1c]/90"><Heart className={`h-5 w-5 ${isSaved ? 'fill-[#FF5C1A] text-[#FF5C1A]' : 'text-white'}`} /></button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-8">
              {event.category && event.category !== 'tout' && <span className="mb-2 inline-block rounded-lg bg-[#FF5C1A] px-3 py-1 text-xs font-bold uppercase text-white">{event.category.replace(/_/g, ' ')}</span>}
              <h1 style={{ fontFamily: "var(--font-heading)" }} className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl wrap-break-word">{event.name}</h1>
            </div>
          </section>
          {shareMessage && <p role="status" className="mb-4 text-sm text-[#FF5C1A]">{shareMessage}</p>}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            {/* ---- Contenu principal ---- */}
            <div className="lg:col-span-2">

              {countdown && (
                <section aria-label="Compte à rebours" className="mb-6 sm:mb-7 rounded-2xl border border-[#FF5C1A]/25 bg-[#24172e] px-5 py-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#FF5C1A]">Ça commence dans</p>
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

              {/* Infos pratiques : une carte date et une carte lieu, sans carte géographique intégrée */}
              <section data-event-reveal className="mb-7 sm:mb-9">
                <h2 className="mb-4 text-2xl font-bold text-white">Infos pratiques</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#21172c] p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#352441]"><CalendarDays className="h-6 w-6 text-[#FF5C1A]" /></div>
                    <div><p className="font-bold text-white">{formatEventDate(event.date)}</p>{eventTime && <p className="text-sm text-[#b9aec7]">{eventTime}</p>}</div>
                  </div>
                  <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#21172c] p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#352441]"><MapPin className="h-6 w-6 text-[#FF5C1A]" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white">{event.location || 'Lieu à confirmer'}</p>
                      {canShowDirections && <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#FF5C1A] hover:underline">Voir l’itinéraire <ExternalLink className="h-4 w-4" /></a>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Carte organisateur conservée */}
              <section data-event-reveal className="mb-7 sm:mb-9">
                <h2 className="mb-4 text-2xl font-bold text-white">Organisé par</h2>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#21172c] p-4 sm:p-5">
                  {organizer?.logo_url ? <img src={organizer.logo_url} alt={organizer.name} className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF5C1A]/15 text-xl font-bold text-[#FF5C1A]">{organizerInitial}</div>}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{organizer?.name ?? event.organizerName ?? 'Organisateur'}</p>
                    {organizer?.description && <p className="mt-1 line-clamp-2 text-sm text-[#b9aec7]">{organizer.description}</p>}
                    {organizer?.website && <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#FF5C1A] hover:underline"><Globe className="h-4 w-4" /> Site web <ExternalLink className="h-4 w-4" /></a>}
                  </div>
                </div>
              </section>

              {event.description && <section data-event-reveal className="mb-8 sm:mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#21172c]">
                <button type="button" aria-expanded={descriptionOpen} onClick={() => setDescriptionOpen(!descriptionOpen)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-bold text-white">
                  À propos de l’événement <ChevronDown className={`h-5 w-5 shrink-0 text-[#FF5C1A] transition-transform ${descriptionOpen ? 'rotate-180' : ''}`} />
                </button>
                {descriptionOpen && <p className="whitespace-pre-line border-t border-white/10 px-5 py-5 text-[15px] leading-relaxed text-[#d3cbdc]">{event.description}</p>}
              </section>}

              {/* Artistes disponibles : vrais noms/images fournis par l'événement */}
              {!!event.artists?.length && <section data-event-reveal className="mb-8 sm:mb-10">
                <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-2xl font-bold text-white">Artistes et intervenants</h2><div className="hidden gap-2 sm:flex"><button type="button" aria-label="Artistes précédents" onClick={() => artistsCarouselRef.current?.scrollBy({left:-250,behavior:'smooth'})} className="rounded-full border border-white/20 p-2"><ChevronLeft className="h-5 w-5" /></button><button type="button" aria-label="Artistes suivants" onClick={() => artistsCarouselRef.current?.scrollBy({left:250,behavior:'smooth'})} className="rounded-full border border-white/20 p-2"><ChevronRight className="h-5 w-5" /></button></div></div>
                <div ref={artistsCarouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
                  {event.artists.map((artist) => <div key={artist.id} className="w-[66%] shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/10 bg-[#21172c] sm:w-[210px]">
                    <div className="relative aspect-[3/4] bg-[#352441]">{artist.image ? <img src={artist.image} alt={artist.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#FF5C1A]">{artist.name.slice(0,1)}</div>}<div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#21172c] to-transparent" /></div>
                    <p className="px-4 pb-4 pt-2 font-semibold text-white">{artist.name}</p>
                  </div>)}
                </div>
              </section>}

              {/* Galerie uniquement si plusieurs photos réelles */}
              {hasGallery && <section data-event-reveal className="mb-8 sm:mb-10">
                <h2 className="mb-4 text-2xl font-bold text-white">Galerie photos</h2>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none]">
                  {gallery.map((src, index) => <button key={src} type="button" onClick={() => setPhotoIndex(index)} aria-label={`Agrandir la photo ${index+1} sur ${gallery.length}`} className="relative aspect-[4/3] w-[85%] shrink-0 snap-start overflow-hidden rounded-[22px] sm:w-[55%]"><img src={src} alt={`${event.name}, photo ${index+1}`} className="h-full w-full object-cover" /><span className="absolute bottom-3 right-3 rounded-full bg-[#130d1c]/80 px-3 py-1 text-xs text-white">{index+1} / {gallery.length}</span></button>)}
                </div>
              </section>}

              {/* Catégories de billets : présentation uniquement ; achat dans TicketModal */}
              {event.ticketTypes?.length > 0 && (
                <section data-event-reveal className="mb-9 sm:mb-12">
                  <h2 className="text-2xl font-bold text-white mb-4">Billets disponibles</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {event.ticketTypes.map((tt) => (
                      <div key={tt.id} className={`relative overflow-hidden rounded-[22px] border bg-[#241a30] p-5 ${tt.soldOut ? 'border-white/10 opacity-65' : 'border-[#FF5C1A]/50'}`}>
                        <div className="pointer-events-none absolute -left-2 top-[45%] h-4 w-4 rounded-full border border-[#FF5C1A]/50 bg-[#130d1c]" />
                        <div className="pointer-events-none absolute -right-2 top-[45%] h-4 w-4 rounded-full border border-[#FF5C1A]/50 bg-[#130d1c]" />
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white">{tt.name}</h3>
                          {tt.soldOut && <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-[#c6bcd0]">Épuisé</span>}
                        </div>
                        {tt.description && <p className="mt-2 text-sm text-[#b9aec7]">{tt.description}</p>}
                        {tt.advantages && <p className="mt-2 text-sm text-[#e8d8ef]">{tt.advantages}</p>}
                        <div className="my-4 border-t border-dashed border-[#FF5C1A]/40" />
                        <p className="mb-4 text-xl font-bold text-[#FF5C1A]">{formatPrice(tt.price)}</p>
                        <button type="button" onClick={() => setShowModal(true)} disabled={tt.soldOut || event.isSoldOut} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-4 py-3 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#9f93ad]">
                          {tt.soldOut || event.isSoldOut ? 'Indisponible' : 'Réserver ma place'} {!tt.soldOut && !event.isSoldOut && <ChevronRight className="h-5 w-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ interactive : ne pas inventer de conditions propres à l'organisateur */}
              <h2 className="text-2xl font-bold text-white mb-4 sm:mb-6">Foire aux questions</h2>
              <div data-event-reveal className="space-y-3 mb-10 sm:mb-16">
                {[
                  { question: "Comment récupérer mon billet après l'achat ?", answer: 'Une fois ton paiement confirmé, retrouve ton billet directement dans la rubrique « Mes billets » de ton compte Looga. Tu pourras le présenter à l’entrée de l’événement grâce à son QR code.' },
                  { question: 'Puis-je payer avec Orange Money, Wave ou MTN MoMo ?', answer: 'Les moyens de paiement disponibles te sont présentés au moment de la réservation. Choisis simplement l’option qui te convient et suis les instructions pour finaliser ton achat en toute sécurité.' },
                  { question: 'Dois-je imprimer mon billet pour entrer ?', answer: 'Pas besoin d’imprimer ton billet ! Présente simplement ton QR code depuis ton téléphone à l’entrée de l’événement. Pense à augmenter la luminosité de ton écran pour faciliter le scan.' },
                ].map(({ question, answer }, i) => (
                  <div key={question} className="overflow-hidden rounded-xl border border-white/10 bg-[#21172c]">
                    <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#eee7f4] transition hover:text-[#FF5C1A]">
                      {question}
                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-[#FF5C1A]' : 'text-[#a99ab9]'}`} />
                    </button>
                    {openFaq === i && <p className="px-5 pb-5 text-sm leading-relaxed text-[#c6bcd0]">{answer}</p>}
                  </div>
                ))}
              </div>

              {/* Événements similaires */}
              {similarEvents && similarEvents.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4 sm:mb-6">
                    Pourrait aussi t&apos;intéresser
                  </h2>
                  <div ref={similarCarouselRef} className="mb-9 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] sm:mb-12">
                    {similarEvents.map((e) => (
                      <div key={e.id} className="flex w-[85%] shrink-0 snap-start flex-col rounded-[22px] border border-white/10 bg-[#24152f] p-4 text-white sm:w-[48%]">
                        <EventCard event={e} compactTime highlightFreePrice hideOrganizer darkVariant showAction />
                      </div>
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
                    {formatPriceFrom(startingPrice)}
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
                    className="w-full bg-[#FF5C1A] text-white font-bold text-base py-3.5 rounded-lg hover:opacity-90 transition-colors disabled:bg-white/15 disabled:cursor-not-allowed"
                  >
                    {event.isSoldOut ? 'Complet' : 'Obtenir des billets'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky buy bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1b1226]/95 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] z-40">
          <button
            onClick={() => setShowModal(true)}
            disabled={event.isSoldOut}
            className="w-full min-h-12 bg-[#FF5C1A] text-white text-sm sm:text-base font-bold leading-snug px-3 py-3.5 rounded-xl hover:opacity-90 transition-colors disabled:bg-white/15"
          >
            {fixedTicketLabel}
          </button>
        </div>
      </main>
      <div className="pb-28 lg:pb-0"><PublicFooter /></div>

      {photoIndex !== null && <div role="dialog" aria-modal="true" aria-label="Galerie photos agrandie" className="fixed inset-0 z-[90] flex items-center justify-center bg-[#090510]/95 p-4" onKeyDown={(e) => {if(e.key==='Escape')setPhotoIndex(null);if(e.key==='ArrowRight')setPhotoIndex((photoIndex+1)%gallery.length);if(e.key==='ArrowLeft')setPhotoIndex((photoIndex-1+gallery.length)%gallery.length);}} tabIndex={-1}>
        <button type="button" onClick={() => setPhotoIndex(null)} aria-label="Fermer la photo" className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] rounded-full bg-white/10 p-3 text-white"><X className="h-6 w-6" /></button>
        <button type="button" onClick={() => setPhotoIndex((photoIndex-1+gallery.length)%gallery.length)} aria-label="Photo précédente" className="absolute left-2 top-1/2 rounded-full bg-white/10 p-2 text-white sm:left-5"><ChevronLeft /></button>
        <img src={gallery[photoIndex]} alt={`${event.name}, photo ${photoIndex+1}`} className="max-h-[80vh] max-w-[calc(100vw-6rem)] object-contain" onTouchStart={(e) => setTouchStart(e.touches[0].clientX)} onTouchEnd={(e) => {if(touchStart!==null){const distance=e.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>50)setPhotoIndex((photoIndex+(distance<0?1:-1)+gallery.length)%gallery.length);}setTouchStart(null);}} />
        <button type="button" onClick={() => setPhotoIndex((photoIndex+1)%gallery.length)} aria-label="Photo suivante" className="absolute right-2 top-1/2 rounded-full bg-white/10 p-2 text-white sm:right-5"><ChevronRight /></button>
        <span className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] text-sm text-white">{photoIndex+1} / {gallery.length}</span>
      </div>}

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
