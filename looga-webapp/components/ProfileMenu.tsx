'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Settings, Ticket, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export function ProfileMenu() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';
  const fullName = user?.name ?? 'Mon compte';
  const email = user?.email ?? '';

  const onConfirmLogout = () => {
    setConfirmOpen(false);
    setOpen(false);
    logoutMutation.mutate();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Ouvrir le menu de ${fullName}`}
          className={`w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all ring-offset-2 ring-offset-white hover:ring-4 hover:ring-orange/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange/40 ${
            open ? 'ring-4 ring-orange/30' : ''
          }`}
        >
          {initial}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 origin-top-right"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
              {email && <p className="text-xs text-ink-muted truncate mt-0.5">{email}</p>}
            </div>

            <MenuItem href="/tickets" icon={Ticket} onSelect={() => setOpen(false)}>
              Mes billets
            </MenuItem>
            <MenuItem href="/profile" icon={UserIcon} onSelect={() => setOpen(false)}>
              Mon profil
            </MenuItem>
            <MenuItem href="/parametres" icon={Settings} onSelect={() => setOpen(false)}>
              Paramètres
            </MenuItem>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>

      {confirmOpen && (
        <LogoutConfirmModal
          loading={logoutMutation.isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={onConfirmLogout}
        />
      )}
    </>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  children: React.ReactNode;
}

function MenuItem({ href, icon: Icon, onSelect, children }: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-cream-2 hover:text-ink transition-colors"
    >
      <Icon className="w-4 h-4 text-ink-muted" />
      {children}
    </Link>
  );
}

interface LogoutConfirmModalProps {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutConfirmModal({ loading, onCancel, onConfirm }: LogoutConfirmModalProps) {
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [loading, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 id="logout-modal-title" className="font-heading font-bold text-lg text-ink mb-1">
              Se déconnecter&nbsp;?
            </h3>
            <p className="text-sm text-ink-muted">
              Vous devrez vous reconnecter pour accéder à vos billets et favoris.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-cream-2 transition-colors disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? 'Déconnexion…' : 'Se déconnecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
