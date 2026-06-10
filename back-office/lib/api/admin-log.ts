import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminTargetType = 'event' | 'organizer' | 'user' | 'payout' | 'team_member'

export async function logAdminAction(
  admin: SupabaseClient,
  actorId: string,
  action: string,
  targetType: AdminTargetType,
  targetId: string,
  note?: string,
): Promise<void> {
  // Table admin_actions (legacy)
  const { error } = await admin.from('admin_actions').insert({
    admin_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    note: note ?? null,
  })
  if (error) console.error('[admin_actions] insert failed:', error.message)

  // Journal global
  await admin.from('journal').insert({
    actor_type: 'admin',
    actor_id: actorId,
    action: `admin.${action}`,
    target_type: targetType,
    target_id: targetId,
    target_label: note ?? null,
    status: 'success',
    metadata: note ? { note } : {},
  }).then(({ error: jErr }) => {
    if (jErr) console.error('[journal] insert failed:', jErr.message)
  })
}
