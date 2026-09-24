import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ticketSchema } from '@/lib/validation';
import { notifyMany } from '@/lib/notifications';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { ok, fail, zodFail } from '../_lib';

export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    if (!rateLimit(clientKey(req, 'ticket'), 10).ok) {
      return fail(new Error('Too many tickets at once. Wait a minute.'));
    }
    const parsed = ticketSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);

    const { data: ticket, error } = await createClient().from('support_tickets')
      .insert({ student_id: user.id, ...parsed.data }).select('id').single();
    if (error) return fail(new Error(error.message));

    const { data: admins } = await createAdminClient().from('profiles').select('id').eq('role', 'admin');
    await notifyMany((admins ?? []).map((a) => a.id), 'support_reply',
      `${user.full_name} opened a ticket: ${parsed.data.subject}`, '/admin/support');

    return ok({ ticketId: ticket.id });
  } catch (e) { return fail(e); }
}
