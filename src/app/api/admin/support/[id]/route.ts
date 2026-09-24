import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  reply: z.string().max(4000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { reply, status } = parsed.data;

    const db = createAdminClient();
    const { data: ticket } = await db.from('support_tickets')
      .select('id, student_id, subject').eq('id', params.id).single();
    if (!ticket) return fail(new Error('Ticket not found.'));

    if (reply?.trim()) {
      await db.from('support_messages').insert({ ticket_id: ticket.id, author_id: admin.id, body: reply.trim() });
      await notify(ticket.student_id, 'support_reply',
        `Support replied to "${ticket.subject}".`, '/dashboard/support');
    }
    if (status) {
      await db.from('support_tickets').update({ status }).eq('id', ticket.id);
    }

    await audit(admin.id, 'support.reply', 'ticket', ticket.id, { status });
    return ok();
  } catch (e) { return fail(e); }
}
