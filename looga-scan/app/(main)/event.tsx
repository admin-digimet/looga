import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventSelectCard } from '@/components/events/EventSelectCard';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useEvents } from '@/hooks/useEvents';
import { downloadEventTickets } from '@/lib/offline/cache';
import { useScanStore } from '@/lib/store/scanStore';
import type { ScanEvent } from '@/types/scan';
import type { AxiosError } from 'axios';

export default function EventTabScreen() {
  const { data: events, isLoading, isError, error, refetch, isRefetching } = useEvents();
  const { activeEvent, setActiveEvent, scanCount } = useScanStore();

  const handleSelect = useCallback(
    (event: ScanEvent) => {
      setActiveEvent(event);
      // Télécharger le cache billets en background pour le mode offline
      downloadEventTickets(event.id);
    },
    [setActiveEvent]
  );

  const ListHeader = (
    <View>
      {/* Événement actif */}
      {activeEvent && (
        <View style={styles.activeEventBanner}>
          <View style={styles.activeEventInfo}>
            <Text style={styles.activeEventLabel}>Événement actif</Text>
            <Text style={styles.activeEventName} numberOfLines={1}>
              {activeEvent.name}
            </Text>
            <Text style={styles.activeEventMeta}>
              {scanCount} billet{scanCount !== 1 ? 's' : ''} validé
              {scanCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Titre liste */}
      <Text style={styles.listTitle}>
        {activeEvent ? 'Changer d\'événement' : 'Choisir un événement'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Événement</Text>
          <Text style={styles.headerSub}>
            {activeEvent
              ? activeEvent.name
              : 'Sélectionne un événement pour scanner'}
          </Text>
        </View>
      </View>

      {/* Contenu */}
      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.orange]} tintColor={Colors.orange} />}
        >
          <ActivityIndicator color={Colors.orange} size="large" />
        </ScrollView>
      ) : isError ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.orange]} tintColor={Colors.orange} />}
        >
          <Text style={styles.errorText}>Impossible de charger les événements.</Text>
          <Text style={styles.errorDetail}>{(error as any)?.message ?? 'Tire vers le bas pour réessayer.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : !events || events.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.orange]} tintColor={Colors.orange} />}
        >
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyText}>Tu n&apos;as pas d&apos;événements assignés pour l&apos;instant.</Text>
        </ScrollView>
      ) : (
        <FlashList
          data={events}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => (
            <EventSelectCard
              event={item}
              onPress={() => handleSelect(item)}
              isActive={activeEvent?.id === item.id}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.orange]}
              tintColor={Colors.orange}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Active event banner
  activeEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  activeEventInfo: {
    flex: 1,
    gap: 2,
  },
  activeEventLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeEventName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  activeEventMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Events list
  listTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 10,
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'center',
  },
  errorDetail: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.orange,
    borderRadius: 100,
  },
  retryText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
