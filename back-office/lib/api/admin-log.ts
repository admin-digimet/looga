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
  const { error } = await admin.from('admin_actions').insert({
    admin_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    note: note ?? null,
  })
  if (error) {
    console.error('[admin_actions] insert failed:', error.message)
  }
}
