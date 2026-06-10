'use client'

import { useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Building2, Calendar, ChevronLeft, ChevronRight, FileText, Flag, LayoutDashboard, LogOut, MessageSquare, Shield, Users, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { href: '/users', label: 'Utilisateurs', icon: Users },
  { href: '/organizers', label: 'Organisateurs', icon: Building2 },
  { href: '/events', label: 'Événements', icon: Calendar },
  { href: '/reports', label: 'Signalements', icon: Flag },
  { href: '/support', label: 'Messages', icon: MessageSquare },
  { href: '/payouts', label: 'Payouts', icon: Wallet },
  { href: '/content', label: 'Contenu', icon: FileText },
  { href: '/team', label: 'Équipe', icon: Shield },
  { href: '/journal', label: 'Journal', icon: Activity },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }, [router])

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), [])

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 bg-base-200 border-r border-base-300
        transition-all duration-300 shrink-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-base-300 shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {collapsed ? (
          <span className="text-xl font-bold font-heading text-primary">L</span>
        ) : (
          <>
            <span className="text-xl font-bold font-heading text-primary">looga</span>
            <span className="badge badge-sm badge-secondary">admin</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/overview' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer : toggle + logout */}
      <div className="px-2 pb-4 flex flex-col gap-1 shrink-0 border-t border-base-300 pt-3">
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Déplier' : 'Réduire'}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/60 hover:bg-base-300 hover:text-base-content transition-colors w-full"
        >
          {collapsed
            ? <ChevronRight size={18} className="shrink-0" />
            : <><ChevronLeft size={18} className="shrink-0" /><span>Réduire</span></>
          }
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
