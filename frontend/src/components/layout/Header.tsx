'use client';

import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  const initials = (user?.displayName || user?.email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-cyan-100 bg-white/85 px-4 backdrop-blur-md lg:h-16 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-cyan-800 transition-colors hover:bg-cyan-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <ShieldCheck className="h-5 w-5 text-cyan-brand" aria-hidden="true" />
          <span className="text-base font-bold tracking-tight text-cyan-950">LM-Verify</span>
        </div>
        <p className="hidden text-sm text-slate-500 lg:block">
          Legal Metrology (Packaged Commodities) Rules, 2011
        </p>
      </div>

      <div className="flex items-center gap-3">
        {user?.jurisdiction && (
          <span className="chip hidden border-cyan-200 bg-cyan-50 text-cyan-800 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-bright" aria-hidden="true" />
            {user.jurisdiction}
          </span>
        )}
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-cyan-950">
              {user?.displayName || user?.email}
            </p>
            <p className="text-xs leading-tight text-slate-500">
              {user ? ROLE_LABELS[user.role] || user.role : ''}
            </p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-50 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-200">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
