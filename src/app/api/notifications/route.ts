import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ok, fail } from '../_lib';

/** Marks one notification read, or all of them when no id is given. */
export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    const { id } = await req.json().catch(() => ({ id: undefined }));
    const supabase = createClient();
    let q = supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    if (id) q = q.eq('id', id);
    const { error } = await q;
    if (error) return fail(new Error(error.message));
    return ok();
  } catch (e) { return fail(e); }
}
