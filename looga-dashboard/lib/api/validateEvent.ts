// Validation serveur des payloads d'événement (création + édition).
// Empêche les données invalides même si le formulaire est contourné (curl/Postman)
// et renvoie un message FR clair plutôt qu'une erreur Postgres brute.

interface TicketTypeInput {
  name?: unknown
  price?: unknown
  stock_total?: unknown
}

interface EventInput {
  title?: unknown
  category?: unknown
  event_date?: unknown
  event_time?: unknown
  location_name?: unknown
  ticket_types?: unknown
}

function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Valide les types de billets. `requireFull` = true à la création (tous les
 * champs requis), false à l'édition partielle (on ne valide que ce qui est fourni).
 */
export function validateTicketTypes(list: unknown, requireFull: boolean): string | null {
  if (list == null) return null
  if (!Array.isArray(list)) return 'Les types de billets sont invalides.'
  for (const raw of list as TicketTypeInput[]) {
    if (requireFull && !isNonEmptyString(raw.name)) {
      return 'Chaque type de billet doit avoir un nom.'
    }
    if (raw.price !== undefined) {
      const price = Number(raw.price)
      if (!Number.isFinite(price) || price < 0) {
        return 'Le prix d’un billet ne peut pas être négatif.'
      }
    }
    if (raw.stock_total !== undefined) {
      const stock = Number(raw.stock_total)
      if (!Number.isInteger(stock) || stock < 1) {
        return 'La quantité d’un billet doit être d’au moins 1.'
      }
    }
  }
  return null
}

/** Validation complète d'un payload de CRÉATION d'événement. Renvoie un message d'erreur ou null. */
export function validateEventCreate(body: EventInput): string | null {
  if (!isNonEmptyString(body.title)) return 'Le titre de l’événement est requis.'
  if (!isNonEmptyString(body.category)) return 'La catégorie est requise.'
  if (!isNonEmptyString(body.event_date)) return 'La date de l’événement est requise.'
  if (!isNonEmptyString(body.event_time)) return 'L’heure de l’événement est requise.'
  if (!isNonEmptyString(body.location_name)) return 'Le lieu de l’événement est requis.'
  return validateTicketTypes(body.ticket_types, true)
}
