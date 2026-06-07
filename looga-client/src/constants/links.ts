// URL du site web Looga — utilisée par les WebView du Profile pour les
// pages légales et d'information (cgu, confidentialité, aide, à propos…).
// Le contenu est servi par looga-webapp déployé sur Vercel.
export const LOOGA_WEBSITE_URL = 'https://looga-ci.com';

export const LEGAL_LINKS = {
  aide:            `${LOOGA_WEBSITE_URL}/aide`,
  cgu:             `${LOOGA_WEBSITE_URL}/cgu`,
  confidentialite: `${LOOGA_WEBSITE_URL}/confidentialite`,
  securite:        `${LOOGA_WEBSITE_URL}/securite`,
  communaute:      `${LOOGA_WEBSITE_URL}/communaute`,
  aPropos:         `${LOOGA_WEBSITE_URL}/a-propos`,
} as const;
