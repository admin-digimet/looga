'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { initPayment, initFreeTicket, type InitPaymentPayload } from '@/lib/api/payment';

export function useInitPayment() {
  return useMutation({
    mutationFn: (payload: InitPaymentPayload) => initPayment(payload),
  });
}

export function useInitFreeTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitPaymentPayload) => initFreeTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
