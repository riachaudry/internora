'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string; badge?: number };

export function SidebarNav({ nav, onNavigate }: {
  nav: { group: string; items: NavItem[] }[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {nav.map((section) => (
        <div key={section.group}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-light">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href
                || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                      active ? 'bg-ink text-white' : 'text-slate hover:bg-mist hover:text-ink'
                    }`}
                  >
                    <span>{item.label}</span>
                    {!!item.badge && (
                      <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-signal-light text-signal-dark'
                      }`}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
