import * as React from 'react';
import Link from 'next/link';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BTN = {
  base: 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
  variant: {
    primary: 'bg-signal text-white hover:bg-signal-dark',
    secondary: 'bg-white text-ink border border-mist-deep hover:border-slate-light',
    ghost: 'text-ink hover:bg-mist',
    danger: 'bg-danger text-white hover:opacity-90',
  },
  size: { sm: 'h-9 px-3.5 text-[13px]', md: 'h-11 px-5 text-[15px]', lg: 'h-12 px-6 text-base' },
};

export function Button({ variant = 'primary', size = 'md', href, className = '', ...props }: ButtonProps) {
  const cls = `${BTN.base} ${BTN.variant[variant]} ${BTN.size[size]} ${className}`;
  if (href) return <Link href={href} className={cls}>{props.children}</Link>;
  return <button className={cls} {...props} />;
}

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function StatCard({ label, value, hint, tone = 'neutral' }: {
  label: string; value: React.ReactNode; hint?: string;
  tone?: 'neutral' | 'good' | 'warn' | 'accent' | 'bad';
}) {
  const accent = tone === 'good' || tone === 'accent' ? 'text-signal'
    : tone === 'warn' ? 'text-amber-dark'
    : tone === 'bad' ? 'text-danger' : 'text-ink';
  return (
    <div className="card p-4">
      <p className="text-[12px] font-semibold text-slate-light">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-extrabold ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-[12px] text-slate-light">{hint}</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  neutral: 'bg-mist text-slate',
  good: 'bg-signal-light text-signal-dark',
  warn: 'bg-amber-light text-amber-dark',
  bad: 'bg-danger-light text-danger',
  info: 'bg-ink/5 text-ink',
  // Aliases so callers can use either vocabulary.
  accent: 'bg-signal-light text-signal-dark',
  success: 'bg-signal-light text-signal-dark',
  danger: 'bg-danger-light text-danger',
};

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/** Maps every status enum in the system to a consistent colour. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, keyof typeof TONES> = {
    approved: 'good', verified: 'good', active: 'good', completed: 'good', issued: 'good',
    valid: 'good', paid: 'good', eligible: 'good',
    submitted: 'info', under_review: 'info', under_verification: 'info', in_progress: 'info',
    available: 'info', payment_submitted: 'info', draft: 'neutral', pending: 'neutral',
    locked: 'neutral', open: 'info', resolved: 'good', closed: 'neutral',
    revision_required: 'warn', correction_requested: 'warn', overdue: 'warn',
    rejected: 'bad', revoked: 'bad', terminated: 'bad', not_eligible: 'bad',
  };
  const label = status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  return <Badge tone={map[status] ?? 'neutral'}>{label}</Badge>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
          <span className="font-medium text-slate">{label}</span>
          <span className="font-semibold text-ink">{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-mist" role="progressbar"
           aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-signal transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="prose-narrow mt-1.5 text-[15px]">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({ tone = 'info', title, children }: {
  tone?: 'info' | 'good' | 'warn' | 'bad' | 'success' | 'danger';
  title?: string; children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-mist border-mist-deep text-slate',
    good: 'bg-signal-light border-signal/25 text-signal-dark',
    success: 'bg-signal-light border-signal/25 text-signal-dark',
    warn: 'bg-amber-light border-amber/30 text-amber-dark',
    bad: 'bg-danger-light border-danger/20 text-danger',
    danger: 'bg-danger-light border-danger/20 text-danger',
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 text-[14px] leading-relaxed ${styles}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children}
    </div>
  );
}

export function SectionHead({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-[13px] font-semibold text-signal">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
      {body && <p className="prose-narrow mt-3">{body}</p>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-mist-deep bg-mist/50">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-[12px] font-semibold text-slate-light">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-mist">{children}</tbody>
      </table>
    </div>
  );
}
