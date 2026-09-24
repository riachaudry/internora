import * as React from 'react';
import { LogoMark } from '@/components/Logo';
import { BRAND } from '@/lib/brand';

/** Shared A4 sheet used by the offer letter, certificate and LOR. */
export function DocumentSheet({
  docTitle, docId, issueDate, children, footerNote,
}: {
  docTitle: string; docId: string; issueDate: string;
  children: React.ReactNode; footerNote?: string;
}) {
  return (
    <article className="doc-sheet mx-auto w-full max-w-[820px] bg-white p-8 shadow-card sm:p-12"
             style={{ border: '1px solid #DDE5EF' }}>
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3">
          <LogoMark size={46} />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-[-.02em] text-ink">INTERNORA</p>
            <p className="text-[12px] font-medium text-slate-light">{BRAND.tagline}</p>
          </div>
        </div>
        <div className="text-right text-[12px] leading-relaxed">
          <p className="font-display text-[15px] font-bold text-ink">{docTitle}</p>
          <p className="mt-1 text-slate-light">ID</p>
          <p className="font-mono font-semibold text-ink">{docId}</p>
          <p className="mt-1.5 text-slate-light">Issued</p>
          <p className="font-semibold text-ink">{issueDate}</p>
        </div>
      </header>

      <div className="py-8">{children}</div>

      <footer className="border-t border-mist-deep pt-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="text-[13px] leading-relaxed">
            <p className="font-semibold text-ink">HR</p>
            <p className="text-slate">{BRAND.hr.name}</p>
            <p className="mt-2 font-semibold text-ink">WhatsApp</p>
            <p className="text-slate">{BRAND.hr.whatsapp}</p>
          </div>
          <div className="text-right">
            <div className="mb-1.5 flex h-14 w-52 items-end justify-center border-b border-ink">
              <span className="pb-1 font-display text-[19px] italic text-ink/75">{BRAND.hr.name}</span>
            </div>
            <p className="text-[12px] text-slate-light">Authorised signature · {BRAND.legalName}</p>
          </div>
        </div>
        <p className="mt-6 text-[11px] leading-relaxed text-slate-light">
          {footerNote ?? 'This document records participation in a project-based virtual internship program. Internora is an independent private program and is not affiliated with any government body or university.'}
        </p>
      </footer>
    </article>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-slate-light">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

export function PrintButton({ label = 'Download PDF' }: { label?: string }) {
  return (
    <form action="#" onSubmit={(e) => { e.preventDefault(); window.print(); }}>
      <button type="submit"
              className="no-print inline-flex h-11 items-center rounded-xl bg-signal px-5 text-[15px] font-semibold text-white hover:bg-signal-dark">
        {label}
      </button>
    </form>
  );
}
