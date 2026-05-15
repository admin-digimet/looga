import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { PaymentMethod } from '@/types/ticket';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const METHOD_CONFIG: Record<PaymentMethod, { source: number; label: string }> = {
  mtn_momo:     { source: require('@/assets/payment/mtn-momo.png'),        label: 'MTN MoMo' },
  orange_money: { source: require('@/assets/payment/orange-money.png'),    label: 'Orange Money' },
  wave:         { source: require('@/assets/payment/wave.png'),            label: 'Wave' },
  card:         { source: require('@/assets/payment/carte-bancaire.webp'), label: 'Carte bancaire' },
};

export function PaymentMethodCard({ method, selected, onSelect }: PaymentMethodCardProps) {
  const { source, label } = METHOD_CONFIG[method];

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onSelect(method)}
      activeOpacity={0.75}
    >
      <Image source={source} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected && (
        <Text style={styles.selectedLabel}>Sélectionné</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1.2,
    backgroundColor: Colors.surface2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardSelected: {
    borderColor: Colors.orange,
    backgroundColor: Colors.surface,
  },
  logo: {
    width: 40,
    height: 40,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  labelSelected: {
    color: Colors.text,
  },
  selectedLabel: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
