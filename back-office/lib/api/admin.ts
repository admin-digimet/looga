/**
 * Admin API client — appelle les API routes Next.js dans /api/admin/*
 * Le code serveur de chaque route utilise createAdminClient() (service_role).
 * Voir back-office/API.md pour les contrats détaillés.
 */

import type { AdminEventListItem, Organizer, Profile } from '@/types'
import type { AdminStatsResponse } from '@/app/api/admin/stats/route'

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw Object.assign(new Error(data.error ?? 'Erreur API'), { status: res.status })
  }
  return res.json() as Promise<T>
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return jsonOrThrow(await fetch('/api/admin/stats', { cache: 'no-store' }))
}

// ─── Utilisateurs ────────────────────────────────────────────────────────────

export interface AdminUsersParams {
  role?: string
  search?: string
  page?: number
}

export async function getAdminUsers(params: AdminUsersParams = {}): Promise<{ data: Profile[]; total: number }> {
  const qs = new URLSearchParams()
  if (params.role && params.role !== 'tous') qs.set('role', params.role)
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  return jsonOrThrow(await fetch(`/api/admin/users?${qs.toString()}`, { cache: 'no-store' }))
}

export async function updateAdminUser(
  id: string,
  patch: { is_active?: boolean; role?: string },
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }))
}

export async function deleteAdminUser(id: string): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }))
}

// ─── Événements ──────────────────────────────────────────────────────────────

export interface AdminEventsParams {
  status?: string
  search?: string
  page?: number
}

export async function getAdminEvents(params: AdminEventsParams = {}): Promise<{
  data: AdminEventListItem[]
  total: number
}> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  return jsonOrThrow(await fetch(`/api/admin/events?${qs.toString()}`, { cache: 'no-store' }))
}

export async function deleteAdminEvent(eventId: string): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' }))
}

export async function updateAdminEventStatus(
  eventId: string,
  status: 'cancelled' | 'published',
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/events/${eventId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }))
}

// ─── Organisateurs ───────────────────────────────────────────────────────────

export interface AdminOrganizersParams {
  status?: 'all' | 'active' | 'suspended'
  search?: string
}

export async function getAdminOrganizers(params: AdminOrganizersParams = {}): Promise<Organizer[]> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.search) qs.set('search', params.search)
  return jsonOrThrow(await fetch(`/api/admin/organizers?${qs.toString()}`, { cache: 'no-store' }))
}

export async function toggleOrganizerSuspension(
  organizerId: string,
  suspend: boolean,
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/organizers/${organizerId}/suspend`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suspend }),
  }))
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'
export type PayoutMethod = 'mtn_momo' | 'orange_money' | 'wave' | 'bank_transfer'

export interface PayoutRequest {
  id: string
  organizer_id: string
  organizer_name?: string
  amount: number
  method: PayoutMethod
  phone_number: string | null
  bank_details: Record<string, string> | null
  status: PayoutStatus
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  paid_at: string | null
  created_at: string
}

export async function getAdminPayouts(params: { status?: string; search?: string } = {}): Promise<PayoutRequest[]> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.search) qs.set('search', params.search)
  return jsonOrThrow(await fetch(`/api/admin/payouts?${qs.toString()}`, { cache: 'no-store' }))
}

export async function updatePayout(
  id: string,
  patch: { status: PayoutStatus; admin_note?: string },
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/payouts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }))
}

// ─── Équipe ──────────────────────────────────────────────────────────────────

export interface TeamMember extends Profile {
  email: string
  last_sign_in_at: string | null
}

export async function getAdminTeam(): Promise<TeamMember[]> {
  return jsonOrThrow(await fetch('/api/admin/team', { cache: 'no-store' }))
}

export async function inviteTeamMember(payload: {
  email: string
  name: string
  role: 'admin' | 'super_admin'
}): Promise<void> {
  await jsonOrThrow(await fetch('/api/admin/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }))
}

export async function updateTeamMember(
  id: string,
  patch: { is_active?: boolean; role?: 'admin' | 'super_admin' },
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/team/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }))
}

export async function deleteTeamMember(id: string): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/team/${id}`, { method: 'DELETE' }))
}
