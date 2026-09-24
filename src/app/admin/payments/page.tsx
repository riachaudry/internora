import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { feeFor, type Duration, BRAND } from '@/lib/brand';
import { SectionHead, Card, Alert, Button } from '@/components/ui';
import { PaymentReview, type PaymentRow } from './PaymentReview';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'pending', label: 'Awaiting verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default async function AdminPaymentsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireAdmin();
  const filter = searchParams.status ?? 'pending';
  const db = createAdminClient();

  let query = db.from('payments')
    .select('id, method, transaction_id, amount_pkr, payment_date, screenshot_url, status, admin_note, created_at, profiles!payments_student_id_fkey(full_name, student_id), applications(duration, internship_fields(name))')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter === 'pending') query = query.in('status', ['submitted', 'under_verification']);
  else if (filter === 'verified') query = query.eq('status', 'verified');
  else if (filter === 'rejected') query = query.in('status', ['rejected', 'correction_requested', 'refunded']);

  const { data } = await query;

  const rows: PaymentRow[] = (data ?? []).map((p) => {
    const student = (p as any).profiles;
    const application = (p as any).applications;
    const duration = (application?.duration ?? 4) as Duration;
    return {
      id: p.id, method: p.method, transaction_id: p.transaction_id, amount_pkr: p.amount_pkr,
      payment_date: p.payment_date, screenshot_url: p.screenshot_url, status: p.status,
      admin_note: p.admin_note, created_at: p.created_at,
      expected_fee: feeFor(duration),
      student_name: student?.full_name ?? 'Unknown student',
      student_code: student?.student_id ?? null,
      field_name: application?.internship_fields?.name ?? '—',
      duration,
    };
  });

  return (
    <div className="space-y-6">
      <SectionHead title="Payments"
                   body="Verification is the only gate that activates an internship. Check the transaction ID against the account statement before you verify." />

      <Alert tone="info" title="Official payment details">
        <p className="mt-1">
          {BRAND.payment.methods.map((m) => m.label).join(' / ')} · Account name {BRAND.payment.accountName} ·
          Number {BRAND.payment.number}. Any proof naming a different account should be rejected.
        </p>
      </Alert>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.value} size="sm" href={`/admin/payments?status=${f.value}`}
                  variant={filter === f.value ? 'primary' : 'secondary'}>
            {f.label}
          </Button>
        ))}
      </div>

      {!rows.length ? (
        <Card className="p-8 text-center text-[14px] text-slate-light">
          Nothing here right now.
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => <PaymentReview key={p.id} payment={p} />)}
        </div>
      )}
    </div>
  );
}
