import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';

export function FeaturedCardSkeleton() {
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
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
      <View style={styles.bottom}>
        <Animated.View style={[styles.badge, { backgroundColor: bg }]} />
        <Animated.View style={[styles.title, { backgroundColor: bg }]} />
        <Animated.View style={[styles.meta, { backgroundColor: bg }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    marginRight: 12,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 6,
  },
  badge: {
    height: 18,
    width: 60,
    borderRadius: 100,
  },
  title: {
    height: 15,
    width: '80%',
    borderRadius: 6,
  },
  meta: {
    height: 11,
    width: '60%',
    borderRadius: 6,
  },
});
