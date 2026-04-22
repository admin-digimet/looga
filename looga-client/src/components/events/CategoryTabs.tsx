import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { EventCategory } from '@/types/event';

const CATEGORIES: EventCategory[] = ['tout', 'concerts', 'soirees', 'culture', 'sports', 'workshops'];

const LABELS: Record<EventCategory, string> = {
  tout: 'Tout',
  concerts: 'Concerts',
  soirees: 'Soirées',
  culture: 'Culture',
  sports: 'Sports',
  workshops: 'Workshops',
};

interface CategoryTabsProps {
  selected: EventCategory;
  onSelect: (category: EventCategory) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const renderChip = useCallback(
    (category: EventCategory) => {
      const isActive = category === selected;
      return (
        <TouchableOpacity
          key={category}
          onPress={() => onSelect(category)}
          style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
            {LABELS[category]}
          </Text>
        </TouchableOpacity>
      );
    },
    [selected, onSelect]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(renderChip)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: Colors.orange,
  },
  chipInactive: {
    backgroundColor: Colors.surface2,
  },
  chipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
  },
  chipTextActive: {
    color: Colors.text,
  },
  chipTextInactive: {
    color: Colors.textMuted,
  },
});
