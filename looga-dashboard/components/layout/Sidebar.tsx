'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    href: '/',
    label: 'Vue d\'ensemble',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'Événements',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Mon équipe',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={`
        h-full bg-base-200 border-r border-base-300 flex flex-col flex-shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`border-b border-base-300 flex items-center ${collapsed ? 'p-4 justify-center' : 'p-6'}`}>
        {collapsed ? (
          <Link href="/" title="looga">
            <span className="text-2xl font-heading font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              L
            </span>
          </Link>
        ) : (
          <Link href="/">
            <span className="text-3xl font-heading font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              looga
            </span>
            <p className="text-xs text-base-content/50 mt-0.5">Espace organisateur</p>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all
                ${collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
                ${isActive
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                }
              `}
            >
              {item.icon}
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Toggle button — ancré en bas, au-dessus de la déconnexion */}
      <div className={`px-2 pb-1 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Agrandir la navigation' : 'Réduire la navigation'}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/40 hover:bg-base-300 hover:text-base-content transition-all"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>
      </div>

      {/* Déconnexion */}
      <div className="p-2 border-t border-base-300">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Déconnexion' : undefined}
          className={`flex items-center gap-3 rounded-xl text-sm font-medium text-base-content/60 hover:bg-base-300 hover:text-error w-full transition-all
            ${collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
