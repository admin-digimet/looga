import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  MapPin,
  Share2,
  Timer,
} from 'lucide-react-native';

import { ArtistCard } from '@/components/events/ArtistCard';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/lib/store/authStore';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { formatDate, formatPrice } from '@/lib/utils/formatters';
import type { Artist, OtherShow } from '@/types/event';

// Extrait lat/lng depuis une URL Google Maps (formats @lat,lng ou ?q=lat,lng)
function parseCoords(url?: string): { latitude: number; longitude: number } | null {
  if (!url) return null;
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ??
            url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!m) return null;
  return { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) };
}

const CATEGORY_LABELS: Record<string, string> = {
  concerts:    'Concerts & Musique',
  soirees:     'Soirées & Fêtes',
  culture:     'Culture & Arts',
  sports:      'Sports & Fitness',
  workshops:   'Ateliers & Formation',
  gastronomie: 'Gastronomie & Food',
  conferences: 'Conférences & Séminaires',
  networking:  'Networking & Business',
  mode:        'Mode & Lifestyle',
  famille:     'Famille & Loisirs',
  humour:      'Humour & Stand-up',
  religieux:   'Religieux & Spirituel',
  cinema:      'Cinéma & Séries',
  caritatif:   'Caritatif & Solidaire',
  enfants:     'Enfants & Jeunesse',
  gaming:      'Gaming & E-sport',
  tournee:     'Caravane & Tournée',
  salon:       'Salon & Exposition',
  theatre:     'Théâtre & Spectacle',
  bien_etre:   'Bien-être & Yoga',
  festival:    'Festival & Carnaval',
  auto_moto:   'Auto-Moto & Course',
  autre:       'Événement',
  tout:        'Événement',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading, isError } = useEvent(id);
  const { isAuthenticated } = useAuthStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [descExpanded, setDescExpanded] = useState(false);
  // Coords depuis l'URL organisateur, fallback Abidjan centre
  const coords = parseCoords(event?.locationUrl) ?? { latitude: 5.3364, longitude: -4.0266 };

  // Calcul stock restant pour la bannière d'urgence
  const totalStock = (event?.ticketTypes ?? [])
    .filter((t) => !t.soldOut && t.stock > 0)
    .reduce((sum, t) => sum + t.stock, 0);
  const showUrgency = !event?.isSoldOut && totalStock > 0 && totalStock < 100;
  const isAlmostGone = totalStock <= 20;

  async function handleShare() {
    if (!event) return;
    await Share.share({ message: `${event.name} — ${formatDate(event.date)} à ${event.location}` });
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.orange} size="large" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger l'événement.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnText}>
          <Text style={styles.backBtnLabel}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stickyBarHeight = 80 + insets.bottom;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: stickyBarHeight + 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HERO IMAGE ─────────────────────────────────────────────────────
            Image pleine largeur 260px + gradient bas + boutons back/share   */}
        <View style={[styles.hero, { width }]}>
          <Image
            source={{ uri: event.image }}
            style={[styles.heroImage, { width }]}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', Colors.bg]}
            style={[StyleSheet.absoluteFill, { top: '40%' }]}
          />
          {/* Bouton retour */}
          <TouchableOpacity
            style={[styles.heroBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Bouton partager */}
          <TouchableOpacity
            style={[styles.heroBtn, styles.heroBtnRight, { top: insets.top + 8 }]}
            onPress={handleShare}
          >
            <Share2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── CONTENU ────────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Badge catégorie */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {CATEGORY_LABELS[event.category] ?? 'Événement'}
            </Text>
          </View>

          {/* Titre de l'événement */}
          <Text style={styles.title}>{event.name}</Text>

          {/* Tag artiste vérifié — affiché si event.artistVerified */}
          {event.artistVerified && (
            <View style={styles.verifiedTag}>
              <BadgeCheck size={14} color={Colors.orange} />
              <Text style={styles.verifiedText}>Artiste vérifié</Text>
            </View>
          )}

          {/* ── INFOS PRINCIPALES (grille 2 colonnes) ──────────────────────
              Date / Heure / Lieu / Durée
              Changer les icônes : importer depuis lucide-react-native      */}
          <View style={styles.infoGrid}>
            <InfoChip Icon={CalendarDays} label={formatDate(event.date)} />
            <InfoChip Icon={Clock} label={event.time} />
            <InfoChip Icon={MapPin} label={event.location} />
            {event.duration && <InfoChip Icon={Timer} label={event.duration} />}
          </View>

          <View style={styles.divider} />

          {/* ── URGENCE ────────────────────────────────────────────────────
              Affichée si stock restant < 100 et non sold out               */}
          {showUrgency && (
            <View style={[styles.urgencyBanner, isAlmostGone && styles.urgencyBannerRed]}>
              {isAlmostGone
                ? <Flame size={15} color={Colors.orange} />
                : <AlertTriangle size={15} color={Colors.warning} />}
              <Text style={[styles.urgencyText, isAlmostGone && styles.urgencyTextRed]}>
                {isAlmostGone
                  ? `Bientôt épuisé — Plus que ${totalStock} place${totalStock > 1 ? 's' : ''}`
                  : `Plus que ${totalStock} places disponibles`}
              </Text>
            </View>
          )}

          {/* ── DESCRIPTION ────────────────────────────────────────────────
              Collapsible : 3 lignes max, "Lire plus" pour développer       */}
          <Text style={styles.sectionLabel}>À propos</Text>
          <Text
            style={styles.description}
            numberOfLines={descExpanded ? undefined : 3}
          >
            {event.description}
          </Text>
          <TouchableOpacity
            style={styles.readMoreBtn}
            onPress={() => setDescExpanded((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {descExpanded ? (
              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Lire moins</Text>
                <ChevronUp size={14} color={Colors.orange} />
              </View>
            ) : (
              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Lire plus</Text>
                <ChevronDown size={14} color={Colors.orange} />
              </View>
            )}
          </TouchableOpacity>

          {/* ── LINE-UP ARTISTES ────────────────────────────────────────────
              Scroll horizontal si artistes présents                        */}
          {event.artists && event.artists.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Line-up</Text>
              <FlatList<Artist>
                data={event.artists}
                keyExtractor={(a) => a.id}
                renderItem={({ item }) => <ArtistCard artist={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artistsList}
              />
            </>
          )}

          {/* ── PHOTOS ──────────────────────────────────────────────────────
              FlatList horizontal si event.images[] présent                 */}
          {event.images && event.images.length > 0 && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Photos" />
              <FlatList
                data={event.images}
                keyExtractor={(uri, i) => `photo-${i}`}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.photoItem}
                    contentFit="cover"
                    transition={200}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              />
            </>
          )}

          {/* ── CONFIANCE ──────────────────────────────────────────────────
              Section garantie Looga — toujours visible                    */}
          <View style={styles.divider} />
          <View style={styles.trustCard}>
            <Text style={styles.trustTitle}>Entrée garantie avec Looga</Text>
            <View style={styles.trustRow}>
              <TrustChip label="Billet sécurisé" />
              <TrustChip label="Accès garanti" />
              <TrustChip label="Sans fraude" />
            </View>
          </View>

          {/* ── LOCALISATION ───────────────────────────────────────────────
              WebView Google Maps + card info                               */}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Localisation</Text>

          {/* Carte native react-native-maps */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.mapWebView}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : process.env.GOOGLE_MAPS_API_KEY}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              liteMode={Platform.OS === 'android'}
            >
              <Marker
                coordinate={coords}
                title={event.location}
                pinColor={Colors.orange}
              />
            </MapView>
          </View>

          {/* Info card */}
          <View style={styles.locationCard}>
            <MapPin size={16} color={Colors.orange} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{event.location}</Text>
              <Text style={styles.locationOrg}>Organisé par {event.organizerName}</Text>
            </View>
            {event.locationUrl && (
              <TouchableOpacity onPress={() => Linking.openURL(event.locationUrl!)}>
                <Text style={styles.locationLink}>Ouvrir dans Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── TOUS LES SPECTACLES ────────────────────────────────────────
              Liste des autres dates si event.otherShows[] présent          */}
          {event.otherShows && event.otherShows.length > 0 && (
            <>
              <View style={styles.divider} />
              <SectionHeader title={`Tous les spectacles`} />
              {event.otherShows.map((show) => (
                <OtherShowRow key={show.id} show={show} />
              ))}
            </>
          )}

          {/* Sold out banner */}
          {event.isSoldOut && (
            <View style={styles.soldOutBanner}>
              <Text style={styles.soldOutText}>COMPLET — Plus de billets disponibles</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── STICKY BUY BAR ─────────────────────────────────────────────────
          Fixée en bas : prix + bouton "Trouver mon billet"
          Modifier hauteur : stickyBarHeight = 80 + insets.bottom           */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom || 16 }]}>

        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.price}>{formatPrice(event.minPrice)}</Text>
        </View>

        <View style={styles.buyButtonWrapper}>
          <Button
            label={event.isSoldOut ? 'Sold out' : 'Réserver ma place'}
            onPress={() => {
              if (!isAuthenticated) {
                router.push({
                  pathname: '/(auth)/welcome',
                  params: { returnTo: `/payment/${event.id}` },
                });
              } else {
                router.push(`/payment/${event.id}`);
              }
            }}
            disabled={event.isSoldOut}
          />
        </View>
      </View>
    </View>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function InfoChip({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}) {
  return (
    <View style={styles.chip}>
      <Icon size={13} color={Colors.orange} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function TrustChip({ label }: { label: string }) {
  return (
    <View style={styles.trustChip}>
      <Check size={11} color={Colors.success} strokeWidth={3} />
      <Text style={styles.trustChipText}>{label}</Text>
    </View>
  );
}

function OtherShowRow({ show }: { show: OtherShow }) {
  return (
    <View style={styles.otherShowRow}>
      <View style={styles.otherShowInfo}>
        <Text style={styles.otherShowVenue}>{show.venueName}</Text>
        <Text style={styles.otherShowMeta}>{show.city} · {formatDate(show.date)}</Text>
      </View>
      <Text style={styles.otherShowPrice}>{formatPrice(show.minPrice)}</Text>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  backBtnText: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface2,
    borderRadius: 100,
  },
  backBtnLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },
  scroll: {
    flex: 1,
  },

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    height: 260,
    position: 'relative',
  },
  heroImage: {
    height: 260,
    backgroundColor: Colors.surface2,
  },
  heroBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnRight: {
    left: undefined,
    right: 16,
  },

  // ── Content ──────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.badge,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 34,
  },
  // Badge artiste vérifié
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  verifiedText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },

  // ── Info chips (grille 2 colonnes) ────────────────────────────────────────
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
    // Chaque chip prend ~50% de la largeur
    flexBasis: '47%',
    flexGrow: 1,
  },
  chipLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.text,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },

  // ── Description ──────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 8,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },

  // ── Artists ──────────────────────────────────────────────────────────────
  artistsList: {
    gap: 16,
    paddingBottom: 4,
  },

  // ── Photos ───────────────────────────────────────────────────────────────
  photosList: {
    gap: 10,
    paddingBottom: 4,
  },
  photoItem: {
    width: 160,
    height: 110,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
  },

  // ── Map ──────────────────────────────────────────────────────────────────
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.surface2,
  },
  mapWebView: {
    flex: 1,
  },
  // ── Location card ─────────────────────────────────────────────────────────
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 4,
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  locationOrg: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  locationLink: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
    flexShrink: 0,
  },

  // ── Other shows ───────────────────────────────────────────────────────────
  otherShowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  otherShowInfo: {
    flex: 1,
    gap: 3,
  },
  otherShowVenue: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  otherShowMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  otherShowPrice: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.orange,
  },

  // ── Sold out ──────────────────────────────────────────────────────────────
  soldOutBanner: {
    backgroundColor: `${Colors.error}22`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  soldOutText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.error,
  },

  // ── Urgency banner ───────────────────────────────────────────────────────
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.warning}18`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  urgencyBannerRed: {
    backgroundColor: `${Colors.orange}12`,
    borderColor: `${Colors.orange}35`,
  },
  urgencyIcon: {
    fontSize: 15,
  },
  urgencyText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  urgencyTextRed: {
    color: Colors.orange,
  },

  // ── Trust card ────────────────────────────────────────────────────────────
  trustCard: {
    backgroundColor: `${Colors.success}0C`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.success}25`,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  trustTitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface2,
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  trustChipText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.text,
  },

  // ── Sticky bar ────────────────────────────────────────────────────────────
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  price: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.orange,
  },
  buyButtonWrapper: {
    flex: 1,
    marginLeft: 16,
  },
});
