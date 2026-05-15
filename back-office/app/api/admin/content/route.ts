import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

// Liste des pages connues (config en dur — synchro avec les pages du webapp)
const KNOWN_KEYS = [
  { key: 'a-propos', label: 'À propos' },
  { key: 'carrieres', label: 'Carrières' },
  { key: 'securite', label: 'Sécurité' },
  { key: 'communaute', label: 'Règles de la communauté' },
  { key: 'aide', label: 'Centre d\'aide (FAQ)' },
  { key: 'cgu', label: 'Conditions générales' },
  { key: 'confidentialite', label: 'Politique de confidentialité' },
]

export async function GET() {
  try {
    const { admin } = await requireAdmin()
    const { data, error } = await admin
      .from('page_contents')
      .select('key, title, updated_at, updated_by')
    if (error) throw error

    const byKey = new Map((data ?? []).map((row) => [row.key as string, row]))
    const result = KNOWN_KEYS.map(({ key, label }) => {
      const row = byKey.get(key)
      return {
        key,
        label,
        title: row?.title ?? null,
        updated_at: row?.updated_at ?? null,
        configured: !!row,
      }
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleAdminError(err)
  }
}
