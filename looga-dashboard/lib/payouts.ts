import type { SupabaseClient } from '@supabase/supabase-js'

/** Commission Looga prélevée sur chaque reversement organisateur (8%). */
export const COMMISSION_RATE = 0.08

/** Commission Looga pour un montant de retrait donné (arrondi entier XOF). */
export function commissionFor(amount: number): number {
  return Math.round(amount * COMMISSION_RATE)
}

/** Montant net réellement reçu par l'organisateur après commission Looga. */
export function netAfterCommission(amount: number): number {
  return amount - commissionFor(amount)
}

export interface OrganizerBalance {
  revenue_total: number   // Total brut des ventes (tickets valid/used)
  paid_out: number        // Total déjà versé
  locked: number          // En attente (pending + approved, pas encore payé)
  available: number       // Solde retirable = revenue_total - paid_out - locked
}

/**
 * Calcule le solde de l'organizer à partir des tickets vendus et des payouts.
 * Doit être appelé avec un client admin (service_role) pour bypass RLS.
 */
export async function computeOrganizerBalance(
  admin: SupabaseClient,
  organizerId: string,
): Promise<OrganizerBalance> {
  // 1. Récupérer tous les events de l'organizer
  const { data: events } = await admin
    .from('events')
    .select('id')
    .eq('organizer_id', organizerId)

  const eventIds = (events ?? []).map((e: { id: string }) => e.id)

  let revenueTotal = 0
  if (eventIds.length > 0) {
    // 2. Sum des tickets valid/used (revenu brut)
    const { data: tickets } = await admin
      .from('tickets')
      .select('total_price, status')
      .in('event_id', eventIds)
      .in('status', ['valid', 'used'])

    revenueTotal = (tickets ?? []).reduce(
      (sum: number, t: { total_price: number | null }) => sum + (t.total_price ?? 0),
      0,
    )
  }

  // 3. Sum payouts paid + locked
  const { data: payouts } = await admin
    .from('payout_requests')
    .select('amount, status')
    .eq('organizer_id', organizerId)

  let paidOut = 0
  let locked = 0
  for (const p of payouts ?? []) {
    if (p.status === 'paid') paidOut += p.amount
    else if (p.status === 'pending' || p.status === 'approved') locked += p.amount
  }

  return {
    revenue_total: revenueTotal,
    paid_out: paidOut,
    locked,
    available: Math.max(0, revenueTotal - paidOut - locked),
  }
}
