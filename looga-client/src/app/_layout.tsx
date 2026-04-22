import '../global.css';

import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '@/lib/store/authStore';
import { useTicketStore } from '@/lib/store/ticketStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const { loadToken, isAuthenticated, isLoading } = useAuthStore();
  const { loadTickets } = useTicketStore();
  const hasNavigated = useRef(false);

  const [fontsLoaded, fontError] = useFonts({
    Syne_700Bold: require('../../assets/fonts/Syne_700Bold.ttf'),
    Syne_800ExtraBold: require('../../assets/fonts/Syne_800ExtraBold.ttf'),
    DMSans_400Regular: require('../../assets/fonts/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('../../assets/fonts/DMSans_500Medium.ttf'),
    DMSans_600SemiBold: require('../../assets/fonts/DMSans_600SemiBold.ttf'),
  });

  useEffect(() => {
    loadToken();
    loadTickets();
  }, []);

  useEffect(() => {
    if ((!fontsLoaded && !fontError) || isLoading) return;
    if (hasNavigated.current) return;

    hasNavigated.current = true;
    SplashScreen.hideAsync().catch(() => {});

    router.replace('/(tabs)');
  }, [fontsLoaded, fontError, isLoading, isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
