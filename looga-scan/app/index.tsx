import { Redirect } from 'expo-router';

import { useAuthStore } from '@/lib/store/authStore';
import { useScanStore } from '@/lib/store/scanStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { activeEvent } = useScanStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Si un événement est déjà sélectionné, aller au scanner directement
  // Sinon aller à l'onglet événement pour en choisir un
  return activeEvent
    ? <Redirect href={'/(main)/scan' as any} />
    : <Redirect href={'/(main)/event' as any} />;
}
