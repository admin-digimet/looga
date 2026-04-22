export const Colors = {
  // Primaires
  orange: '#FF5C1A',
  orangeSoft: '#FF7A40',
  violet: '#6B3FA0',
  violetLight: '#9B6DD4',
  violetDeep: '#4A2878',

  // Fonds — thème clair crème
  bg: '#EDEAE4',
  surface: '#FFFFFF',
  surface2: '#F0EDE8',
  card: '#FFFFFF',

  // Texte
  text: '#1A1A1A',
  textMuted: '#6E6B66',

  // Statuts
  success: '#00C864',
  warning: '#FFB800',
  error: '#FF3B3B',

  // Border
  border: 'rgba(0,0,0,0.08)',

  // Auth / formulaires
  authBg: '#EDEAE4',
  authText: '#1A1A1A',
  authMuted: '#6E6B66',
  authSurface: '#FFFFFF',
  authBorder: '#C8C4BC',
  authBtn: '#3D3B38',
  authBtnText: '#FFFFFF',
} as const;

export const Gradient = {
  primary: ['#FF5C1A', '#6B3FA0'] as const,
  orange: ['#FF5C1A', '#FF8C5A'] as const,
  violet: ['#6B3FA0', '#9B6DD4'] as const,
};
