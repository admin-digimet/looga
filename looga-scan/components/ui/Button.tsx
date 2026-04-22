import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradient } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gradient' | 'solid';
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'gradient',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'solid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.solidWrapper, isDisabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.authBtnText} size="small" />
        ) : (
          <Text style={styles.solidLabel}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.wrapper, isDisabled && styles.disabled]}
    >
      <LinearGradient
        colors={Gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.gradientLabel}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#fff',
    letterSpacing: 0.3,
  },
  solidWrapper: {
    backgroundColor: Colors.authBtn,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.authBtnText,
    letterSpacing: 0.3,
  },
});
