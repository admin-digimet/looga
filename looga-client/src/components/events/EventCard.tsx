import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Flame, Heart, Share2, Users } from 'lucide-react-native';
import { Share } from 'react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { formatDate, formatPrice } from '@/lib/utils/formatters';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { isSaved, toggle } = useSavedStore();
  const saved = isSaved(event.id);

  function handleShare() {
    Share.share({ message: `${event.name} — ${event.location}` });
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.85}
    >
      {/* Image + badge tendance */}
      <View>
        <Image
          source={{ uri: event.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {event.trending && (
          <View style={styles.trendingBadge}>
            <Flame size={10} color="#FFFFFF" />
            <Text style={styles.trendingText}>Tendance</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        {/* Titre + actions */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Share2 size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => toggle(event)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={18}
              color={saved ? Colors.orange : Colors.textMuted}
              fill={saved ? Colors.orange : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Date · lieu */}
        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(event.date)} · {event.location}
        </Text>

        {/* Preuve sociale */}
        {!!event.participantCount && event.participantCount > 0 && (
          <View style={styles.socialRow}>
            <Users size={11} color={Colors.textMuted} />
            <Text style={styles.socialText}>+{event.participantCount} participants</Text>
          </View>
        )}

        {/* Prix */}
        <Text style={styles.price}>
          {event.minPrice === 0 ? 'Gratuit' : formatPrice(event.minPrice)}
        </Text>
      </View>

      {/* Séparateur */}
      <View style={styles.separator} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
  },
  info: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  iconBtn: {
    paddingTop: 2,
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  socialText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  price: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  trendingText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
});
