import { supabase } from '@/lib/supabase/client'
import type { Attendee, ScanRecord, ScanResult } from '@/types/scan'
import type { OfflineScanRecord } from '@/lib/offline/queue'

export const scanApi = {
  verify: async (qrCode: string, eventId: string, scannerName?: string): Promise<ScanResult> => {
    if (__DEV__) console.log('[SCAN] verify qr:', qrCode, 'event:', eventId)

    const { data: { user } } = await supabase.auth.getUser()
    if (__DEV__) console.log('[SCAN] auth user:', user?.id)

    // Trouver le billet par QR code + événement
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, status, ticket_number, ticket_types(name), profiles:user_id(name)')
      .eq('qr_code', qrCode)
      .eq('event_id', eventId)
      .single()

    if (ticketError || !ticket) {
      if (__DEV__) {
        console.log('[SCAN] ticket not found:', ticketError?.message, 'code:', ticketError?.code)
        // Debug: check if tickets exist for event at all (ignoring qr_code filter)
        const { data: debugTickets, error: debugErr } = await supabase
          .from('tickets')
          .select('id, qr_code, ticket_number, status')
          .eq('event_id', eventId)
          .limit(5)
        console.log('[SCAN] debug - tickets in event:', debugTickets?.length ?? 0, debugErr?.message)
        if (debugTickets && debugTickets.length > 0) {
          console.log('[SCAN] debug - sample qr_codes:', debugTickets.map(t => t.qr_code))
        }
      }

      // Insérer un scan invalide pour traçabilité
      const { error: insertErr } = await supabase.from('ticket_scans').insert({
        event_id: eventId,
        staff_id: user?.id,
        status: 'invalid',
        scanner_name: scannerName ?? 'Scanner',
        scanned_at: new Date().toISOString(),
      })
      if (__DEV__ && insertErr) console.log('[SCAN] insert scan error:', insertErr.message)
      return { status: 'invalid' }
    }

    const ticketData = ticket as any

    // Déjà utilisé
    if (ticketData.status === 'used') {
      const { data: firstScan } = await supabase
        .from('ticket_scans')
        .select('scanned_at, scanner_name')
        .eq('ticket_id', ticketData.id)
        .eq('status', 'valid')
        .order('scanned_at', { ascending: true })
        .limit(1)
        .single()

      const { error: insertUsedErr } = await supabase.from('ticket_scans').insert({
        event_id: eventId,
        ticket_id: ticketData.id,
        staff_id: user?.id,
        status: 'already_used',
        scanner_name: scannerName ?? 'Scanner',
        scanned_at: new Date().toISOString(),
      })
      if (__DEV__ && insertUsedErr) console.log('[SCAN] insert already_used error:', insertUsedErr.message)

      return {
        status: 'already_used',
        ticketId: ticketData.id,
        ticketNumber: ticketData.ticket_number,
        attendeeName: ticketData.profiles?.name,
        ticketType: ticketData.ticket_types?.name,
        firstScanAt: firstScan?.scanned_at,
        firstScannerName: firstScan?.scanner_name,
      }
    }

    // Valide → marquer comme utilisé + insérer scan
    await supabase
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticketData.id)

    const { error: insertValidErr } = await supabase.from('ticket_scans').insert({
      event_id: eventId,
      ticket_id: ticketData.id,
      staff_id: user?.id,
      status: 'valid',
      scanner_name: scannerName ?? 'Scanner',
      scanned_at: new Date().toISOString(),
    })
    if (__DEV__ && insertValidErr) console.log('[SCAN] insert valid scan error:', insertValidErr.message)

    return {
      status: 'valid',
      ticketId: ticketData.id,
      ticketNumber: ticketData.ticket_number,
      attendeeName: ticketData.profiles?.name,
      ticketType: ticketData.ticket_types?.name,
    }
  },

  verifyById: async (ticketId: string, eventId: string): Promise<ScanResult> => {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('qr_code')
      .eq('id', ticketId)
      .single()

    if (!ticket) return { status: 'invalid' }
    return scanApi.verify((ticket as any).qr_code, eventId)
  },

  getHistory: async (eventId: string): Promise<ScanRecord[]> => {
    const { data, error } = await supabase
      .from('ticket_scans')
      .select(`
        id, status, scanned_at,
        tickets ( id, ticket_number, ticket_types(name), profiles:user_id(name) )
      `)
      .eq('event_id', eventId)
      .order('scanned_at', { ascending: false })
      .limit(200)

    if (error) throw error

    return (data ?? []).map((raw: any): ScanRecord => ({
      id: raw.id,
      ticketId: raw.tickets?.id ?? '',
      attendeeName: raw.tickets?.profiles?.name ?? '',
      ticketType: raw.tickets?.ticket_types?.name ?? '',
      status: raw.status,
      scannedAt: raw.scanned_at,
    }))
  },

  getAttendees: async (eventId: string, search?: string): Promise<Attendee[]> => {
    let query = supabase
      .from('tickets')
      .select('id, ticket_number, status, ticket_types(name), profiles:user_id(id, name, email)')
      .eq('event_id', eventId)
      .in('status', ['valid', 'used'])

    if (search) {
      query = query.ilike('profiles.name', `%${search}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error

    return (data ?? []).map((raw: any): Attendee => ({
      id: raw.id,
      ticketId: raw.id,
      name: raw.profiles?.name ?? '',
      email: raw.profiles?.email ?? '',
      ticketType: raw.ticket_types?.name ?? '',
      status: raw.status === 'used' ? 'checked_in' : 'pending',
    }))
  },

  syncOffline: async (scans: OfflineScanRecord[]): Promise<void> => {
    if (!scans.length) return
    // Pour chaque scan offline, retrouver le ticket_id via qrValue
    const rows = await Promise.all(
      scans.map(async (s) => {
        const { data: ticket } = await supabase
          .from('tickets')
          .select('id')
          .eq('qr_code', s.qrValue)
          .eq('event_id', s.eventId)
          .single()
        return {
          event_id: s.eventId,
          ticket_id: (ticket as any)?.id ?? undefined,
          status: s.status,
          scanner_name: s.scannerName ?? 'Scanner',
          scanned_at: s.scannedAt,
        }
      })
    )
    const { error } = await supabase.from('ticket_scans').insert(rows)
    if (__DEV__ && error) console.log('[SYNC] error:', error.message)
  },
}
