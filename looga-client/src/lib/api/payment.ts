import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/api';

interface PaymentVerifyPayload {
  transactionId: string;
  eventId: string;
}

interface PaymentVerifyResponse {
  success: boolean;
  ticketId?: string;
  message?: string;
}

export async function verifyPayment(
  payload: PaymentVerifyPayload
): Promise<PaymentVerifyResponse> {
  const { data } = await apiClient.post<PaymentVerifyResponse>(
    ENDPOINTS.paymentVerify,
    payload
  );
  return data;
}
