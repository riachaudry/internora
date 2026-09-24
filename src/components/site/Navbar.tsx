'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';

const LINKS = [
  { href: '/internships', label: 'Internships' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/verify', label: 'Verify' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-mist-deep bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Internora home"><Logo size={32} /></Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
                  className="rounded-lg px-3 py-2 text-[14px] font-medium text-slate hover:bg-mist hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost" size="sm">Sign in</Button>
          <Button href="/register" size="sm">Apply now</Button>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-mist lg:hidden"
                aria-expanded={open} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-mist-deep bg-white lg:hidden">
          <nav className="wrap flex flex-col py-3" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate hover:bg-mist">
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 px-3 pb-2">
              <Button href="/login" variant="secondary" size="sm" className="flex-1">Sign in</Button>
              <Button href="/register" size="sm" className="flex-1">Apply now</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
