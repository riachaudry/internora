import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { SidebarNav, type NavItem } from './SidebarNav';
import { PortalHeader } from './PortalHeader';
import type { SessionProfile } from '@/lib/auth';

/**
 * Shared chrome for both portals. The sidebar is a plain <nav> that collapses
 * into a details/summary drawer on small screens, so it works without JS.
 */
export function PortalShell({
  profile, nav, unread, base, children,
}: {
  profile: SessionProfile;
  nav: { group: string; items: NavItem[] }[];
  unread: number;
  base: '/dashboard' | '/admin';
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mist/60">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-mist-deep bg-white lg:flex">
          <div className="flex h-16 items-center border-b border-mist-deep px-5">
            <Link href={base}><Logo size={30} /></Link>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav nav={nav} />
          </div>
          <div className="border-t border-mist-deep p-4 text-[11px] leading-relaxed text-slate-light">
            Internora · Project-based virtual internships. Independent private program.
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <PortalHeader profile={profile} unread={unread} base={base} nav={nav} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
