import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Ticket, XCircle } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface CounterRowProps {
  validCount: number;
  totalTickets: number;
  refusedCount: number;
}

export function CounterRow({ validCount, totalTickets, refusedCount }: CounterRowProps) {
  return (
    <View style={styles.row}>
      <CounterItem
        icon={<CheckCircle size={14} color={Colors.success} />}
        value={validCount}
        label="Validés"
        color={Colors.success}
      />
      <View style={styles.divider} />
      <CounterItem
        icon={<Ticket size={14} color="rgba(255,255,255,0.6)" />}
        value={totalTickets}
        label="Total"
        color="rgba(255,255,255,0.8)"
      />
      <View style={styles.divider} />
      <CounterItem
        icon={<XCircle size={14} color={Colors.error} />}
        value={refusedCount}
        label="Refusés"
        color={Colors.error}
      />
    </View>
  );
}

function CounterItem({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemTop}>
        {icon}
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.lg,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
});
