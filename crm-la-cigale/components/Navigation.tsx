/**
 * Composant Navigation
 * Barre de navigation avec liens vers les différentes vues
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListBulletIcon, Squares2X2Icon, CalendarIcon } from '@heroicons/react/24/outline';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/liste', label: 'Liste', icon: ListBulletIcon },
    { href: '/kanban', label: 'Kanban', icon: Squares2X2Icon },
    { href: '/planning', label: 'Planning', icon: CalendarIcon },
  ];

  return (
    <nav className="bg-white border-b border-slate-200/50 shadow-md backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Titre */}
          <div className="flex-shrink-0">
            <Link href="/liste" className="text-2xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 bg-clip-text text-transparent hover:from-indigo-800 hover:via-indigo-700 hover:to-indigo-800 transition-all duration-300">
              La Cigale
            </Link>
          </div>

          {/* Navigation principale */}
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 scale-105'
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-indigo-50 hover:text-slate-900 hover:scale-105 hover:shadow-md'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-20 rounded-xl blur"></div>
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

