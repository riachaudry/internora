import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Table, Badge, Card } from '@/components/ui';
import { InviteForm } from './InviteForm';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  await requireAdmin();
  const { data: invites } = await createAdminClient().from('invitations')
    .select('id, full_name, email, expires_at, accepted_at, created_at')
    .order('created_at', { ascending: false }).limit(100);

  const now = Date.now();

  return (
    <div className="space-y-6">
      <SectionHead title="Invitations"
                   body="Send a single-use signup link. The raw token only ever exists in the email — the database stores a salted hash, and the link expires." />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <InviteForm />

        <div>
          {invites?.length ? (
            <Table head={['Name', 'Email', 'Sent', 'Expires', 'Status']}>
              {invites.map((i) => {
                const expired = new Date(i.expires_at).getTime() < now;
                return (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-semibold text-ink">{i.full_name}</td>
                    <td className="px-4 py-3 text-slate">{i.email}</td>
                    <td className="px-4 py-3 text-slate">{shortDate(i.created_at)}</td>
                    <td className="px-4 py-3 text-slate">{shortDate(i.expires_at)}</td>
                    <td className="px-4 py-3">
                      {i.accepted_at ? <Badge tone="good">Accepted</Badge>
                        : expired ? <Badge tone="bad">Expired</Badge>
                        : <Badge tone="info">Pending</Badge>}
                    </td>
                  </tr>
                );
              })}
            </Table>
          ) : (
            <Card className="p-5"><p className="text-[14px] text-slate-light">No invitations sent yet.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}
