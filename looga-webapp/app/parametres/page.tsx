'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, BellRing, CalendarDays, ChevronDown, ChevronRight, Download,
  Globe, Heart, LockKeyhole, Mail, MapPin, MessageCircle, Shield,
  ShieldCheck, SlidersHorizontal, Trash2,
} from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { useAuthStore } from '@/lib/store/authStore';

type NotificationChannel = 'push' | 'email' | 'whatsapp';
type NotificationGroup = 'discoveries' | 'reminders';
type NotificationSettings = Record<NotificationGroup, Record<NotificationChannel, boolean>>;
type PreferencePanel = 'language' | 'city' | 'interests' | 'calendar' | null;
type SecurityPanel = 'connection' | 'data' | 'delete' | null;

const SETTINGS_KEY = 'looga_settings_v1';
const LEGACY_EMAIL_KEY = 'looga_notif_email';
const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  discoveries: { push: true, email: true, whatsapp: false },
  reminders: { push: true, email: true, whatsapp: true },
};
const CITIES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo'];
const INTERESTS = [
  'Concerts & musique', 'Soirées & nightlife', 'Festivals', 'Sport',
  'Art & culture', 'Food & gastronomie', 'Business & networking', 'Humour & spectacles',
];

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff791f] ${checked ? 'bg-[#ff791f]' : 'bg-[#65576e]'}`}
    >
      <span className={`pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function ParametresPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [language, setLanguage] = useState('Français');
  const [city, setCity] = useState('Abidjan');
  const [interests, setInterests] = useState<string[]>([]);
  const [preferencePanel, setPreferencePanel] = useState<PreferencePanel>(null);
  const [securityPanel, setSecurityPanel] = useState<SecurityPanel>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          notifications?: Partial<Record<NotificationGroup, Partial<Record<NotificationChannel, boolean>>>>;
          language?: string;
          city?: string;
          interests?: string[];
        };
        if (parsed.notifications) {
          setNotifications({
            discoveries: { ...DEFAULT_NOTIFICATIONS.discoveries, ...parsed.notifications.discoveries },
            reminders: { ...DEFAULT_NOTIFICATIONS.reminders, ...parsed.notifications.reminders },
          });
        }
        if (parsed.language === 'Français' || parsed.language === 'English') setLanguage(parsed.language);
        if (typeof parsed.city === 'string' && CITIES.includes(parsed.city)) setCity(parsed.city);
        if (Array.isArray(parsed.interests)) setInterests(parsed.interests.filter((value): value is string => typeof value === 'string' && INTERESTS.includes(value)));
      } else {
        const oldEmail = localStorage.getItem(LEGACY_EMAIL_KEY);
        if (oldEmail !== null) {
          setNotifications(prev => ({ ...prev, discoveries: { ...prev.discoveries, email: oldEmail === 'true' } }));
        }
      }
    } catch {
      // Conserver les valeurs par défaut si les données locales sont invalides.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ notifications, language, city, interests }));
      // Compatibilité avec l'ancien réglage e-mail de Looga.
      localStorage.setItem(LEGACY_EMAIL_KEY, String(notifications.discoveries.email));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [hydrated, notifications, language, city, interests]);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  function toggleNotification(group: NotificationGroup, channel: NotificationChannel) {
    setNotifications(prev => ({
      ...prev,
      [group]: { ...prev[group], [channel]: !prev[group][channel] },
    }));
  }

  function toggleInterest(value: string) {
    setInterests(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  }

  const channelItems = [
    { id: 'push' as const, label: 'Notifications push', Icon: BellRing },
    { id: 'email' as const, label: 'E-mail', Icon: Mail },
    { id: 'whatsapp' as const, label: 'WhatsApp', Icon: MessageCircle },
  ];

  const preferenceItems = [
    { id: 'language' as const, title: 'Langue', subtitle: language, Icon: Globe },
    { id: 'city' as const, title: 'Ma ville', subtitle: city, Icon: MapPin },
    { id: 'interests' as const, title: "Mes centres d'intérêt", subtitle: `${interests.length} catégorie(s) sélectionnée(s)`, Icon: Heart },
    { id: 'calendar' as const, title: 'Calendrier', subtitle: 'Ajout manuel après réservation', Icon: CalendarDays },
  ];

  const securityItems = [
    { id: 'connection' as const, title: 'Mot de passe et connexion', subtitle: 'Sécuriser mon compte', Icon: LockKeyhole },
    { id: 'data' as const, title: 'Mes données personnelles', subtitle: 'Demander une copie de mes données', Icon: Download },
    { id: 'delete' as const, title: 'Supprimer mon compte', subtitle: 'Suppression sécurisée du compte', Icon: Trash2 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#130b1e] font-sans text-white">
      <PublicHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-5 py-10 md:px-8 md:py-14">
        {isLoading || !isAuthenticated || !hydrated ? (
          <div className="h-44 animate-pulse rounded-[22px] bg-[#24172f]" aria-label="Chargement des paramètres" />
        ) : (
          <>
            <header className="mb-8">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">Paramètres</h1>
              <p className="mt-3 text-sm text-[#b8a8c9] md:text-base">Personnalise ton expérience Looga.</p>
            </header>

            <div className="space-y-5">
              <section aria-labelledby="notifications-title" className="rounded-[22px] border border-[#45314e] bg-[#24172f] p-4 md:p-6">
                <h2 id="notifications-title" className="mb-4 flex items-center gap-3 text-lg font-bold">
                  <Bell className="h-5 w-5 text-[#ff791f]" aria-hidden="true" /> Notifications
                </h2>
                <div className="space-y-3">
                  {([
                    { id: 'discoveries' as const, title: 'Actualités & découvertes', description: 'Événements, sorties et nouveautés Looga.' },
                    { id: 'reminders' as const, title: "Rappels d'événements", description: 'Rappels prévus 24 h et 6 h avant tes événements réservés.' },
                  ]).map(group => (
                    <div key={group.id} className="rounded-2xl bg-[#30203b] p-4">
                      <h3 className="text-sm font-semibold md:text-base">{group.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#b8a8c9]">{group.description}</p>
                      <div className="mt-4 space-y-4">
                        {channelItems.map(({ id, label, Icon }) => (
                          <div key={id} className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-[#b8a8c9]" aria-hidden="true" />
                            <span className="min-w-0 flex-1 text-sm">{label}</span>
                            <Switch checked={notifications[group.id][id]} onChange={() => toggleNotification(group.id, id)} label={`${group.title} : ${label}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-[#b8a8c9]">
                  Les confirmations de réservation et informations essentielles sur les billets restent indépendantes de ces choix.
                  L'envoi réel par push, e-mail et WhatsApp sera activé après intégration des services correspondants.
                </p>
              </section>

              <section aria-labelledby="preferences-title" className="rounded-[22px] border border-[#45314e] bg-[#24172f] p-4 md:p-6">
                <h2 id="preferences-title" className="mb-4 flex items-center gap-3 text-lg font-bold">
                  <SlidersHorizontal className="h-5 w-5 text-[#ff791f]" aria-hidden="true" /> Préférences
                </h2>
                <div className="overflow-hidden rounded-2xl bg-[#30203b] divide-y divide-[#49354f]">
                  {preferenceItems.map(({ id, title, subtitle, Icon }) => (
                    <div key={id}>
                      <button type="button" aria-expanded={preferencePanel === id} onClick={() => setPreferencePanel(preferencePanel === id ? null : id)} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f]">
                        <Icon className="h-5 w-5 shrink-0 text-[#ff791f]" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{title}</span>
                          <span className="mt-1 block text-xs text-[#b8a8c9]">{subtitle}</span>
                        </span>
                        {preferencePanel === id ? <ChevronDown className="h-4 w-4 text-[#b8a8c9]" /> : <ChevronRight className="h-4 w-4 text-[#b8a8c9]" />}
                      </button>
                      {preferencePanel === id && (
                        <div className="px-4 pb-4 pl-12">
                          {id === 'language' && (
                            <>
                              <label htmlFor="looga-language" className="sr-only">Langue préférée</label>
                              <select id="looga-language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-xl border border-[#65516c] bg-[#24172f] p-3 text-sm text-white focus:outline-[#ff791f]">
                                <option value="Français">Français</option><option value="English">English</option>
                              </select>
                              <p className="mt-2 text-xs text-[#b8a8c9]">Le changement de langue de toute l'interface nécessite l'intégration des traductions.</p>
                            </>
                          )}
                          {id === 'city' && (
                            <>
                              <label htmlFor="looga-city" className="sr-only">Ville préférée</label>
                              <select id="looga-city" value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl border border-[#65516c] bg-[#24172f] p-3 text-sm text-white focus:outline-[#ff791f]">
                                {CITIES.map(value => <option key={value} value={value}>{value}</option>)}
                              </select>
                              <p className="mt-2 text-xs text-[#b8a8c9]">Ta ville sera prioritaire dans les recommandations après connexion de ce réglage au catalogue. Les autres villes resteront accessibles.</p>
                            </>
                          )}
                          {id === 'interests' && (
                            <>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {INTERESTS.map(value => (
                                  <button key={value} type="button" aria-pressed={interests.includes(value)} onClick={() => toggleInterest(value)} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f] ${interests.includes(value) ? 'border-[#ff791f] bg-[#51334a]' : 'border-[#49354f] bg-[#24172f] hover:border-[#85658b]'}`}>
                                    {interests.includes(value) ? '✓ ' : ''}{value}
                                  </button>
                                ))}
                              </div>
                              <p className="mt-2 text-xs text-[#b8a8c9]">Choix facultatifs, modifiables à tout moment. Leur utilisation pour les recommandations sera intégrée ultérieurement.</p>
                            </>
                          )}
                          {id === 'calendar' && (
                            <p className="text-xs leading-relaxed text-[#b8a8c9]">Après chaque réservation confirmée, un bouton « Ajouter au calendrier » sera proposé sur le billet, avec Google Calendar, Apple Calendar et Outlook. Aucun calendrier ne sera connecté automatiquement.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="security-title" className="rounded-[22px] border border-[#45314e] bg-[#24172f] p-4 md:p-6">
                <h2 id="security-title" className="mb-4 flex items-center gap-3 text-lg font-bold">
                  <Shield className="h-5 w-5 text-[#ff791f]" aria-hidden="true" /> Confidentialité et sécurité
                </h2>
                <div className="overflow-hidden rounded-2xl bg-[#30203b] divide-y divide-[#49354f]">
                  {securityItems.slice(0, 1).map(({ id, title, subtitle, Icon }) => (
                    <div key={id}>
                      <button type="button" aria-expanded={securityPanel === id} onClick={() => setSecurityPanel(securityPanel === id ? null : id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f]">
                        <Icon className="h-5 w-5 shrink-0 text-[#ff791f]" aria-hidden="true" />
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-[#b8a8c9]">{subtitle}</span></span>
                        {securityPanel === id ? <ChevronDown className="h-4 w-4 text-[#b8a8c9]" /> : <ChevronRight className="h-4 w-4 text-[#b8a8c9]" />}
                      </button>
                      {securityPanel === id && <p className="px-4 pb-4 pl-12 text-xs leading-relaxed text-[#b8a8c9]">La gestion du mot de passe et des méthodes de connexion sera reliée au système d'authentification existant. Aucune modification n'est effectuée depuis cet écran pour le moment.</p>}
                    </div>
                  ))}
                  <Link href="/confidentialite" className="flex items-center gap-3 p-4 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f]">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#ff791f]" aria-hidden="true" />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Politique de confidentialité</span><span className="mt-1 block text-xs text-[#b8a8c9]">Consulter notre politique</span></span>
                    <ChevronRight className="h-4 w-4 text-[#b8a8c9]" aria-hidden="true" />
                  </Link>
                  {securityItems.slice(1).map(({ id, title, subtitle, Icon }) => (
                    <div key={id}>
                      <button type="button" aria-expanded={securityPanel === id} onClick={() => setSecurityPanel(securityPanel === id ? null : id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff791f]">
                        <Icon className={`h-5 w-5 shrink-0 ${id === 'delete' ? 'text-[#f59a9a]' : 'text-[#ff791f]'}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1"><span className={`block text-sm font-semibold ${id === 'delete' ? 'text-[#f5b3b3]' : ''}`}>{title}</span><span className="mt-1 block text-xs text-[#b8a8c9]">{subtitle}</span></span>
                        {securityPanel === id ? <ChevronDown className="h-4 w-4 text-[#b8a8c9]" /> : <ChevronRight className="h-4 w-4 text-[#b8a8c9]" />}
                      </button>
                      {securityPanel === id && (
                        <p className="px-4 pb-4 pl-12 text-xs leading-relaxed text-[#b8a8c9]">
                          {id === 'data'
                            ? "La demande d'une copie de tes données sera disponible après mise en place d'un parcours sécurisé de vérification et d'export."
                            : "La suppression du compte nécessitera une vérification d'identité, une confirmation explicite et la prise en compte des obligations légales. Aucune suppression n'est déclenchée ici."}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div aria-live="polite" className="mt-4 min-h-6 text-sm text-[#b8a8c9]">
              {saved ? 'Préférences enregistrées sur cet appareil.' : ''}
            </div>
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
