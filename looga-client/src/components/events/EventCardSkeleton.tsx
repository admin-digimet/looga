import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';

export function EventCardSkeleton() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ]),
    ).start();
  }, [shimmer]);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surface2, Colors.surface],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { backgroundColor: bg }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.line, styles.lineTitle, { backgroundColor: bg }]} />
        <Animated.View style={[styles.line, styles.lineMeta, { backgroundColor: bg }]} />
        <Animated.View style={[styles.line, styles.linePrice, { backgroundColor: bg }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  line: {
    borderRadius: 6,
  },
  lineTitle: {
    height: 14,
    width: '70%',
  },
  lineMeta: {
    height: 12,
    width: '50%',
  },
  linePrice: {
    height: 12,
    width: '30%',
  },
});
