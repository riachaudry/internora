import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { BRAND, TRUST_STATEMENTS } from '@/lib/brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,44%)]">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Link href="/"><Logo size={34} variant="light" /></Link>
        <div>
          <h2 className="max-w-[18ch] font-display text-4xl font-extrabold leading-tight">
            Virtual Internships. Real Experience.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-white/70">
            Structured weekly roadmaps, reviewed submissions, a final project, and a certificate
            anyone can verify.
          </p>
        </div>
        <ul className="space-y-1.5 text-[13px] text-white/50">
          {TRUST_STATEMENTS.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </aside>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-block lg:hidden"><Logo size={30} /></Link>
          {children}
          <p className="mt-10 text-[12px] leading-relaxed text-slate-light">
            Need help? HR {BRAND.hr.name} · WhatsApp {BRAND.hr.whatsapp}
          </p>
        </div>
      </main>
    </div>
  );
}
