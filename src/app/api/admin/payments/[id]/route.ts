import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { activateInternship } from '@/lib/services/internship';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  action: z.enum(['verify', 'reject', 'request_correction', 'refund']),
  note: z.string().max(1000).optional(),
  start_mode: z.enum(['immediate', 'scheduled']).optional(),
  start_date: z.string().optional(),
});

/**
 * Payment verification. Verifying is the single gate that activates an
 * internship — it is never automatic and never triggered by the student.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { action, note, start_mode, start_date } = parsed.data;

    const db = createAdminClient();
    const { data: payment } = await db.from('payments')
      .select('id, application_id, student_id, status').eq('id', params.id).single();
    if (!payment) return fail(new Error('Payment not found.'));

    if (action === 'verify') {
      await db.from('payments').update({
        status: 'verified', verified_by: admin.id, verified_at: new Date().toISOString(), admin_note: note ?? null,
      }).eq('id', payment.id);

      const startDate = start_mode === 'scheduled' && start_date ? new Date(start_date) : new Date();
      const result = await activateInternship({
        applicationId: payment.application_id, startDate, adminId: admin.id,
      });
      await audit(admin.id, 'payment.verify', 'payment', payment.id);
      return ok({ ...result, verified: true });
    }

    const statusMap = {
      reject: 'rejected', request_correction: 'correction_requested', refund: 'refunded',
    } as const;
    const messageMap = {
      reject: 'Your payment could not be verified. Check the details below and contact HR on WhatsApp.',
      request_correction: 'We need a correction on your payment before it can be verified.',
      refund: 'Your payment has been marked as refunded.',
    } as const;

    await db.from('payments').update({
      status: statusMap[action], admin_note: note ?? null,
      verified_by: admin.id, verified_at: new Date().toISOString(),
    }).eq('id', payment.id);

    if (action === 'reject') {
      await db.from('applications').update({ status: 'rejected', reviewed_by: admin.id, admin_note: note ?? null })
        .eq('id', payment.application_id);
    }

    await notify(payment.student_id, 'payment_rejected',
      `${messageMap[action]}${note ? ` Note: ${note}` : ''}`, '/dashboard/payment');
    await audit(admin.id, `payment.${action}`, 'payment', payment.id, { note });
    return ok();
  } catch (e) { return fail(e); }
}
