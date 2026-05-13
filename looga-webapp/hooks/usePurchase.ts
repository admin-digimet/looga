'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ticketsApi from '@/lib/api/tickets';
import type { PurchasePayload } from '@/types';

export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchasePayload) => ticketsApi.purchaseTicket(payload),
    onSuccess: () => {
      // Invalide le cache des tickets pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
