import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyMany } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(5).max(4000),
  audience: z.enum(['all', 'active', 'completed']).default('all'),
});

/** Publishes an announcement and pushes it out as an in-app notification. */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { title, body, audience } = parsed.data;

    const db = createAdminClient();
    const { error } = await db.from('announcements')
      .insert({ title, body, audience, created_by: admin.id });
    if (error) return fail(new Error(error.message));

    let ids: string[] = [];
    if (audience === 'all') {
      const { data } = await db.from('profiles').select('id').eq('role', 'student');
      ids = (data ?? []).map((p) => p.id);
    } else {
      const { data } = await db.from('internships').select('student_id')
        .eq('status', audience === 'active' ? 'active' : 'completed');
      ids = Array.from(new Set((data ?? []).map((i) => i.student_id)));
    }

    await notifyMany(ids, 'support_reply', `${title} — ${body.slice(0, 160)}`, '/dashboard/notifications');
    await audit(admin.id, 'announcement.publish', 'announcement', title, { audience, recipients: ids.length });
    return ok({ recipients: ids.length });
  } catch (e) { return fail(e); }
}
