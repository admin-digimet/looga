import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { formatDate } from '@/lib/utils/formatters';
import type { Event } from '@/types/event';

interface FeaturedCardProps {
  event: Event;
  microTag?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  concerts:    'Concert',
  soirees:     'Soirée',
  culture:     'Culture',
  sports:      'Sport',
  workshops:   'Workshop',
  gastronomie: 'Food',
  conferences: 'Conférence',
  networking:  'Networking',
  mode:        'Lifestyle',
  famille:     'Famille',
  humour:      'Humour',
  religieux:   'Religieux',
  cinema:      'Cinéma',
  caritatif:   'Caritatif',
  enfants:     'Enfants',
  gaming:      'Gaming',
  tournee:     'Tournée',
  salon:       'Salon',
  theatre:     'Théâtre',
  bien_etre:   'Bien-être',
  festival:    'Festival',
  auto_moto:   'Auto-Moto',
  autre:       'Événement',
  tout:        'Événement',
};

export function FeaturedCard({ event, microTag }: FeaturedCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: event.image }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{CATEGORY_LABELS[event.category] ?? 'Événement'}</Text>
      </View>
      {microTag && (
        <View style={styles.microTag}>
          <Text style={styles.microTagText}>{microTag}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{event.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(event.date)} · {event.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.badge,
  },
  info: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  name: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  microTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  microTagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
