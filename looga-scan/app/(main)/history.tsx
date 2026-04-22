import { useState } from 'react';
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
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useScanHistory } from '@/hooks/useScan';
import { useScanStore } from '@/lib/store/scanStore';
import type { ScanRecord, ScanStatus } from '@/types/scan';

type Filter = 'all' | 'valid' | 'already_used';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'valid', label: 'Valides' },
  { key: 'already_used', label: 'Déjà utilisés' },
];

const STATUS_CFG: Record<ScanStatus, { label: string; color: string; Icon: typeof CheckCircle }> = {
  valid:        { label: 'Valide',       color: Colors.success, Icon: CheckCircle  },
  already_used: { label: 'Déjà utilisé', color: Colors.warning, Icon: AlertCircle  },
  invalid:      { label: 'Invalide',     color: Colors.error,   Icon: XCircle      },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function ScanRecordItem({ record }: { record: ScanRecord }) {
  const cfg = STATUS_CFG[record.status];

  return (
    <View style={styles.item}>
      {/* Avatar initiales */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {record.attendeeName ? getInitials(record.attendeeName) : '#'}
        </Text>
      </View>

      {/* Infos */}
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>
          {record.attendeeName || 'Participant inconnu'}
        </Text>
        <Text style={styles.itemType}>
          {record.ticketType || record.ticketId || '—'}
        </Text>
      </View>

      {/* Statut + heure */}
      <View style={styles.itemRight}>
        <View style={[styles.statusBadge, { backgroundColor: `${cfg.color}18` }]}>
          <cfg.Icon size={10} color={cfg.color} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.itemTime}>{formatTime(record.scannedAt)}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const { activeEvent, scanCount } = useScanStore();

  const eventId = activeEvent?.id ?? '';
  const { data: serverHistory, isLoading, refetch, isRefetching } = useScanHistory(eventId);

  // Utilise l'historique local si pas de données serveur
  const { scanHistory: localHistory } = useScanStore();
  const history = serverHistory ?? localHistory;

  const filtered = history.filter((r) =>
    filter === 'all' ? true : r.status === filter
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        {activeEvent && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {activeEvent.name} · {scanCount} validé{scanCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {isLoading && !localHistory.length ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.orange]} tintColor={Colors.orange} />}
        >
          <ActivityIndicator color={Colors.orange} size="large" />
        </ScrollView>
      ) : filtered.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.orange]} tintColor={Colors.orange} />}
        >
          <Text style={styles.emptyText}>Aucun scan pour l&apos;instant.</Text>
        </ScrollView>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ScanRecordItem record={item} />}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,92,26,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  itemType: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
  },
  itemTime: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
});
