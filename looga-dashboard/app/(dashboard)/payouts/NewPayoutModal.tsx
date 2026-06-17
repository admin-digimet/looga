'use client'

import { useState } from 'react'
import { PaymentMethodIcon } from '@/components/PaymentMethodIcon'
import { COMMISSION_RATE, commissionFor, netAfterCommission } from '@/lib/payouts'

type Method = 'mtn_momo' | 'orange_money' | 'wave' | 'bank_transfer'

const METHODS: { value: Method; label: string }[] = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
]

interface NewPayoutModalProps {
  available: number
  onClose: () => void
  onCreated: () => void
}

export function NewPayoutModal({ available, onClose, onCreated }: NewPayoutModalProps) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Method>('mtn_momo')
  const [phone, setPhone] = useState('')
  const [bank, setBank] = useState({ holder: '', bank: '', account: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountNum = Number(amount)
  const amountValid = amountNum > 0 && amountNum <= available
  const isMobile = method !== 'bank_transfer'
  const mobileFilled = !isMobile || phone.trim().length > 0
  const bankFilled = method !== 'bank_transfer' || (bank.holder.trim() && bank.bank.trim() && bank.account.trim())
  const canSubmit = amountValid && mobileFilled && bankFilled && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          method,
          phone_number: isMobile ? phone.trim() : undefined,
          bank_details: method === 'bank_transfer' ? bank : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la demande')
        return
      }
      onCreated()
    } catch (e) {
      setError((e as Error).message ?? 'Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-heading font-bold text-lg mb-1">Nouvelle demande de reversement</h3>
        <p className="text-sm text-base-content/60 mb-5">
          Solde disponible : <span className="font-bold text-primary">{available.toLocaleString('fr-FR')} FCFA</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Montant */}
          <div>
            <label className="label py-1">
              <span className="label-text font-medium">Montant (FCFA)</span>
            </label>
            <input
              type="number"
              min={1}
              max={available}
              required
              className="input input-bordered w-full"
              placeholder="Ex: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount && !amountValid && (
              <p className="text-xs text-error mt-1">
                Le montant doit être &gt; 0 et ≤ {available.toLocaleString('fr-FR')} FCFA
              </p>
            )}
            {amountValid && (
              <div className="mt-2 rounded-lg bg-base-200 p-3 text-sm space-y-1">
                <div className="flex justify-between text-base-content/70">
                  <span>Commission Looga ({Math.round(COMMISSION_RATE * 100)} %)</span>
                  <span>− {commissionFor(amountNum).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tu recevras</span>
                  <span className="text-success">{netAfterCommission(amountNum).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            )}
          </div>

          {/* Méthode */}
          <div>
            <label className="label py-1">
              <span className="label-text font-medium">Méthode de paiement</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`btn btn-sm h-auto py-2 justify-start gap-2 ${
                    method === m.value ? 'btn-primary' : 'btn-ghost border border-base-300'
                  }`}
                >
                  <PaymentMethodIcon method={m.value} size="sm" />
                  <span className="truncate text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Numéro mobile money */}
          {isMobile && (
            <div>
              <label className="label py-1">
                <span className="label-text font-medium">Numéro de téléphone</span>
                <span className="label-text-alt text-base-content/40">
                  {METHODS.find((m) => m.value === method)?.label}
                </span>
              </label>
              <input
                type="tel"
                required
                className="input input-bordered w-full"
                placeholder="+225 07 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {/* Coordonnées bancaires */}
          {method === 'bank_transfer' && (
            <div className="flex flex-col gap-3 bg-base-200 p-4 rounded-xl">
              <p className="text-xs text-base-content/60 font-medium">Coordonnées bancaires</p>
              <input
                type="text"
                required
                className="input input-bordered input-sm w-full"
                placeholder="Nom du titulaire"
                value={bank.holder}
                onChange={(e) => setBank((b) => ({ ...b, holder: e.target.value }))}
              />
              <input
                type="text"
                required
                className="input input-bordered input-sm w-full"
                placeholder="Nom de la banque"
                value={bank.bank}
                onChange={(e) => setBank((b) => ({ ...b, bank: e.target.value }))}
              />
              <input
                type="text"
                required
                className="input input-bordered input-sm w-full"
                placeholder="RIB / IBAN"
                value={bank.account}
                onChange={(e) => setBank((b) => ({ ...b, account: e.target.value }))}
              />
            </div>
          )}

          {/* Récap */}
          {amountValid && (
            <div className="alert alert-info text-sm">
              <span>
                Tu vas demander un retrait de <strong>{amountNum.toLocaleString('fr-FR')} FCFA</strong> via{' '}
                <strong>{METHODS.find((m) => m.value === method)?.label}</strong>.
                <br />
                <span className="text-xs text-base-content/60">
                  Délai habituel : 24 à 48 h. Tu seras notifié quand le virement est effectué.
                </span>
              </span>
            </div>
          )}

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {submitting && <span className="loading loading-spinner loading-xs" />}
              Confirmer la demande
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => !submitting && onClose()} />
    </dialog>
  )
}
