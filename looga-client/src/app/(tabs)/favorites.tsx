import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/events/EventCard';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types/event';

export default function FavoritesScreen() {
  const { savedEvents } = useSavedStore();

  const renderItem = useCallback(({ item }: { item: Event }) => (
    <View style={styles.cardWrapper}>
      <EventCard event={item} />
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoris</Text>
        {savedEvents.length > 0 && (
          <Text style={styles.count}>{savedEvents.length} événement{savedEvents.length > 1 ? 's' : ''}</Text>
        )}
      </View>

      <FlashList
        data={savedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        estimatedItemSize={280}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyText}>Aucun événement sauvegardé</Text>
            <Text style={styles.emptyHint}>
              Appuie sur ♡ sur un événement pour le retrouver ici.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  count: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  listContent: { paddingBottom: 24 },
  cardWrapper: { paddingHorizontal: 16, paddingTop: 8 },
  emptyWrapper: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.textMuted,
  },
  emptyText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
