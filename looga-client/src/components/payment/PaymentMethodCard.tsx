import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CreditCard } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { PaymentMethod } from '@/types/ticket';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
}

const METHOD_CONFIG: Record<PaymentMethod, { brandColor: string; label: string; isCard: boolean }> = {
  mtn_momo:     { brandColor: '#FFCC00', label: 'MTN MoMo',      isCard: false },
  orange_money: { brandColor: '#FF6600', label: 'Orange Money',   isCard: false },
  wave:         { brandColor: '#1AC9FF', label: 'Wave',           isCard: false },
  card:         { brandColor: Colors.violetLight, label: 'Carte bancaire', isCard: true },
};

export function PaymentMethodCard({ method, selected, onSelect }: PaymentMethodCardProps) {
  const { brandColor, label, isCard } = METHOD_CONFIG[method];

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onSelect(method)}
      activeOpacity={0.75}
    >
      {isCard ? (
        <CreditCard size={28} color={brandColor} />
      ) : (
        <View style={[styles.brandDot, { backgroundColor: brandColor }]} />
      )}
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
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
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
