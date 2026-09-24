import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { paymentSchema } from '@/lib/validation';
import { feeFor } from '@/lib/brand';
import { notify, notifyMany } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../_lib';

export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    if (!rateLimit(clientKey(req, 'payment'), 6).ok) {
      return fail(new Error('Too many submissions. Wait a minute and try again.'));
    }

    const parsed = paymentSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const body = parsed.data;

    const supabase = createClient();

    // RLS already scopes this, and we check ownership again before writing.
    const { data: application } = await supabase.from('applications')
      .select('id, student_id, duration, status').eq('id', body.application_id).single();
    if (!application || application.student_id !== user.id) {
      return fail(new Error('That application does not belong to your account.'));
    }
    if (['approved', 'rejected', 'cancelled'].includes(application.status)) {
      return fail(new Error('This application is already closed.'));
    }

    // The fee is recomputed server-side so a tampered form cannot lower it.
    const expected = feeFor(application.duration as 4 | 6 | 8);
    if (body.amount_pkr !== expected) {
      return fail(new Error(`The amount must be exactly PKR ${expected.toLocaleString('en-PK')} for a ${application.duration}-week program.`));
    }

    const { error } = await supabase.from('payments').insert({
      application_id: application.id, student_id: user.id,
      method: body.method, transaction_id: body.transaction_id.trim(),
      payment_date: body.payment_date, amount_pkr: body.amount_pkr,
      screenshot_url: body.screenshot_url, status: 'under_verification',
    });
    if (error) {
      const duplicate = error.message.includes('payments_txn_unique');
      return fail(new Error(duplicate
        ? 'That transaction ID has already been submitted. Check your receipt.'
        : error.message));
    }

    await supabase.from('applications').update({ status: 'payment_submitted' }).eq('id', application.id);

    await notify(user.id, 'payment_submitted',
      'Your payment is under verification. This is checked by hand, usually within 24 hours.', '/dashboard');
    await sendEmail(user.email, 'payment_submitted', { name: user.full_name, txn: body.transaction_id });

    const { data: admins } = await createAdminClient().from('profiles').select('id').eq('role', 'admin');
    await notifyMany((admins ?? []).map((a) => a.id), 'payment_submitted',
      `${user.full_name} submitted a payment for review.`, '/admin/payments');

    await audit(user.id, 'payment.submit', 'application', application.id, { method: body.method });
    return ok();
  } catch (e) { return fail(e); }
}
