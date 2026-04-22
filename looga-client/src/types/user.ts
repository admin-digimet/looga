export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url: string | null;
  role: string;
  push_token: string | null;
  is_active: boolean;
  createdAt: string;
  updated_at: string;
}

export interface Organizer {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_approved: boolean;
  is_suspended: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
  organizer: Organizer | null;
}
