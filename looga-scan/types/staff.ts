export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'staff';
  organisateurId: string;
  organisateurName: string;
}

export interface StaffAuthResponse {
  token: string;
  staff: Staff;
  organisateur: {
    id: string;
    name: string;
  };
}
