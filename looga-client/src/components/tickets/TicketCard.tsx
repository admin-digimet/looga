import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronRight, Clock, QrCode } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { LocalTicket, TicketStatus } from '@/types/ticket';

interface TicketCardProps {
  ticket: LocalTicket;
  variant?: 'default' | 'compact';
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; fg: string }> = {
  pending:   { label: 'En attente', bg: 'rgba(255,184,0,0.12)', fg: Colors.warning },
  valid:     { label: 'Valide',     bg: 'rgba(0,200,100,0.12)', fg: Colors.success },
  used:      { label: 'Utilisé',    bg: 'rgba(0,0,0,0.06)',     fg: Colors.textMuted },
  expired:   { label: 'Expiré',     bg: 'rgba(255,59,59,0.12)', fg: Colors.error },
  cancelled: { label: 'Annulé',     bg: 'rgba(0,0,0,0.06)',     fg: Colors.textMuted },
};

function parseDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Carte billet (les deux variants ont le même design, le QR est sur la page détail) ──
function TicketListCard({ ticket }: { ticket: LocalTicket }) {
  const status = STATUS_CONFIG[ticket.status];
  const dateLabel = parseDate(ticket.eventDate);
  const timeLabel = (ticket.eventTime ?? '').replace(':', 'h');
  // Pas de QR tant que le paiement n'est pas confirmé.
  const canShowQr = ticket.status === 'valid' || ticket.status === 'used';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/ticket/${ticket.id}`)}
      activeOpacity={0.88}
    >
      {/* ── TOP — image + overlay ── */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: ticket.eventImage ?? '' }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: status.fg }]} />
          <Text style={[styles.statusLabel, { color: status.fg }]}>{status.label}</Text>
        </View>
        {/* Event name overlay */}
        <View style={styles.imageInfo}>
          <Text style={styles.imageEventName} numberOfLines={2}>
            {ticket.eventName}
          </Text>
        </View>
      </View>

      {/* ── PERFORATION ── */}
      <View style={styles.perforationRow}>
        <View style={styles.circleLeft} />
        <View style={styles.dashes} />
        <View style={styles.circleRight} />
      </View>

      {/* ── BOTTOM — infos ── */}
      <View style={styles.bottom}>
        <View style={styles.bottomLeft}>
          <Text style={styles.dateText}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </Text>
          <Text style={styles.timeText}>{timeLabel}</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {ticket.eventLocation}
          </Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{ticket.eventCategory}</Text>
          </View>
        </View>

        <View style={styles.bottomRight}>
          {canShowQr ? (
            <>
              <QrCode size={20} color={Colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.tapLabel}>Voir QR</Text>
            </>
          ) : (
            <>
              <Clock size={20} color={Colors.warning} strokeWidth={1.5} />
              <Text style={[styles.tapLabel, { color: Colors.warning }]}>En attente</Text>
            </>
          )}
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function TicketCard({ ticket, variant = 'default' }: TicketCardProps) {
  return <TicketListCard ticket={ticket} />;
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  // ── Image header ──
  imageWrap: {
    height: 130,
    position: 'relative',
    backgroundColor: Colors.surface2,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
  },
  imageInfo: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  imageEventName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // ── Perforation ──
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -1,
  },
  circleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    marginLeft: -10,
  },
  circleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    marginRight: -10,
  },
  dashes: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },

  // ── Bottom info ──
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
  },
  bottomLeft: {
    flex: 1,
    gap: 3,
  },
  dateText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  timeText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  locationText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface2,
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  categoryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  bottomRight: {
    alignItems: 'center',
    gap: 4,
  },
  tapLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
