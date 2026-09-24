'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { SidebarNav, type NavItem } from './SidebarNav';
import { Avatar } from './Avatar';
import { createClient } from '@/lib/supabase/client';
import type { SessionProfile } from '@/lib/auth';

export function PortalHeader({ profile, unread, base, nav }: {
  profile: SessionProfile; unread: number;
  base: '/dashboard' | '/admin';
  nav: { group: string; items: NavItem[] }[];
}) {
  const router = useRouter();
  const [drawer, setDrawer] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [q, setQ] = React.useState('');

  async function signOut() {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const searchTarget = base === '/admin' ? '/admin/students' : '/dashboard/tasks';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-mist-deep bg-white/95 px-4 backdrop--blur sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-mist-deep text-ink lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <Link href={base} className="lg:hidden"><Logo size={26} /></Link>

        <form
          className="ml-auto hidden min-w-0 flex-1 max-w-sm sm:block lg:ml-0"
          onSubmit={(e) => { e.preventDefault(); router.push(`${searchTarget}?q=${encodeURIComponent(q)}`); }}
        >
          <label className="sr-only" htmlFor="portal-search">Search</label>
          <input
            id="portal-search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={base === '/admin' ? 'Search students…' : 'Search your tasks…'}
            className="h-10 w-full rounded-xl border border-mist-deep bg-mist/50 px-3.5 text-[14px] outline-none focus:border-signal focus:bg-white"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-4">
          <Link
            href={`${base}/notifications`}
            className="relative grid h-10 w-10 place-items-center rounded-lg text-slate hover:bg-mist hover:text-ink"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          >
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2-1 4.4-1.6 5-.4.4-.1 1.1.5 1.1h11.2c.6 0 .9-.7.5-1.1-.6-.6-1.6-1.8-1.6-5A4.5 4.5 0 0 0 10 2.5ZM8.2 15.8a1.9 1.9 0 0 0 3.6 0"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              type="button" onClick={() => setMenu((v) => !v)}
              aria-expanded={menu} aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 hover:bg-mist"
            >
              <Avatar url={profile.avatar_url} name={profile.full_name} size={32} />
              <span className="hidden max-w-[140px] truncate text-[14px] font-semibold text-ink sm:block">
                {profile.full_name}
              </span>
            </button>
            {menu && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close menu"
                        onClick={() => setMenu(false)} />
                <div role="menu"
                     className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-mist-deep bg-white shadow-card">
                  <div className="border-b border-mist px-4 py-3">
                    <p className="truncate text-[14px] font-semibold text-ink">{profile.full_name}</p>
                    <p className="truncate text-[12px] text-slate-light">{profile.email}</p>
                    {profile.student_id && (
                      <p className="mt-1 font-mono text-[11px] text-slate-light">{profile.student_id}</p>
                    )}
                  </div>
                  <Link href={base === '/admin' ? '/admin/profile' : '/dashboard/profile'}
                        className="block px-4 py-2.5 text-[14px] text-slate hover:bg-mist" role="menuitem"
                        onClick={() => setMenu(false)}>
                    {base === '/admin' ? 'Admin profile' : 'My profile'}
                  </Link>
                  <Link href={`${base}/settings`} className="block px-4 py-2.5 text-[14px] text-slate hover:bg-mist"
                        role="menuitem" onClick={() => setMenu(false)}>
                    Settings
                  </Link>
                  <button type="button" onClick={signOut} role="menuitem"
                          className="block w-full px-4 py-2.5 text-left text-[14px] font-medium text-danger hover:bg-danger-light">
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)}
                  className="absolute inset-0 bg-ink/40" />
          <div className="absolute left-0 top-0 flex h-full w-[276px] flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-mist-deep px-4">
              <Logo size={28} />
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close"
                      className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mist">
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNav nav={nav} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
