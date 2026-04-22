import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Check, ChevronRight, MapPin, Calendar, Users } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { ScanEvent } from '@/types/scan';

interface EventSelectCardProps {
  event: ScanEvent;
  onPress: () => void;
  isActive?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getEventStatus(dateStr: string): 'live' | 'upcoming' | 'past' {
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Si l'événement est dans les 12h passées ou les 4h à venir → Live
  if (diffHours > -12 && diffHours < 4) return 'live';
  // Si dans le futur → Bientôt
  if (diffHours >= 4) return 'upcoming';
  // Sinon → passé
  return 'past';
}

export function EventSelectCard({ event, onPress, isActive }: EventSelectCardProps) {
  const progress = event.ticketsSold > 0
    ? Math.round((event.checkedIn / event.ticketsSold) * 100)
    : 0;
  const eventStatus = getEventStatus(event.date);

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🎉</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
          {eventStatus === 'live' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Live</Text>
            </View>
          )}
          {eventStatus === 'upcoming' && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>Bientôt</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <Calendar size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <MapPin size={12} color={Colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <View style={styles.statItem}>
              <Users size={11} color={Colors.textMuted} />
              <Text style={styles.metaText}>
                {event.checkedIn}/{event.ticketsSold}
              </Text>
            </View>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
        </View>
      </View>

      {isActive ? (
        <Check size={18} color={Colors.success} strokeWidth={2.5} />
      ) : (
        <ChevronRight size={18} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.success,
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 20,
    flexShrink: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,59,59,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  liveBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.error,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(255,184,0,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  upcomingBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.warning,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  progressRow: {
    marginTop: 6,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.orange,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressPct: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.orange,
  },
});
