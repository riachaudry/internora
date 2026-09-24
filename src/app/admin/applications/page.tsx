import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPKR } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { SectionHead, Table, StatusBadge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const TABS = ['open', 'approved', 'rejected', 'all'] as const;

export default async function AdminApplicationsPage({ searchParams }: { searchParams: { tab?: string } }) {
  await requireAdmin();
  const tab = (TABS.includes(searchParams.tab as any) ? searchParams.tab : 'open') as typeof TABS[number];
  const db = createAdminClient();

  let query = db.from('applications')
    .select(`id, duration, fee_pkr, status, applied_at, admin_note,
             internship_fields(name), profiles!applications_student_id_fkey(full_name, student_id, email)`)
    .order('applied_at', { ascending: false }).limit(200);

  if (tab === 'open') query = query.in('status', ['submitted', 'payment_submitted', 'under_verification']);
  if (tab === 'approved') query = query.eq('status', 'approved');
  if (tab === 'rejected') query = query.in('status', ['rejected', 'cancelled']);

  const { data: apps } = await query;

  return (
    <div className="space-y-5">
      <SectionHead title="Applications"
                   body="Applications move to approved automatically when their payment is verified. Verify payments on the Payments page." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t} href={`/admin/applications?tab=${t}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold capitalize ${
               tab === t ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>{t}</a>
        ))}
      </div>

      {apps?.length ? (
        <Table head={['Student', 'Field', 'Duration', 'Fee', 'Applied', 'Status']}>
          {apps.map((a) => {
            const s = (a as any).profiles;
            return (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{s?.full_name}</p>
                  <p className="font-mono text-[12px] text-slate-light">{s?.student_id}</p>
                </td>
                <td className="px-4 py-3 text-slate">{(a as any).internship_fields?.name}</td>
                <td className="px-4 py-3 text-slate">{a.duration} weeks</td>
                <td className="px-4 py-3 font-semibold text-ink">{formatPKR(a.fee_pkr)}</td>
                <td className="px-4 py-3 text-slate">{shortDate(a.applied_at)}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              </tr>
            );
          })}
        </Table>
      ) : <EmptyState title="No applications" body="Nothing matches this filter." />}
    </div>
  );
}
