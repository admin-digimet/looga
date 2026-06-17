// Modèle financier Looga — la commission 8% est prélevée sur chaque
// reversement organisateur (au moment du retrait, pas à la vente).

export const COMMISSION_RATE = 0.08

/** Commission Looga pour un montant de reversement (arrondi entier XOF). */
export function commissionFor(amount: number): number {
  return Math.round(amount * COMMISSION_RATE)
}

/** Montant net réellement versé à l'organisateur après commission Looga. */
export function netAfterCommission(amount: number): number {
  return amount - commissionFor(amount)
}
