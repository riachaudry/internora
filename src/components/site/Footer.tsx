import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { BRAND, TRUST_STATEMENTS } from '@/lib/brand';

const COLUMNS = [
  { title: 'Program', links: [['Internships', '/internships'], ['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Performance rewards', '/rewards']] },
  { title: 'Verify', links: [['Verify a certificate', '/verify/certificate'], ['Verify an offer letter', '/verify/offer-letter'], ['FAQ', '/faq']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Sign in', '/login'], ['Apply now', '/register']] },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white/70">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo size={32} variant="light" showTagline />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed">{BRAND.description}</p>
          <div className="mt-5 text-[14px]">
            <p className="font-semibold text-white">HR: {BRAND.hr.name}</p>
            <a href={BRAND.hr.whatsappLink} className="mt-1 inline-block hover:text-white">
              WhatsApp: {BRAND.hr.whatsapp}
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-[13px] font-semibold text-white">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-[14px]">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap py-7 text-[13px] leading-relaxed">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {TRUST_STATEMENTS.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-5 text-white/45">
            © {new Date().getFullYear()} {BRAND.legalName}. Internora is an independent
            private training program. It is not affiliated with any government body or
            university, and it does not offer accredited qualifications or guaranteed employment.
          </p>
        </div>
      </div>
    </footer>
  );
}
