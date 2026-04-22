import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TicketCard } from '@/components/tickets/TicketCard';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useTickets } from '@/hooks/useTickets';
import { useTicketStore } from '@/lib/store/ticketStore';
import { useAuthStore } from '@/lib/store/authStore';
import type { LocalTicket } from '@/types/ticket';

type Filter = 'upcoming' | 'past';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function isUpcoming(ticket: LocalTicket): boolean {
  const date = new Date(ticket.eventDate);
  return date >= TODAY && ticket.status === 'valid';
}

export default function TicketsScreen() {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const { tickets } = useTicketStore();
  const { isAuthenticated } = useAuthStore();
  useTickets();

  const filtered = useMemo(() => {
    const real = filter === 'upcoming'
      ? tickets
          .filter(isUpcoming)
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      : tickets
          .filter((t) => !isUpcoming(t))
          .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return real;
  }, [tickets, filter]);

  const renderItem = useCallback(({ item }: { item: LocalTicket }) => (
    <TicketCard ticket={item} variant={filter === 'past' ? 'compact' : 'default'} />
  ), [filter]);

  const ListEmpty = (
    <View style={styles.emptyWrapper}>
      <Text style={styles.emptyTitle}>
        {filter === 'upcoming'
          ? 'Ton agenda est bien libre'
          : 'On dirait tu es resté tranquille jusqu\'ici 😄'}
      </Text>
      <TouchableOpacity
        style={styles.discoverBtn}
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.85}
      >
        <Text style={styles.discoverBtnText}>Découvrir des événements</Text>
      </TouchableOpacity>
      {!isAuthenticated && (
        <>
          <Text style={styles.missingLabel}>Un billet manquant ?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/welcome')}>
            <Text style={styles.findLink}>Trouver mes billets</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Billets</Text>
      </View>

      {/* Tabs underline */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setFilter('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabLabel, filter === 'upcoming' && styles.tabLabelActive]}>
            À venir
          </Text>
          {filter === 'upcoming' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setFilter('past')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabLabel, filter === 'past' && styles.tabLabelActive]}>
            Passés
          </Text>
          {filter === 'past' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
      <View style={styles.tabsDivider} />

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },

  tabsRow: { flexDirection: 'row', paddingHorizontal: 16 },
  tabItem: { paddingRight: 24, paddingBottom: 12, position: 'relative' },
  tabLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 24,
    height: 2,
    backgroundColor: Colors.orange,
    borderRadius: 1,
  },
  tabsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },

  listContent: { paddingBottom: 24 },

  emptyWrapper: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  discoverBtn: {
    backgroundColor: Colors.text,
    borderRadius: 100,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  discoverBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.surface,
  },
  missingLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 8,
  },
  findLink: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    textDecorationLine: 'underline',
  },
});
