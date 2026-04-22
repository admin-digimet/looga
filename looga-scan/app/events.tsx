import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';

import { EventSelectCard } from '@/components/events/EventSelectCard';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useEvents } from '@/hooks/useEvents';
import { useLogout } from '@/hooks/useAuth';
import { useScanStore } from '@/lib/store/scanStore';
import type { ScanEvent } from '@/types/scan';

export default function EventsScreen() {
  const { data: events, isLoading, isError, refetch, isRefetching } = useEvents();
  const { setActiveEvent } = useScanStore();
  const logoutMutation = useLogout();

  const handleSelect = useCallback(
    (event: ScanEvent) => {
      setActiveEvent(event);
      router.replace('/(main)/scan');
    },
    [setActiveEvent]
  );

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quel événement ?</Text>
          <Text style={styles.headerSub}>Sélectionne l'événement à scanner</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <LogOut size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.orange} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Impossible de charger les événements.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : !events || events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyText}>
            Tu n'as pas d'événements assignés pour l'instant.
          </Text>
        </View>
      ) : (
        <FlashList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventSelectCard
              event={item}
              onPress={() => handleSelect(item)}
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
    paddingBottom: 16,
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
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
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
