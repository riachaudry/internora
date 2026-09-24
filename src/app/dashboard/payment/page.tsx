import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { BRAND, formatPKR } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { Card, SectionHead, Alert, Button, StatusBadge, EmptyState } from '@/components/ui';
import { PaymentForm } from './PaymentForm';

export const dynamic = 'force-dynamic';

export default async function PaymentPage() {
  const profile = await requireStudent();
  const { application, payment } = await loadStudentState(profile.id);

  if (!application) {
    return (
      <EmptyState title="No application to pay for"
                  body="Choose an internship field and duration first — the correct fee is then set automatically."
                  action={<Button href="/dashboard/apply">Apply now</Button>} />
    );
  }

  const field = (application.internship_fields as any)?.name ?? 'Internship';
  const closed = payment && ['verified'].includes(payment.status);
  const pending = payment && ['submitted', 'under_verification'].includes(payment.status);

  return (
    <div className="space-y-6">
      <SectionHead
        eyebrow="Step 2 of 2"
        title="Submit your internship fee"
        body="Send the exact internship fee through JazzCash or Easypaisa to the account shown below, then record your transaction here."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {closed && (
            <Alert tone="good" title="Payment verified">
              Your internship is active. Head to your{' '}
              <Link href="/dashboard/roadmap" className="font-semibold underline">weekly roadmap</Link>.
            </Alert>
          )}
          {pending && (
            <Alert tone="info" title="Under verification">
              Submitted {payment && shortDate(payment.created_at)}. Payments are verified by hand — never automatically.
              You&rsquo;ll get a notification as soon as it clears.
            </Alert>
          )}
          {payment && ['rejected', 'correction_requested'].includes(payment.status) && (
            <Alert tone="bad" title={payment.status === 'rejected' ? 'Payment rejected' : 'Correction requested'}>
              {payment.admin_note ?? 'Check your transaction details and submit again.'}
            </Alert>
          )}

          {!closed && !pending && (
            <PaymentForm
              userId={profile.id}
              applicationId={application.id}
              amount={application.fee_pkr}
              duration={application.duration}
            />
          )}

          {payment && (
            <Card className="p-5">
              <h2 className="font-display text-lg font-bold">Your submission</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px] sm:grid-cols-3">
                <Item label="Status" value={<StatusBadge status={payment.status} />} />
                <Item label="Method" value={payment.method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} />
                <Item label="Amount" value={formatPKR(payment.amount_pkr)} />
                <Item label="Transaction ID" value={<span className="font-mono">{payment.transaction_id}</span>} />
                <Item label="Payment date" value={shortDate(payment.payment_date)} />
                <Item label="Verified" value={payment.verified_at ? shortDate(payment.verified_at) : '—'} />
              </dl>
              {payment.screenshot_url && (
                <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer"
                   className="mt-4 inline-block text-[14px] font-semibold text-signal underline">
                  View the screenshot you uploaded
                </a>
              )}
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Pay to</h2>
            <p className="mt-1 text-[13px] text-slate-light">JazzCash / Easypaisa</p>
            <dl className="mt-4 space-y-3 text-[14px]">
              <div><dt className="text-[12px] font-semibold text-slate-light">Account Name</dt>
                <dd className="font-semibold text-ink">{BRAND.payment.accountName}</dd></div>
              <div><dt className="text-[12px] font-semibold text-slate-light">Number</dt>
                <dd className="font-mono text-lg font-bold text-ink">{BRAND.payment.number}</dd></div>
              <div className="border-t border-mist pt-3">
                <dt className="text-[12px] font-semibold text-slate-light">Amount to send</dt>
                <dd className="font-display text-2xl font-extrabold text-signal">{formatPKR(application.fee_pkr)}</dd>
                <p className="mt-1 text-[12px] text-slate-light">{field} · {application.duration} weeks</p>
              </div>
            </dl>
            <div className="mt-5 border-t border-mist pt-4 text-[13px]">
              <p className="font-semibold text-ink">HR</p>
              <p className="text-slate">{BRAND.hr.name}</p>
              <p className="mt-2 font-semibold text-ink">WhatsApp</p>
              <a href={BRAND.hr.whatsappLink} target="_blank" rel="noopener noreferrer"
                 className="text-signal underline">{BRAND.hr.whatsapp}</a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div><dt className="text-[12px] font-semibold text-slate-light">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd></div>
  );
}
