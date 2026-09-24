import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { assignRewards, approveReward } from '@/lib/services/documents';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  action: z.enum(['assign', 'approve', 'mark_paid', 'not_eligible']),
  duration: z.union([z.literal(4), z.literal(6), z.literal(8)]).optional(),
  field_id: z.string().uuid().nullable().optional(),
  reward_id: z.string().uuid().optional(),
  payment_date: z.string().optional(),
  payment_reference: z.string().max(80).optional(),
  payment_method: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const body = parsed.data;
    const db = createAdminClient();

    if (body.action === 'assign') {
      if (!body.duration) return fail(new Error('Choose a duration group first.'));
      return ok({ assigned: await assignRewards(body.duration, body.field_id ?? null, admin.id) });
    }

    if (!body.reward_id) return fail(new Error('Reward not specified.'));

    if (body.action === 'approve') return ok(await approveReward(body.reward_id, admin.id));

    if (body.action === 'mark_paid') {
      await db.from('rewards').update({
        status: 'paid',
        payment_date: body.payment_date ?? new Date().toISOString().slice(0, 10),
        payment_reference: body.payment_reference ?? null,
        payment_method: body.payment_method ?? null,
        notes: body.notes ?? null,
      }).eq('id', body.reward_id);
      await audit(admin.id, 'reward.paid', 'reward', body.reward_id, { ref: body.payment_reference });
      return ok();
    }

    await db.from('rewards').update({ status: 'not_eligible', notes: body.notes ?? null })
      .eq('id', body.reward_id);
    await audit(admin.id, 'reward.not_eligible', 'reward', body.reward_id);
    return ok();
  } catch (e) { return fail(e); }
}
