import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ReactElement } from 'react';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactElement;
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.wrapper, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconWrap}>{leftIcon}</View>}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 100,
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
