import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Vérifie qu'un événement appartient bien à l'organisateur du user connecté.
 *
 * À utiliser AVANT toute mutation service_role sur un event (PATCH/DELETE),
 * sinon n'importe quel organisateur peut modifier/supprimer l'event d'un
 * autre en passant son id (IDOR). Lit via le client admin (service_role)
 * pour ne pas dépendre de la RLS.
 */
export async function userOwnsEvent(
  admin: SupabaseClient,
  userId: string,
  eventId: string,
): Promise<boolean> {
  const { data: organizer } = await admin
    .from('organizers')
    .select('id')
    .eq('user_id', userId)
    .single()
  if (!organizer) return false

  const { data: event } = await admin
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .single()
  if (!event) return false

  return event.organizer_id === organizer.id
}
