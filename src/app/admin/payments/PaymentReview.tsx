'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { formatPKR } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { Card, Button, StatusBadge, Alert, Badge } from '@/components/ui';

export type PaymentRow = {
  id: string; method: string; transaction_id: string; amount_pkr: number;
  payment_date: string; screenshot_url: string; status: string;
  admin_note: string | null; created_at: string;
  expected_fee: number; student_name: string; student_code: string | null;
  field_name: string; duration: number;
};

export function PaymentReview({ payment }: { payment: PaymentRow }) {
  const router = useRouter();
  const [note, setNote] = React.useState('');
  const [startMode, setStartMode] = React.useState<'immediate' | 'scheduled'>('immediate');
  const [startDate, setStartDate] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const mismatch = payment.amount_pkr !== payment.expected_fee;
  const pending = ['submitted', 'under_verification'].includes(payment.status);

  async function act(action: 'verify' | 'reject' | 'request_correction' | 'refund') {
    if (action === 'verify' && mismatch &&
        !window.confirm('The paid amount does not match the expected fee. Verify anyway?')) return;
    setBusy(action); setError(null); setMessage(null);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action, note: note || undefined,
          ...(action === 'verify' ? { start_mode: startMode, start_date: startDate || undefined } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'The action failed.');
      setMessage(action === 'verify' ? 'Payment verified and the internship is now active.' : 'Payment updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The action failed.');
    } finally { setBusy(null); }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">{payment.student_name}</h2>
            <StatusBadge status={payment.status} />
            {mismatch && <Badge tone="danger">Amount mismatch</Badge>}
          </div>
          <p className="mt-1 font-mono text-[12px] text-slate-light">{payment.student_code ?? '—'}</p>
          <p className="mt-1.5 text-[13.5px] text-slate">
            {payment.field_name} · {payment.duration} weeks · expected {formatPKR(payment.expected_fee)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-ink">{formatPKR(payment.amount_pkr)}</p>
          <p className="text-[12.5px] text-slate-light">{payment.method} · {shortDate(payment.payment_date)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <a href={payment.screenshot_url} target="_blank" rel="noreferrer noopener"
           className="block overflow-hidden rounded-xl border border-mist-deep bg-mist/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={payment.screenshot_url} alt="Payment proof submitted by the student"
               className="h-[160px] w-full object-cover" />
          <span className="block px-3 py-2 text-[12.5px] font-semibold text-signal">Open full proof</span>
        </a>

        <div className="space-y-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Transaction ID</p>
            <p className="mt-1 font-mono text-[14px] font-semibold text-ink">{payment.transaction_id}</p>
          </div>

          {pending && (
            <>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor={`note-${payment.id}`}>
                  Note to the student (optional)
                </label>
                <textarea id={`note-${payment.id}`} rows={2} className="field" value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Explain what needs correcting, if anything." />
              </div>

              <fieldset className="rounded-xl border border-mist-deep p-3">
                <legend className="px-1 text-[12px] font-semibold uppercase tracking-wide text-slate-light">
                  Start date on verification
                </legend>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-[13.5px] text-slate">
                    <input type="radio" name={`start-${payment.id}`} checked={startMode === 'immediate'}
                           onChange={() => setStartMode('immediate')} /> Start today
                  </label>
                  <label className="flex items-center gap-2 text-[13.5px] text-slate">
                    <input type="radio" name={`start-${payment.id}`} checked={startMode === 'scheduled'}
                           onChange={() => setStartMode('scheduled')} /> Schedule
                  </label>
                  {startMode === 'scheduled' && (
                    <input type="date" className="field max-w-[180px]" value={startDate}
                           onChange={(e) => setStartDate(e.target.value)} aria-label="Scheduled start date" />
                  )}
                </div>
              </fieldset>
            </>
          )}

          {payment.admin_note && (
            <p className="rounded-xl bg-mist/60 p-3 text-[13.5px] text-slate">
              <span className="font-semibold">Last note:</span> {payment.admin_note}
            </p>
          )}
        </div>
      </div>

      {error && <div className="mt-4"><Alert tone="danger" title="Not completed">{error}</Alert></div>}
      {message && <div className="mt-4"><Alert tone="success" title="Done">{message}</Alert></div>}

      {pending && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => act('verify')} disabled={!!busy}>
            {busy === 'verify' ? 'Verifying…' : 'Verify and activate'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => act('request_correction')} disabled={!!busy}>
            Request correction
          </Button>
          <Button size="sm" variant="danger" onClick={() => act('reject')} disabled={!!busy}>
            Reject
          </Button>
        </div>
      )}

      {payment.status === 'verified' && (
        <div className="mt-4">
          <Button size="sm" variant="ghost" onClick={() => act('refund')} disabled={!!busy}>
            Mark as refunded
          </Button>
        </div>
      )}
    </Card>
  );
}
