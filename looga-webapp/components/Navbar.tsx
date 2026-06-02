'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ProfileMenu } from '@/components/ProfileMenu';

export function Navbar() {
  return (
    <Suspense fallback={<NavbarShell />}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarShell() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-3 px-4 md:px-8">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto h-12" />
    </header>
  );
}

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState('');

  // Resync l'input search depuis l'URL (utile quand on est sur /search)
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedSearch = search.trim();
    const trimmedCity = city.trim();
    if (trimmedSearch) params.set('q', trimmedSearch);
    if (trimmedCity) params.set('cities', trimmedCity);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-3 px-4 md:px-8">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center flex-1 gap-6">
          <Link href="/" className="text-orange font-bold text-2xl tracking-tighter font-heading">
            looga
          </Link>

          <form
            onSubmit={handleSubmit}
            className="hidden lg:flex items-center flex-1 max-w-2xl bg-gray-50 border border-gray-300 rounded-full h-12 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center flex-1 pl-4 h-full border-r border-gray-300">
              <Search className="text-gray-400 w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Rechercher des événements"
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center flex-1 px-4 h-full">
              <MapPin className="text-gray-400 w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Ville (Abidjan, Bouaké, Yamoussoukro…)"
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-gray-700"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button
              type="submit"
              aria-label="Rechercher"
              className="bg-orange text-white rounded-full p-2.5 mx-1 hover:opacity-90 transition-opacity"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700 ml-6">
          <Link href="/" className="hover:text-orange">Trouver des événements</Link>
          <Link href="/organisateur" className="hover:text-orange">Créer un événement</Link>
        </nav>

        <div className="flex items-center gap-4 ml-6">
          {isLoading ? (
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-gray-700 hover:text-orange hidden sm:block"
            >
              Se connecter
            </Link>
          )}
          <button className="md:hidden text-gray-700" aria-label="Rechercher">
            <Search className="w-6 h-6" />
          </button>
          {!isAuthenticated && (
            <Link href="/auth/login" className="md:hidden text-gray-700" aria-label="Compte">
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
