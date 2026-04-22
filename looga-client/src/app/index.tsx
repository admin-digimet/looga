import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

// Écran de passage — le _layout.tsx redirige vers (auth) ou (tabs) selon la session
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.orange} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
