import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashToken } from '@/lib/ids';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your invitation' };

/**
 * Invitation landing. The raw token never leaves the email — we look up its
 * hash. Expired or used tokens fail closed.
 */
export default async function InvitePage({ params }: { params: { token: string } }) {
  const db = createAdminClient();
  const { data: invite } = await db.from('invitations')
    .select('full_name, email, expires_at, accepted_at')
    .eq('token_hash', hashToken(params.token)).maybeSingle();

  if (!invite) return <InviteProblem title="This invitation link is not valid"
    body="The link may have been mistyped or already replaced by a newer invitation. Ask HR to send a fresh one." />;

  if (invite.accepted_at) return <InviteProblem title="This invitation has already been used"
    body="Sign in with the account you created." action={<Button href="/login">Sign in</Button>} />;

  if (new Date(invite.expires_at) < new Date()) return <InviteProblem title="This invitation has expired"
    body="Invitation links are time-limited for security. Ask HR to send a new one." />;

  const { data: existing } = await db.from('profiles').select('id').eq('email', invite.email).maybeSingle();
  if (existing) redirect('/login?message=You already have an account. Sign in to continue.');

  redirect(`/register?token=${encodeURIComponent(params.token)}`);
}

function InviteProblem({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <Card className="p-7">
      <h1 className="font-display text-2xl font-extrabold">{title}</h1>
      <p className="prose-narrow mt-3 text-[15px]">{body}</p>
      <div className="mt-6 flex gap-3">
        {action ?? <Button href="/register">Register normally</Button>}
        <Link href="/contact" className="self-center text-[14px] font-semibold text-signal hover:underline">Contact HR</Link>
      </div>
    </Card>
  );
}
