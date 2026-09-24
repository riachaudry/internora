import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registerSchema } from '@/lib/validation';
import { hashToken } from '@/lib/ids';
import { sendEmail } from '@/lib/email';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../_lib';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(clientKey(req, 'register'), 5).ok) {
      return fail(new Error('Too many attempts. Wait a minute and try again.'));
    }

    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { password, invite_token, ...profile } = parsed.data;

    const db = createAdminClient();

    // Supabase Auth hashes the password; we never store or log it.
    const { data: created, error: authError } = await db.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: profile.full_name },
    });
    if (authError || !created.user) {
      const taken = authError?.message?.toLowerCase().includes('already');
      return fail(new Error(taken
        ? 'An account already exists for that email. Sign in instead.'
        : authError?.message ?? 'Could not create the account.'));
    }

    // The auth trigger created the profile row; fill in the rest.
    const { error: profileError } = await db.from('profiles').update({
      phone: profile.phone, whatsapp: profile.whatsapp,
      date_of_birth: profile.date_of_birth || null, gender: profile.gender || null,
      city: profile.city, country: profile.country,
      education_level: profile.education_level, university: profile.university,
      field_of_study: profile.field_of_study, bio: profile.bio || null,
      skills: profile.skills ?? [],
      linkedin_url: profile.linkedin_url || null, portfolio_url: profile.portfolio_url || null,
    }).eq('id', created.user.id);
    if (profileError) console.error('[register] profile update failed', profileError);

    if (invite_token) {
      await db.from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token_hash', hashToken(invite_token));
    }

    const { data: row } = await db.from('profiles').select('student_id').eq('id', created.user.id).single();
    await sendEmail(profile.email, 'welcome', { name: profile.full_name, studentId: row?.student_id });
    await audit(created.user.id, 'auth.register', 'profile', created.user.id, {}, req.headers.get('x-forwarded-for'));

    return ok({ ok: true, studentId: row?.student_id });
  } catch (e) { return fail(e); }
}
