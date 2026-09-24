import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  name: z.string().min(2).max(80),
  field_id: z.string().uuid().nullable().optional(),
  duration: z.union([z.literal(4), z.literal(6), z.literal(8)]).nullable().optional(),
  start_date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);

    const { data, error } = await createAdminClient().from('batches')
      .insert({ ...parsed.data, field_id: parsed.data.field_id ?? null })
      .select('id').single();
    if (error) return fail(new Error(error.message));

    await audit(admin.id, 'batch.create', 'batch', data.id);
    return ok({ id: data.id });
  } catch (e) { return fail(e); }
}
