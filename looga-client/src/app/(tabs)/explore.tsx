import { FlashList } from '@shopify/flash-list';
import { CalendarDays, Flame, Search, Tag, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/events/EventCard';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useSearchEvents } from '@/hooks/useEvents';
import type { Event, EventCategory } from '@/types/event';

type QuickFilter = 'all' | 'weekend' | 'free';

const CATEGORIES: { key: EventCategory; label: string }[] = [
  { key: 'tout',        label: 'Tout' },
  { key: 'soirees',    label: 'Soirées' },
  { key: 'concerts',   label: 'Concerts' },
  { key: 'culture',    label: 'Culture' },
  { key: 'gastronomie',label: 'Food' },
  { key: 'sports',     label: 'Sports' },
  { key: 'conferences',label: 'Conférences' },
  { key: 'workshops',  label: 'Workshops' },
  { key: 'networking', label: 'Networking' },
  { key: 'mode',       label: 'Lifestyle' },
  { key: 'famille',    label: 'Famille' },
  { key: 'humour',     label: 'Humour' },
  { key: 'religieux',  label: 'Religieux' },
  { key: 'cinema',     label: 'Cinéma' },
  { key: 'caritatif',  label: 'Caritatif' },
  { key: 'enfants',    label: 'Enfants' },
  { key: 'gaming',     label: 'Gaming' },
  { key: 'tournee',    label: 'Tournée' },
  { key: 'salon',      label: 'Salon' },
  { key: 'theatre',    label: 'Théâtre' },
  { key: 'bien_etre',  label: 'Bien-être' },
  { key: 'festival',   label: 'Festival' },
  { key: 'auto_moto',  label: 'Auto-Moto' },
  { key: 'autre',      label: 'Autre' },
];

const QUICK_FILTERS: {
  key: QuickFilter;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { key: 'all',     label: 'Populaires',   Icon: Flame },
  { key: 'weekend', label: 'Ce week-end',  Icon: CalendarDays },
  { key: 'free',    label: 'Gratuit',      Icon: Tag },
];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<EventCategory>('tout');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  // Debounce : on n'interroge le serveur qu'après 350 ms de pause de frappe.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Quick filters → filtres serveur (parité web).
  const price = quickFilter === 'free' ? 'free' : 'all';
  const period = quickFilter === 'weekend' ? 'weekend' : 'all';

  const { data, isLoading, isError, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
    useSearchEvents({ q: debouncedSearch, category, price, period });

  const events: Event[] = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? events.length;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: Event }) => (
    <View style={styles.cardWrapper}>
      <EventCard event={item} />
    </View>
  ), []);

  const ListHeader = (
    <View>
      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={17} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Que veux-tu faire aujourd'hui ?"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            spellCheck={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres rapides (row 1) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {QUICK_FILTERS.map(({ key, label, Icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.quickChip, quickFilter === key && styles.quickChipActive]}
            onPress={() => setQuickFilter(key)}
            activeOpacity={0.7}
          >
            <Icon
              size={13}
              color={quickFilter === key ? Colors.bg : Colors.textMuted}
            />
            <Text style={[styles.quickLabel, quickFilter === key && styles.quickLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Catégories (row 2) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {CATEGORIES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterChip, category === key && styles.filterChipActive]}
            onPress={() => setCategory(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, category === key && styles.filterLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Compteur résultats */}
      {!isLoading && events.length > 0 && (
        <Text style={styles.resultsCount}>
          {total} événement{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <View style={styles.flex}>
          {ListHeader}
          <ActivityIndicator color={Colors.orange} size="large" style={{ marginTop: 48 }} />
        </View>
      ) : isError ? (
        <View style={styles.flex}>
          {ListHeader}
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>Une erreur est survenue.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlashList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator color={Colors.orange} style={styles.footer} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Text style={styles.emptyText}>Aucun événement trouvé.</Text>
            </View>
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },

  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.text,
    padding: 0,
    backgroundColor: 'transparent',
  },

  filtersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },

  // Quick filters
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickChipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  quickLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  quickLabelActive: {
    color: Colors.bg,
  },

  // Category chips
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  filterLabelActive: {
    color: Colors.surface,
  },

  resultsCount: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },

  listContent: { paddingBottom: 24 },
  cardWrapper: { paddingHorizontal: 16, paddingTop: 8 },

  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  footer: { paddingVertical: 20 },
});
