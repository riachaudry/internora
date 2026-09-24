import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({ status: z.enum(['open', 'answered', 'closed']) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);

    const db = createAdminClient();
    const { error } = await db.from('support_tickets')
      .update({ status: parsed.data.status }).eq('id', params.id);
    if (error) return fail(new Error(error.message));

    await audit(admin.id, 'ticket.status', 'ticket', params.id, { status: parsed.data.status });
    return ok();
  } catch (e) { return fail(e); }
}
