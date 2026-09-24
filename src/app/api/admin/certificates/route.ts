import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { issueCertificate } from '@/lib/services/documents';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  internship_id: z.string().uuid(),
  action: z.enum(['issue', 'revoke', 'reinstate']),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { internship_id, action, reason } = parsed.data;

    if (action === 'issue') {
      const result = await issueCertificate(internship_id, admin.id);
      return ok(result);
    }

    const db = createAdminClient();
    await db.from('certificates').update({
      status: action === 'revoke' ? 'revoked' : 'issued',
      revoked_reason: action === 'revoke' ? (reason ?? null) : null,
    }).eq('internship_id', internship_id);

    await audit(admin.id, `certificate.${action}`, 'internship', internship_id, { reason });
    return ok();
  } catch (e) { return fail(e); }
}
