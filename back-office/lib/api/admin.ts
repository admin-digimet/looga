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

export async function toggleOrganizerApproval(
  organizerId: string,
  approve: boolean,
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/organizers/${organizerId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approve }),
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

// ─── Signalements ────────────────────────────────────────────────────────────

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ReportTargetType = 'event' | 'user' | 'organizer'

export interface AdminReport {
  id: string
  reporter_id: string
  reporter_name: string | null
  target_type: ReportTargetType
  target_id: string
  target_label: string | null
  reason: string
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export async function getAdminReports(params: { status?: string; target_type?: ReportTargetType } = {}): Promise<AdminReport[]> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.target_type) qs.set('target_type', params.target_type)
  return jsonOrThrow(await fetch(`/api/admin/reports?${qs.toString()}`, { cache: 'no-store' }))
}

export async function updateReport(id: string, status: ReportStatus): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }))
}

// ─── Messages de support ─────────────────────────────────────────────────────

export type SupportStatus = 'pending' | 'responded' | 'closed'

export interface SupportMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  user_id: string | null
  status: SupportStatus
  admin_note: string | null
  responded_by: string | null
  responded_at: string | null
  created_at: string
}

export async function getAdminSupport(params: { status?: string; search?: string } = {}): Promise<SupportMessage[]> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.search) qs.set('search', params.search)
  return jsonOrThrow(await fetch(`/api/admin/support?${qs.toString()}`, { cache: 'no-store' }))
}

export async function updateSupportMessage(
  id: string,
  patch: { status: SupportStatus; admin_note?: string },
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/support/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }))
}

// ─── Contenu pages statiques ─────────────────────────────────────────────────

export interface PageSection {
  heading: string
  body: string
}

export interface PageContentListItem {
  key: string
  label: string
  title: string | null
  updated_at: string | null
  configured: boolean
}

export interface PageContent {
  key: string
  title: string
  intro: string | null
  sections: PageSection[]
  updated_at: string
  updated_by: string | null
}

export async function getAdminContent(): Promise<PageContentListItem[]> {
  return jsonOrThrow(await fetch('/api/admin/content', { cache: 'no-store' }))
}

export async function getAdminContentByKey(key: string): Promise<PageContent | null> {
  return jsonOrThrow(await fetch(`/api/admin/content/${key}`, { cache: 'no-store' }))
}

export async function updateAdminContent(
  key: string,
  payload: { title: string; intro: string | null; sections: PageSection[] },
): Promise<void> {
  await jsonOrThrow(await fetch(`/api/admin/content/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string
  created_at: string
  actor_type: 'user' | 'organizer' | 'admin' | 'system'
  /** Rôle actuel de l'acteur résolu via profiles.role (plus fiable que actor_type figé) */
  actor_role: 'user' | 'organizer' | 'staff' | 'admin' | 'super_admin' | null
  actor_id: string | null
  actor_name: string | null
  actor_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  target_label: string | null
  status: 'success' | 'failure' | 'warning'
  metadata: Record<string, unknown>
  ip_address: string | null
}

export interface JournalParams {
  page?: number
  search?: string
  actor_type?: string
  status?: string
  period?: string
}

export async function getAdminJournal(
  params: JournalParams = {},
): Promise<{ data: JournalEntry[]; total: number }> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.search) qs.set('search', params.search)
  if (params.actor_type) qs.set('actor_type', params.actor_type)
  if (params.status) qs.set('status', params.status)
  if (params.period) qs.set('period', params.period)
  return jsonOrThrow(await fetch(`/api/admin/journal?${qs.toString()}`, { cache: 'no-store' }))
}
