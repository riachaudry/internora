import Link from 'next/link';
import { RegisterForm } from './RegisterForm';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashToken } from '@/lib/ids';

export const metadata = { title: 'Create your account' };
export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: { searchParams: { field?: string; duration?: string; token?: string } }) {
  let invited: { full_name: string; email: string } | null = null;

  if (searchParams.token) {
    const { data } = await createAdminClient().from('invitations')
      .select('full_name, email, expires_at, accepted_at')
      .eq('token_hash', hashToken(searchParams.token)).maybeSingle();
    if (data && !data.accepted_at && new Date(data.expires_at) > new Date()) {
      invited = { full_name: data.full_name, email: data.email };
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-[15px] text-slate">
        Already registered? <Link href="/login" className="font-semibold text-signal hover:underline">Sign in</Link>
      </p>
      <RegisterForm
        invited={invited}
        inviteToken={invited ? searchParams.token : undefined}
        preselectField={searchParams.field}
        preselectDuration={searchParams.duration}
      />
    </>
  );
}
