import * as React from 'react';

/**
 * Internora mark: an "IN" monogram where the I is the tallest bar of a rising
 * step sequence — the growth idea sits inside the letterform rather than being
 * bolted on as an arrow. Drawn as vectors so it stays crisp on a certificate.
 */
export function LogoMark({ size = 36, variant = 'color' }: { size?: number; variant?: 'color' | 'light' | 'dark' }) {
  const badge = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#101C33' : '#101C33';
  const bars = variant === 'light' ? '#101C33' : '#FFFFFF';
  const accent = variant === 'light' ? '#1F6F5C' : '#38B48E';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="Internora">
      <rect width="48" height="48" rx="13" fill={badge} />
      {/* rising steps: the tall bar reads as the I */}
      <rect x="11" y="27" width="5" height="10" rx="2.5" fill={bars} opacity=".55" />
      <rect x="19.5" y="21" width="5" height="16" rx="2.5" fill={bars} opacity=".8" />
      <rect x="28" y="11" width="5" height="26" rx="2.5" fill={accent} />
      {/* the N diagonal, tying the steps together */}
      <path d="M13.5 24.5 L30.5 13.5" stroke={accent} strokeWidth="2.6" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

export function Logo({
  size = 36, variant = 'color', showTagline = false, className = '',
}: { size?: number; variant?: 'color' | 'light' | 'dark'; showTagline?: boolean; className?: string }) {
  const text = variant === 'light' ? 'text-white' : 'text-ink';
  const sub = variant === 'light' ? 'text-white/55' : 'text-slate-light';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} variant={variant} />
      <span className="leading-none">
        <span className={`block font-display font-extrabold tracking-[-.02em] ${text}`}
              style={{ fontSize: size * 0.58 }}>
          Internora
        </span>
        {showTagline && (
          <span className={`block mt-1 text-[11px] font-medium ${sub}`}>Virtual Internships. Real Experience.</span>
        )}
      </span>
    </span>
  );
}
