'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Event, EventCategory, EventStatus, CreateEventPayload, CreateTicketTypePayload } from '@/types'

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'concerts',     label: 'Concerts & Musique' },
  { value: 'soirees',      label: 'Soirées & Fêtes' },
  { value: 'culture',      label: 'Culture & Arts' },
  { value: 'sports',       label: 'Sports & Fitness' },
  { value: 'workshops',    label: 'Ateliers & Formation' },
  { value: 'gastronomie',  label: 'Gastronomie & Food' },
  { value: 'conferences',  label: 'Conférences & Séminaires' },
  { value: 'networking',   label: 'Networking & Business' },
  { value: 'mode',         label: 'Mode & Lifestyle' },
  { value: 'famille',      label: 'Famille & Loisirs' },
  { value: 'humour',       label: 'Humour & Stand-up' },
  { value: 'religieux',    label: 'Religieux & Spirituel' },
  { value: 'cinema',       label: 'Cinéma & Séries' },
  { value: 'caritatif',    label: 'Caritatif & Solidaire' },
  { value: 'enfants',      label: 'Enfants & Jeunesse' },
  { value: 'gaming',       label: 'Gaming & E-sport' },
  { value: 'tournee',      label: 'Caravane & Tournée' },
  { value: 'salon',        label: 'Salon & Exposition' },
  { value: 'theatre',      label: 'Théâtre & Spectacle' },
  { value: 'bien_etre',    label: 'Bien-être & Yoga' },
  { value: 'festival',     label: 'Festival & Carnaval' },
  { value: 'auto_moto',    label: 'Auto-Moto & Course' },
  { value: 'autre',        label: 'Autre' },
]

interface EventFormProps {
  event?: Event
  mode: 'create' | 'edit'
}

const emptyTicketType: CreateTicketTypePayload = {
  name: '',
  description: '',
  price: 0,
  stock_total: 100,
  advantages: '',
}

export default function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    category: (event?.category ?? 'concerts') as EventCategory,
    event_date: event?.event_date ?? '',
    event_time: event?.event_time ?? '',
    location_name: event?.location_name ?? '',
    location_address: event?.location_address ?? '',
    location_url: event?.location_url ?? '',
    image_url: event?.image_url ?? '',
    status: (event?.status ?? 'published') as EventStatus,
  })

  const [ticketTypes, setTicketTypes] = useState<CreateTicketTypePayload[]>(
    event?.ticket_types?.map((t) => ({
      name: t.name,
      description: t.description ?? '',
      price: t.price,
      stock_total: t.stock_total,
      advantages: t.advantages ?? '',
    })) ?? [{ ...emptyTicketType }],
  )

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleTicketChange(index: number, field: keyof CreateTicketTypePayload, value: string | number) {
    setTicketTypes((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  function addTicketType() {
    setTicketTypes((prev) => [...prev, { ...emptyTicketType }])
  }

  function removeTicketType(index: number) {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (ticketTypes.length === 0) {
      setError('Ajoute au moins un type de billet.')
      return
    }

    setLoading(true)

    const payload: CreateEventPayload = { ...form, ticket_types: ticketTypes }

    const url = mode === 'create' ? '/api/events' : `/api/events/${event!.id}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'create' ? payload : form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    router.push(`/events/${data.id ?? event!.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && (
        <div className="alert alert-error text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Infos générales */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body gap-4">
          <h2 className="font-heading font-bold text-lg">Informations générales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control md:col-span-2">
              <div className="label"><span className="label-text font-medium">Titre de l&apos;événement *</span></div>
              <input
                name="title"
                type="text"
                placeholder="Afrobeat Night — Magic City"
                className="input input-bordered w-full"
                value={form.title}
                onChange={handleFieldChange}
                required
              />
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Catégorie *</span></div>
              <select name="category" className="select select-bordered" value={form.category} onChange={handleFieldChange}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Statut</span></div>
              <select name="status" className="select select-bordered" value={form.status} onChange={handleFieldChange}>
                <option value="published">Publié (visible sur l&apos;app)</option>
                <option value="draft">Brouillon (non visible)</option>
                <option value="cancelled">Annulé</option>
              </select>
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Date *</span></div>
              <input
                name="event_date"
                type="date"
                className="input input-bordered"
                value={form.event_date}
                onChange={handleFieldChange}
                required
              />
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Heure *</span></div>
              <input
                name="event_time"
                type="time"
                className="input input-bordered"
                value={form.event_time}
                onChange={handleFieldChange}
                required
              />
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Lieu *</span></div>
              <input
                name="location_name"
                type="text"
                placeholder="Magic City Club"
                className="input input-bordered"
                value={form.location_name}
                onChange={handleFieldChange}
                required
              />
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text font-medium">Adresse</span></div>
              <input
                name="location_address"
                type="text"
                placeholder="Marcory, Abidjan"
                className="input input-bordered"
                value={form.location_address}
                onChange={handleFieldChange}
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text font-medium">Lien Maps (Google Maps / Waze)</span>
                <span className="label-text-alt text-base-content/50">Optionnel — les participants pourront l&apos;ouvrir depuis l&apos;app</span>
              </div>
              <input
                name="location_url"
                type="url"
                placeholder="https://maps.google.com/?q=..."
                className="input input-bordered w-full"
                value={form.location_url}
                onChange={handleFieldChange}
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label"><span className="label-text font-medium">URL de l&apos;image</span></div>
              <input
                name="image_url"
                type="url"
                placeholder="https://..."
                className="input input-bordered w-full"
                value={form.image_url}
                onChange={handleFieldChange}
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label"><span className="label-text font-medium">Description</span></div>
              <textarea
                name="description"
                placeholder="Décris ton événement..."
                className="textarea textarea-bordered w-full h-24 resize-none"
                value={form.description}
                onChange={handleFieldChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Types de billets */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg">Types de billets</h2>
            <button type="button" onClick={addTicketType} className="btn btn-outline btn-primary btn-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {ticketTypes.map((ticket, idx) => (
              <div key={idx} className="bg-base-100 rounded-xl p-4 border border-base-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-base-content/60">Billet #{idx + 1}</span>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(idx)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="form-control md:col-span-2">
                    <div className="label"><span className="label-text text-xs font-medium">Nom *</span></div>
                    <input
                      type="text"
                      placeholder="Standard"
                      className="input input-bordered input-sm"
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(idx, 'name', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-control">
                    <div className="label"><span className="label-text text-xs font-medium">Prix (FCFA) *</span></div>
                    <input
                      type="number"
                      min={0}
                      placeholder="2000"
                      className="input input-bordered input-sm"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(idx, 'price', Number(e.target.value))}
                      required
                    />
                  </label>
                  <label className="form-control">
                    <div className="label"><span className="label-text text-xs font-medium">Stock *</span></div>
                    <input
                      type="number"
                      min={1}
                      placeholder="100"
                      className="input input-bordered input-sm"
                      value={ticket.stock_total}
                      onChange={(e) => handleTicketChange(idx, 'stock_total', Number(e.target.value))}
                      required
                    />
                  </label>
                  <label className="form-control md:col-span-2">
                    <div className="label"><span className="label-text text-xs font-medium">Description</span></div>
                    <input
                      type="text"
                      placeholder="Accès général à l'événement"
                      className="input input-bordered input-sm"
                      value={ticket.description}
                      onChange={(e) => handleTicketChange(idx, 'description', e.target.value)}
                    />
                  </label>
                  <label className="form-control md:col-span-2">
                    <div className="label"><span className="label-text text-xs font-medium">Avantages</span></div>
                    <input
                      type="text"
                      placeholder="Open bar inclus"
                      className="input input-bordered input-sm"
                      value={ticket.advantages}
                      onChange={(e) => handleTicketChange(idx, 'advantages', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn btn-ghost">
          Annuler
        </button>
        <button type="submit" className="btn btn-primary min-w-32" disabled={loading}>
          {loading
            ? <span className="loading loading-spinner loading-sm" />
            : mode === 'create' ? 'Publier l\'événement' : 'Enregistrer'
          }
        </button>
      </div>
    </form>
  )
}
