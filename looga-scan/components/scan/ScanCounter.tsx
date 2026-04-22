import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface ScanCounterProps {
  count: number;
  eventName: string;
}

export function ScanCounter({ count, eventName }: ScanCounterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <CheckCircle size={14} color={Colors.success} strokeWidth={2.5} />
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>billet{count !== 1 ? 's' : ''} validé{count !== 1 ? 's' : ''}</Text>
      </View>
      <Text style={styles.event} numberOfLines={1}>{eventName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  count: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  event: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 240,
    textAlign: 'center',
  },
});
