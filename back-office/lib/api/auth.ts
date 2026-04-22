const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface ApiUser {
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface AuthResult {
  token: string
  refresh_token: string
  user: ApiUser
  organizer: null
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? 'Erreur de connexion'), { status: res.status })
  }
  return data as AuthResult
}
