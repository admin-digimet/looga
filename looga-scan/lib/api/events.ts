import { supabase } from '@/lib/supabase/client'
import type { ScanEvent } from '@/types/scan'

export interface TicketForCache {
  ticketId: string
  qrValue: string
  attendeeName: string
  ticketType: string
  ticketNumber?: string
  status: 'valid' | 'used'
}

export const eventsApi = {
  getAll: async (): Promise<ScanEvent[]> => {
    if (__DEV__) console.log('[EVENTS] fetching assigned events...')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      if (__DEV__) console.log('[EVENTS] not authenticated:', authError?.message)
      throw new Error('Non authentifié')
    }

    // Récupérer le staff_account de cet utilisateur
    const { data: staff, error: staffError } = await supabase
      .from('staff_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (staffError || !staff) {
      if (__DEV__) console.log('[EVENTS] staff_accounts not found:', staffError?.message)
      throw new Error('Compte scanner introuvable')
    }

    if (__DEV__) console.log('[EVENTS] staff_id:', staff.id)

    // Récupérer les événements assignés à ce scanner
    const { data, error } = await supabase
      .from('event_staff_assignments')
      .select(`
        events (
          id,
          title,
          event_date,
          event_time,
          location_name,
          status,
          image_url
        )
      `)
      .eq('staff_id', staff.id)

    if (error) {
      if (__DEV__) console.log('[EVENTS] query error:', error.message)
      throw error
    }

    if (__DEV__) console.log('[EVENTS] assignments found:', data?.length ?? 0)

    const events: ScanEvent[] = (data ?? [])
      .map((a) => a.events as any)
      .filter(Boolean)
      .filter((e: any) => ['published', 'active'].includes(e.status))
      .map((e: any): ScanEvent => ({
        id: e.id,
        name: e.title,
        date: e.event_date,
        location: e.location_name ?? '',
        image: e.image_url ?? undefined,
        ticketsSold: 0,
        checkedIn: 0,
      }))

    return events
  },

  getTickets: async (eventId: string): Promise<TicketForCache[]> => {
    const { data, error } = await supabase
      .from('tickets')
      .select('id, qr_code, quantity, status, ticket_types(name), profiles:user_id(name)')
      .eq('event_id', eventId)
      .in('status', ['valid', 'used'])

    if (error) throw error

    return (data ?? []).map((t: any): TicketForCache => ({
      ticketId: t.id,
      qrValue: t.qr_code,
      attendeeName: t.profiles?.name ?? '',
      ticketType: t.ticket_types?.name ?? '',
      status: t.status === 'used' ? 'used' : 'valid',
    }))
  },
}
