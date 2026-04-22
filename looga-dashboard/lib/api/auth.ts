const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

function baseHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
  }
}

export interface ApiUser {
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  avatar_url: string | null
  push_token: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApiOrganizer {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  is_approved: boolean
  is_suspended: boolean
  created_at: string
}

export interface AuthResult {
  token: string
  refresh_token: string
  user: ApiUser
  organizer: ApiOrganizer | null
}

export interface RegisterOrganizerPayload {
  name: string
  email: string
  password: string
  phone?: string
  organization_name: string
  description?: string
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? 'Erreur de connexion'), { status: res.status })
  }
  return data as AuthResult
}

export async function apiRegisterOrganizer(payload: RegisterOrganizerPayload): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/register-organizer`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? "Erreur lors de l'inscription"), { status: res.status })
  }
  return data as AuthResult
}
