import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SectionHead, Table, Badge, Alert, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminEmailsPage() {
  await requireAdmin();
  const { data: logs } = await createAdminClient().from('email_log')
    .select('id, to_email, template, subject, status, error, created_at')
    .order('created_at', { ascending: false }).limit(200);

  const provider = process.env.EMAIL_PROVIDER ?? 'console';

  return (
    <div className="space-y-5">
      <SectionHead title="Email log" body="Every transactional email the system has attempted to send." />

      {provider === 'console' && (
        <Alert tone="warn" title="Email provider is set to console">
          Emails are being written to the server log instead of sent. Set <code>EMAIL_PROVIDER=resend</code> and
          a <code>RESEND_API_KEY</code> in your environment to deliver them for real.
        </Alert>
      )}

      {logs?.length ? (
        <Table head={['To', 'Template', 'Subject', 'Sent', 'Status']}>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 text-slate">{l.to_email}</td>
              <td className="px-4 py-3 font-mono text-[12.5px] text-slate-light">{l.template}</td>
              <td className="px-4 py-3 text-ink">{l.subject}</td>
              <td className="px-4 py-3 text-slate">
                {new Date(l.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </td>
              <td className="px-4 py-3">
                <Badge tone={l.status === 'sent' ? 'good' : 'bad'}>{l.status}</Badge>
                {l.error && <p className="mt-1 text-[12px] text-danger">{l.error}</p>}
              </td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState title="No emails logged yet" body="Transactional emails appear here as they are sent." />}
    </div>
  );
}
