import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';

import { useScanStore } from '@/lib/store/scanStore';
import { syncOfflineQueue, getOfflineQueueCount } from '@/lib/offline/queue';

/**
 * Hook qui surveille la connectivité réseau et synchronise
 * automatiquement les scans offline quand la connexion revient.
 */
export function useOfflineSync(eventId: string | undefined) {
  const wasOffline = useRef(false);
  const { setOffline, setPendingSyncCount } = useScanStore();

  useEffect(() => {
    if (!eventId) return;

    // Mettre à jour le compteur de scans en attente
    const count = getOfflineQueueCount(eventId);
    setPendingSyncCount(count);

    // Vérifier la connectivité périodiquement
    const interval = setInterval(async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const isConnected = state.isConnected && state.isInternetReachable !== false;

        if (!isConnected) {
          wasOffline.current = true;
          setOffline(true);
          return;
        }

        // On est en ligne
        setOffline(false);

        // Si on vient de passer de offline → online, synchroniser
        if (wasOffline.current) {
          wasOffline.current = false;
          const success = await syncOfflineQueue(eventId);
          if (success) {
            setPendingSyncCount(0);
          }
        }

        // Mettre à jour le compteur
        const pendingCount = getOfflineQueueCount(eventId);
        setPendingSyncCount(pendingCount);
      } catch {
        // Erreur réseau → on est probablement offline
        setOffline(true);
        wasOffline.current = true;
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Vérification initiale
    Network.getNetworkStateAsync().then((state) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      setOffline(!isConnected);
      if (!isConnected) wasOffline.current = true;
    }).catch(() => {
      // Ignorer
    });

    return () => clearInterval(interval);
  }, [eventId, setOffline, setPendingSyncCount]);
}
