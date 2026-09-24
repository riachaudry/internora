import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applicationSchema } from '@/lib/validation';
import { feeFor } from '@/lib/brand';
import { notify } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../_lib';

export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    const parsed = applicationSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { field_slug, duration } = parsed.data;

    const supabase = createClient();
    const db = createAdminClient();

    const { data: field } = await db.from('internship_fields')
      .select('id, name').eq('slug', field_slug).eq('is_active', true).single();
    if (!field) return fail(new Error('That internship field is not available.'));

    // One open application at a time keeps the student dashboard unambiguous.
    const { data: open } = await supabase.from('applications')
      .select('id, status').eq('student_id', user.id)
      .not('status', 'in', '("rejected","cancelled")').maybeSingle();
    if (open) return fail(new Error('You already have an application in progress. Finish or cancel it first.'));

    const fee = feeFor(duration);
    const { data: application, error } = await supabase.from('applications').insert({
      student_id: user.id, field_id: field.id, duration, fee_pkr: fee, status: 'submitted',
    }).select('id').single();
    if (error) return fail(new Error(error.message));

    await notify(user.id, 'application_received',
      `Application for ${field.name} (${duration} weeks) received. Submit your fee of PKR ${fee.toLocaleString('en-PK')} next.`,
      '/dashboard/payment');
    await sendEmail(user.email, 'application_received', {
      name: user.full_name, field: field.name, duration, fee: fee.toLocaleString('en-PK'),
    });
    await audit(user.id, 'application.create', 'application', application.id, { field: field_slug, duration });

    return ok({ applicationId: application.id, fee });
  } catch (e) { return fail(e); }
}
