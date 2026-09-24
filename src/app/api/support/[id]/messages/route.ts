import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify, notifyMany } from '@/lib/notifications';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({ body: z.string().min(2).max(4000) });

/** Adds a reply to a ticket. Students may only reply to their own tickets. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await apiUser();
    if (!rateLimit(clientKey(req, 'ticket-reply'), 30).ok) {
      return fail(new Error('Too many replies at once. Wait a minute.'));
    }
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);

    const supabase = createClient();
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id, student_id, subject, status')
      .eq('id', params.id)
      .maybeSingle();

    if (!ticket) return fail(new Error('Ticket not found.'));

    const isOwner = ticket.student_id === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) return fail(new Error('You cannot reply to this ticket.'));

    const { error } = await supabase
      .from('support_messages')
      .insert({ ticket_id: ticket.id, author_id: user.id, body: parsed.data.body });
    if (error) return fail(new Error(error.message));

    await supabase.from('support_tickets')
      .update({ status: isAdmin ? 'answered' : 'open' })
      .eq('id', ticket.id);

    if (isAdmin) {
      await notify(ticket.student_id, 'support_reply',
        `Internora replied to your ticket: ${ticket.subject}`, '/dashboard/support');
    } else {
      const { data: admins } = await createAdminClient().from('profiles').select('id').eq('role', 'admin');
      await notifyMany((admins ?? []).map((a) => a.id), 'support_reply',
        `${user.full_name} replied on: ${ticket.subject}`, '/admin/support');
    }

    return ok();
  } catch (e) { return fail(e); }
}
