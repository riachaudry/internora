import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { issueLor } from '@/lib/services/documents';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  internship_id: z.string().uuid(),
  action: z.enum(['draft', 'issue', 'revoke']),
  position: z.number().int().min(1).max(3).optional(),
  performance: z.string().max(3000).optional(),
  skills: z.array(z.string().max(40)).max(20).optional(),
  achievements: z.string().max(2000).optional(),
  recommendation: z.string().max(3000).optional(),
});

/** LORs are drafted and edited by admin before they can be issued. */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { internship_id, action, ...content } = parsed.data;
    const db = createAdminClient();

    if (action === 'draft') {
      const { data: existing } = await db.from('lor_records')
        .select('id, public_id').eq('internship_id', internship_id).maybeSingle();

      if (existing) {
        await db.from('lor_records').update({ ...content, status: 'draft' }).eq('id', existing.id);
        await audit(admin.id, 'lor.update', 'lor', existing.public_id);
        return ok({ publicId: existing.public_id });
      }

      const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-LOR', p_scope: 'lor' });
      const { data, error } = await db.from('lor_records')
        .insert({ internship_id, public_id: pid as unknown as string, ...content, status: 'draft' })
        .select('public_id').single();
      if (error) return fail(new Error(error.message));
      await audit(admin.id, 'lor.draft', 'lor', data.public_id);
      return ok({ publicId: data.public_id });
    }

    if (action === 'issue') return ok(await issueLor(internship_id, admin.id));

    await db.from('lor_records').update({ status: 'revoked' }).eq('internship_id', internship_id);
    await audit(admin.id, 'lor.revoke', 'internship', internship_id);
    return ok();
  } catch (e) { return fail(e); }
}
