import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { admin } = await requireAdmin()
    const { key } = await ctx.params

    const { data, error } = await admin
      .from('page_contents')
      .select('*')
      .eq('key', key)
      .maybeSingle()
    if (error) throw error

    return NextResponse.json(data ?? null)
  } catch (err) {
    return handleAdminError(err)
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { key } = await ctx.params
    const body = await req.json()

    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new AdminAuthError(400, 'Titre requis')
    }
    const sections = Array.isArray(body.sections) ? body.sections : []
    for (const s of sections) {
      if (typeof s?.heading !== 'string' || typeof s?.body !== 'string') {
        throw new AdminAuthError(400, 'Chaque section doit avoir un heading et un body texte')
      }
    }

    const { error } = await admin
      .from('page_contents')
      .upsert({
        key,
        title: body.title,
        intro: body.intro ?? null,
        sections,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
    if (error) throw error

    await logAdminAction(admin, userId, 'update_page_content', 'event', key, body.title)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
