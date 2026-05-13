import '../global.css';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '@/lib/store/authStore';
import { useScanStore } from '@/lib/store/scanStore';
import { preloadSounds } from '@/lib/feedback';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export default function RootLayout() {
  const { loadToken, isLoading } = useAuthStore();
  const { loadFromStorage } = useScanStore();

  const [fontsLoaded] = useFonts({
    Syne_700Bold: require('../assets/fonts/Syne_700Bold.ttf'),
    Syne_800ExtraBold: require('../assets/fonts/Syne_800ExtraBold.ttf'),
    DMSans_400Regular: require('../assets/fonts/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('../assets/fonts/DMSans_500Medium.ttf'),
    DMSans_600SemiBold: require('../assets/fonts/DMSans_600SemiBold.ttf'),
  });

  useEffect(() => {
    loadToken();
    loadFromStorage();
    preloadSounds();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Ne pas rendre le Stack tant que les fonts et le token ne sont pas chargés
  // index.tsx gère la redirection via <Redirect> une fois monté
  if (!fontsLoaded || isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
