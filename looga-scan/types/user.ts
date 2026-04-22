export interface ScanUser {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'organizer' | 'admin';
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: ScanUser;
}
