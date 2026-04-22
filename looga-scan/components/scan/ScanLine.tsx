import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';

const LINE_HEIGHT = 2;
const SCAN_AREA_HEIGHT = 240; // Doit correspondre à FRAME_SIZE dans ScanFrame

export function ScanLineAnimation() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(SCAN_AREA_HEIGHT - LINE_HEIGHT, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infini
      true  // reverse
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.line, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: LINE_HEIGHT,
    backgroundColor: Colors.success,
    borderRadius: 1,
    opacity: 0.7,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
});
