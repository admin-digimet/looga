import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Search, SlidersHorizontal, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedCard } from '@/components/events/FeaturedCard';
import { EventCard } from '@/components/events/EventCard';
import { EventCardSkeleton } from '@/components/events/EventCardSkeleton';
import { FeaturedCardSkeleton } from '@/components/events/FeaturedCardSkeleton';
import { Colors, Gradient } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/lib/store/authStore';
import type { Event } from '@/types/event';

const HORIZONTAL_LIMIT = 5;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function getMicroTag(event: Event, idx: number): string | undefined {
  if (!event.date) return idx === 0 ? 'Tendance' : undefined;
  const now = new Date();
  const eventDate = new Date(event.date);
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours >= 0 && diffHours <= 10) return 'Ce soir';

  const diffDays = diffHours / 24;
  if (diffDays >= 0 && diffDays <= 7) {
    const day = eventDate.getDay();
    if (day === 0 || day === 6) return 'Ce week-end';
  }

  if (event.createdAt) {
    const createdHoursAgo = (now.getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60);
    if (createdHoursAgo <= 48) return 'Nouveau';
  }

  if (idx === 0) return 'Tendance';
  return undefined;
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents('tout');

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allEvents: Event[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Sections horizontales — 5 events max chacune
  const mustSee    = allEvents.slice(0, HORIZONTAL_LIMIT);
  const loogaPicks = allEvents.slice(HORIZONTAL_LIMIT, HORIZONTAL_LIMIT * 2);

  // Feed vertical — scroll infini, tout ce qui reste après les 2 sections
  const feedEvents = allEvents.slice(HORIZONTAL_LIMIT * 2);

  // Si la page 1 remplit exactement les sections horizontales,
  // feedEvents est vide et onEndReached ne se déclenche jamais.
  // On force le chargement de la page suivante dès que c'est le cas.
  useEffect(() => {
    if (!isLoading && feedEvents.length === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isLoading, feedEvents.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const firstName = user?.name?.split(' ')[0] ?? 'toi';
  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() ?? 'U';

  const renderFeedItem = useCallback(({ item }: { item: Event }) => (
    <View style={styles.cardWrapper}>
      <EventCard event={item} />
    </View>
  ), []);

  const refreshControl = (
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={handleRefresh}
      tintColor={Colors.orange}
      colors={[Colors.orange]}
      progressBackgroundColor={Colors.surface}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
            <Text style={styles.greetingSub}>Tu fais quoi aujourd'hui ?</Text>
          </View>
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <Search size={18} color={Colors.textMuted} />
              <Text style={styles.searchPlaceholder}>Concerts, soirées, expos…</Text>
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <Flame size={16} color={Colors.orange} />
            <Text style={styles.sectionTitle}>À ne pas rater</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {Array.from({ length: 3 }).map((_, i) => <FeaturedCardSkeleton key={i} />)}
          </ScrollView>
          <View style={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>Une erreur est survenue.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ListHeaderComponent — sections horizontales curatoriales ─────────────
  const listHeader = (
    <View>
      {/* Top nav */}
      <View style={styles.topNav}>
        <LinearGradient
          colors={Gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoGradient}
        >
          <Text style={styles.logoText}>looga</Text>
        </LinearGradient>

        <View style={styles.topNavRight}>
          <LinearGradient
            colors={Gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Greeting — compact */}
      <View style={styles.greetingWrapper}>
        <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
        <Text style={styles.greetingSub}>Tu fais quoi ce soir ?</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.8}
        >
          <Search size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Concerts, soirées, expos…</Text>
          <View style={styles.filterBtn}>
            <SlidersHorizontal size={16} color={Colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Section 1 — À ne pas rater */}
      {mustSee.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Flame size={16} color={Colors.orange} />
            <View style={styles.sectionTitles}>
              <Text style={styles.sectionTitle}>À ne pas rater</Text>
              <Text style={styles.sectionSub}>Ce qui fait vraiment bouger Abidjan</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {mustSee.map((item, idx) => (
              <FeaturedCard key={item.id} event={item} microTag={getMicroTag(item, idx)} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section 2 — Sélection Looga */}
      {loogaPicks.length > 0 && (
        <View style={styles.sectionGap}>
          <View style={styles.sectionHeader}>
            <Star size={16} color={Colors.orange} />
            <View style={styles.sectionTitles}>
              <Text style={styles.sectionTitle}>Sélection Looga</Text>
              <Text style={styles.sectionSub}>Nos coups de cœur du moment</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {loogaPicks.map((item, idx) => (
              <FeaturedCard key={item.id} event={item} microTag={getMicroTag(item, idx)} />
            ))}
          </ScrollView>
        </View>
      )}

      {feedEvents.length > 0 && (
        <View style={styles.feedDividerWrapper}>
          <View style={styles.feedDivider} />
        </View>
      )}
    </View>
  );

  // ── ListFooterComponent ────────────────────────────────────────────────────
  const listFooter = (
    <View>
      {/* Chargement de la page suivante */}
      {isFetchingNextPage && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={Colors.orange} />
          <Text style={styles.loadingMoreText}>Chargement…</Text>
        </View>
      )}

      {/* Fin du feed */}
      {!hasNextPage && feedEvents.length > 0 && (
        <View style={styles.endOfFeed}>
          <Text style={styles.endOfFeedText}>Tu as tout vu !</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.85}
          >
            <Search size={14} color={Colors.orange} />
            <Text style={styles.exploreBtnText}>Affiner avec la recherche</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlashList
        data={feedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  logoGradient: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoText: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.lg,
    color: '#fff',
    letterSpacing: -0.5,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xs,
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Greeting — compact
  greetingWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 1,
  },
  greeting: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  greetingSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Search bar
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 100,
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  sectionGap: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitles: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  sectionSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  hScroll: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingBottom: 8,
  },

  feedDividerWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  feedDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },

  // Feed items
  cardWrapper: {
    paddingHorizontal: 16,
  },

  // Loading more
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // End of feed
  endOfFeed: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 12,
  },
  endOfFeedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exploreBtnText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },

  // Skeleton
  skeletonList: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 8,
  },

  // Error
  errorWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
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

});
