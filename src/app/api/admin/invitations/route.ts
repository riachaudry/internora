import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { inviteSchema } from '@/lib/validation';
import { createInviteToken } from '@/lib/ids';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../_lib';

/**
 * Sends an invitation. The raw token exists only in the email link; the
 * database keeps a salted hash, and the link expires.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = inviteSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { full_name, email } = parsed.data;

    const db = createAdminClient();
    const { data: existing } = await db.from('profiles').select('id').eq('email', email).maybeSingle();

    const ttlHours = Number(process.env.INVITE_TOKEN_TTL_HOURS ?? 72);
    const { token, tokenHash } = createInviteToken();
    const expiresAt = new Date(Date.now() + ttlHours * 3600_000);

    const { error } = await db.from('invitations').insert({
      full_name, email, token_hash: tokenHash,
      expires_at: expiresAt.toISOString(), created_by: admin.id,
    });
    if (error) return fail(new Error(error.message));

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const link = existing ? `${site}/login` : `${site}/invite/${token}`;

    await sendEmail(email, 'invitation', {
      name: full_name, link, ttlHours, existingAccount: !!existing,
    });
    await audit(admin.id, 'invitation.send', 'invitation', email, { existingAccount: !!existing });

    return ok({ sent: true, existingAccount: !!existing, expiresAt });
  } catch (e) { return fail(e); }
}
