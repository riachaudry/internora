import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/ids';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3).max(80),
  short_description: z.string().min(10).max(200),
  description: z.string().min(10).max(4000),
  skills: z.array(z.string().max(40)).max(30).optional(),
  evaluation_criteria: z.string().min(5).max(1000),
  certificate_criteria: z.string().min(5).max(1000),
  reward_criteria: z.string().min(5).max(1000),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

/** Create or update an internship field. Roadmap weeks are managed separately. */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { id, ...body } = parsed.data;

    const db = createAdminClient();
    const payload = { ...body, skills: body.skills ?? [], slug: slugify(body.name) };

    if (id) {
      const { error } = await db.from('internship_fields').update(payload).eq('id', id);
      if (error) return fail(new Error(error.message));
      await audit(admin.id, 'field.update', 'field', id);
      return ok();
    }

    const { data, error } = await db.from('internship_fields').insert(payload).select('id').single();
    if (error) return fail(new Error(error.message));
    await audit(admin.id, 'field.create', 'field', data.id);
    return ok({ id: data.id });
  } catch (e) { return fail(e); }
}
