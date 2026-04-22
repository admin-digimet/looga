import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// GET /api/team/[id] — profil + stats agrégées du scanner
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: staff, error: staffError } = await supabase
    .from('staff_accounts')
    .select('id, name, is_active, created_at, profiles(name)')
    .eq('id', id)
    .single()

  if (staffError || !staff) return NextResponse.json({ error: 'Scanner introuvable' }, { status: 404 })

  // Stats scans
  const { data: scans } = await supabase
    .from('ticket_scans')
    .select('status, scanned_at')
    .eq('staff_id', id)
    .order('scanned_at', { ascending: false })

  const totalScans = scans?.length ?? 0
  const validScans = scans?.filter((s) => s.status === 'valid').length ?? 0
  const alreadyUsed = scans?.filter((s) => s.status === 'already_used').length ?? 0
  const invalidScans = scans?.filter((s) => s.status === 'invalid').length ?? 0
  const lastScanAt = scans?.[0]?.scanned_at ?? null

  // Événements assignés
  const { data: assignments } = await supabase
    .from('event_staff_assignments')
    .select('event_id, assigned_at, events(id, title, event_date, status)')
    .eq('staff_id', id)
    .order('assigned_at', { ascending: false })

  return NextResponse.json({
    id: staff.id,
    name: staff.name,
    is_active: staff.is_active,
    created_at: staff.created_at,
    total_scans: totalScans,
    valid_scans: validScans,
    already_used: alreadyUsed,
    invalid_scans: invalidScans,
    events_assigned: assignments?.length ?? 0,
    last_scan_at: lastScanAt,
    assignments: assignments ?? [],
  })
}

// PATCH /api/team/[id] — activer/désactiver un scanner
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { is_active } = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('staff_accounts')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
