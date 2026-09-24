'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BRAND, formatPKR } from '@/lib/brand';
import { isoDate } from '@/lib/dates';
import { Card, Button, Alert } from '@/components/ui';
import { Uploader } from '@/components/portal/Uploader';
import { postJson } from '@/components/portal/form';

/** The amount is server-computed and shown read-only so it can't be mistyped. */
export function PaymentForm({ userId, applicationId, amount, duration }: {
  userId: string; applicationId: string; amount: number; duration: number;
}) {
  const router = useRouter();
  const [method, setMethod] = React.useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [txn, setTxn] = React.useState('');
  const [date, setDate] = React.useState(isoDate(new Date()));
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!screenshot) { setError('Upload your payment screenshot.'); return; }
    setBusy(true);
    try {
      await postJson('/api/payments', {
        application_id: applicationId, method, transaction_id: txn,
        payment_date: date, amount_pkr: amount, screenshot_url: screenshot,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the payment.');
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold">Record your payment</h2>
      <p className="mt-1 text-[14px] text-slate">
        Send exactly {formatPKR(amount)} to {BRAND.payment.accountName} · {BRAND.payment.number}, then fill this in.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <fieldset>
          <legend className="text-[13px] font-semibold text-ink">Payment method</legend>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {BRAND.payment.methods.map((m) => (
              <label key={m.id}
                     className={`cursor-pointer rounded-xl border px-4 py-3 text-[15px] font-semibold transition ${
                       method === m.id ? 'border-signal bg-signal-light/40 text-ink' : 'border-mist-deep text-slate'}`}>
                <input type="radio" name="method" checked={method === m.id}
                       onChange={() => setMethod(m.id as 'jazzcash' | 'easypaisa')} className="sr-only" />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-row">
            <span>Transaction ID</span>
            <input required value={txn} onChange={(e) => setTxn(e.target.value)}
                   placeholder="From your JazzCash / Easypaisa receipt" />
          </label>
          <label className="form-row">
            <span>Payment date</span>
            <input required type="date" value={date} max={isoDate(new Date())}
                   onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="form-row">
            <span>Amount (PKR)</span>
            <input value={amount} readOnly aria-describedby="amount-help" />
            <small id="amount-help" className="text-slate-light">
              Set automatically for your {duration}-week program.
            </small>
          </label>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Payment screenshot</p>
          <Uploader bucket="payment-proofs" userId={userId}
                    allowed={['jpg', 'jpeg', 'png', 'pdf']} maxBytes={5 * 1024 * 1024}
                    accept="image/png,image/jpeg,application/pdf"
                    onDone={(f) => setScreenshot(f?.url ?? null)} label="Upload screenshot" />
        </div>

        {error && <Alert tone="bad">{error}</Alert>}

        <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit for verification'}</Button>
        <p className="text-[12px] text-slate-light">
          Payments are verified manually by an admin. Nothing is activated automatically.
        </p>
      </form>
    </Card>
  );
}
