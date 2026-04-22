import { useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Flag,
  MapPin,
  Share2,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useTicketStore } from '@/lib/store/ticketStore';
import { useAuthStore } from '@/lib/store/authStore';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTicket } = useTicketStore();
  const { user } = useAuthStore();
  const shotRef = useRef<ViewShot>(null);

  const ticket = getTicket(id ?? '');

  async function captureTicket(): Promise<string | null> {
    try {
      const uri = await shotRef.current?.capture?.();
      return uri ?? null;
    } catch {
      return null;
    }
  }

  // Header : partage le lien vers l'événement (pas le billet)
  function handleShareEventLink() {
    if (!ticket?.eventId) return;
    const { Share } = require('react-native');
    Share.share({
      message: `Découvre "${ticket.eventName}" sur Looga 🎫`,
      url: `looga://event/${ticket.eventId}`,
    });
  }

  function handleAddToCalendar() {
    if (!ticket) return;
    const { day } = parseDate(ticket.eventDate, ticket.eventTime);
    // Format date for Google Calendar (YYYYMMDDTHHmmss)
    const dateObj = new Date(ticket.eventDate);
    const pad = (n: number) => String(n).padStart(2, '0');
    const [hh, mm] = (ticket.eventTime ?? '00:00').split(':');
    const start =
      `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}` +
      `T${pad(Number(hh))}${pad(Number(mm))}00`;
    // End = start + 3h
    const endDate = new Date(dateObj);
    endDate.setHours(Number(hh) + 3, Number(mm));
    const end =
      `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}` +
      `T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(ticket.eventName)}` +
      `&dates=${start}/${end}` +
      `&location=${encodeURIComponent(ticket.eventLocation)}` +
      `&details=${encodeURIComponent(`Billet Looga — ${ticket.ticketNumber}`)}`;
    Linking.openURL(url);
  }

  function handleViewOnMap() {
    if (!ticket) return;
    const q = encodeURIComponent(`${ticket.eventLocation}, Abidjan`);
    const url = Platform.OS === 'ios'
      ? `maps://?q=${q}`
      : `https://maps.google.com/?q=${q}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${q}`)
    );
  }

  function handleOrderDetails() {
    if (!ticket) return;
    Alert.alert(
      'Détails de la commande',
      `Événement : ${ticket.eventName}\n` +
      `Billet n° : ${ticket.ticketNumber}\n` +
      `Lieu : ${ticket.eventLocation}\n` +
      `Statut : ${ticket.status === 'valid' ? 'Valide' : ticket.status === 'used' ? 'Utilisé' : 'Expiré'}`,
      [{ text: 'OK' }]
    );
  }

  async function handleDownload() {
    const uri = await captureTicket();
    if (!uri) {
      Alert.alert('Erreur', 'Impossible de capturer le billet.');
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Billet sauvegardé ✓', 'Image enregistrée dans ta galerie.');
        return;
      }
    } catch {
      // Expo Go sandbox ou permission refusée → fallback share sheet
    }
    // Fallback : share sheet natif (inclut "Enregistrer dans Photos")
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Enregistrer le billet' });
  }

  function handleTicketInfo() {
    if (!ticket) return;
    Alert.alert(
      'Informations du billet',
      `N° de billet : ${ticket.ticketNumber}\n` +
      `Catégorie : ${ticket.eventCategory}\n` +
      `Titulaire : ${user?.name ?? '—'}\n` +
      `Code QR : ${ticket.qrValue.slice(0, 20)}...`,
      [{ text: 'OK' }]
    );
  }

  function handleReport() {
    Linking.openURL('mailto:support@looga.ci?subject=Problème billet ' + (ticket?.ticketNumber ?? ''));
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Billet introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const holderName = user?.name ?? '—';
  const { day: startDay, time: startTime } = parseDate(ticket.eventDate, ticket.eventTime);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShareEventLink}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── TICKET CARD — enveloppé dans ViewShot pour capture image ── */}
        <ViewShot
          ref={shotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.shotWrapper}
        >
        <View style={styles.card}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Date bold */}
          <View style={styles.dateBlock}>
            <Text style={styles.dateDay}>{startDay}</Text>
            <Text style={styles.dateTime}>{startTime}</Text>
          </View>

          {/* Event row */}
          <View style={styles.eventRow}>
            {ticket.eventImage ? (
              <Image
                source={{ uri: ticket.eventImage }}
                style={styles.thumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <Text style={styles.eventName} numberOfLines={2}>
              {ticket.eventName}
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrWrap}>
            <QRCode
              value={ticket.qrValue || 'LOOGA-PLACEHOLDER'}
              size={220}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Holder */}
          <View style={styles.holderBlock}>
            <Text style={styles.holderName}>
              {holderName} · Billet 1 sur 1
            </Text>
            <Text style={styles.holderCategory}>{ticket.eventCategory}</Text>
          </View>

          {/* Download button */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleDownload}
            activeOpacity={0.85}
          >
            <Download size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Télécharger le billet</Text>
          </TouchableOpacity>
        </View>
        </ViewShot>

        {/* ── DATE ET HEURE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCol}>
              <Text style={styles.dtLabel}>{startDay}</Text>
              <Text style={styles.dtValue}>{startTime}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleAddToCalendar}>
            <Text style={styles.linkText}>Ajouter au calendrier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── LIEU ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lieu</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{ticket.eventLocation}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleViewOnMap}>
            <Text style={styles.linkText}>Voir sur la carte</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── ACTIONS ── */}
        <View style={styles.actionsBlock}>
          <ActionRow
            Icon={CalendarDays}
            label="Détails de l'événement"
            onPress={() => {
              if (ticket.eventId) router.push(`/event/${ticket.eventId}`);
            }}
          />
          <ActionRow Icon={FileText} label="Détails de la commande" onPress={handleOrderDetails} />
          <ActionRow Icon={Ticket} label="Informations sur le billet" onPress={handleTicketInfo} />
          <ActionRow Icon={Flag} label="Signaler un problème" onPress={handleReport} last />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionRow({
  Icon,
  label,
  onPress,
  danger,
  last,
}: {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const color = danger ? Colors.error : Colors.text;
  return (
    <>
      <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
        <Icon size={18} color={color} strokeWidth={1.5} />
        <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>
          {label}
        </Text>
        <ChevronRight size={16} color={Colors.textMuted} />
      </TouchableOpacity>
      {!last && <View style={styles.actionDivider} />}
    </>
  );
}

/** Parse "2026-03-08" + "22:00" → { day: "Samedi 8 mars 2026", time: "22h00" } */
function parseDate(dateStr: string, timeStr: string) {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  // Convert "22:00" → "22h00"
  const time = timeStr.replace(':', 'h');
  return { day: day.charAt(0).toUpperCase() + day.slice(1), time };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingBottom: 48 },

  shotWrapper: {
    backgroundColor: Colors.bg,
    paddingBottom: 4,
  },

  // ── CARD ──
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  // Date
  dateBlock: { gap: 2 },
  dateDay: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  dateTime: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },

  // Event row
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    flexShrink: 0,
  },
  thumbPlaceholder: { backgroundColor: Colors.surface2 },
  eventName: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 22,
  },

  // QR
  qrWrap: {
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Holder
  holderBlock: { alignItems: 'center', gap: 4 },
  holderName: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  holderCategory: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
    textTransform: 'capitalize',
  },

  // Share button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.text,
    borderRadius: 100,
    paddingVertical: 16,
  },
  shareBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
  },

  // Info sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
    marginBottom: 4,
  },
  dateTimeRow: { flexDirection: 'row', gap: 40 },
  dateTimeCol: { gap: 2 },
  dtLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  dtValue: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  linkText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    textDecorationLine: 'underline',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },

  // Actions
  actionsBlock: { paddingHorizontal: 20, paddingTop: 8 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  actionLabel: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  actionLabelDanger: { color: Colors.error },
  actionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
});
