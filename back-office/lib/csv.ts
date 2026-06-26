/**
 * Génération de CSV compatible Excel (FR) — utilisé par les exports du back-office.
 * - Séparateur `;` (Excel français découpe les colonnes sur `;`)
 * - BOM UTF-8 au téléchargement → les accents s'affichent correctement dans Excel
 * - Échappement RFC 4180 + neutralisation des formules (anti CSV injection)
 */

export interface CsvColumn<T> {
  /** Clé directe de l'objet (utilisée si `value` n'est pas fourni). */
  key?: string
  /** En-tête de colonne affiché dans le fichier. */
  header: string
  /** Extracteur custom (formatage date, booléens, champs imbriqués…). */
  value?: (row: T) => string | number | boolean | null | undefined
}

const SEP = ';'

function escapeCell(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  let s = typeof raw === 'boolean' ? (raw ? 'Oui' : 'Non') : String(raw)

  // Anti CSV injection : un champ commençant par = + - @ pourrait être
  // interprété comme une formule par Excel → on le préfixe d'une apostrophe.
  if (/^[=+\-@]/.test(s)) s = `'${s}`

  // Échappement RFC 4180 : guillemets, séparateur, retours ligne.
  if (s.includes('"') || s.includes(SEP) || s.includes('\n') || s.includes('\r')) {
    s = `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCSV<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(SEP)
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCell(c.value ? c.value(row) : (row as Record<string, unknown>)[c.key ?? '']))
      .join(SEP),
  )
  return [header, ...lines].join('\r\n')
}

/** Format date FR lisible (ex. « 25/06/2026 14:32 ») — null-safe. */
export function csvDate(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Déclenche le téléchargement d'un fichier CSV côté navigateur. */
export function downloadCSV(filename: string, csv: string): void {
  const BOM = '﻿'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Suffixe de date pour les noms de fichier (ex. « 2026-06-25 »). */
export function fileDateSuffix(): string {
  return new Date().toISOString().slice(0, 10)
}
