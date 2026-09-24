import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Table, Card, EmptyState } from '@/components/ui';
import { BatchForm } from './BatchForm';

export const dynamic = 'force-dynamic';

export default async function AdminBatchesPage() {
  await requireAdmin();
  const db = createAdminClient();

  const [{ data: batches }, { data: fields }] = await Promise.all([
    db.from('batches').select('id, name, duration, start_date, notes, created_at, internship_fields(name)')
      .order('created_at', { ascending: false }).limit(100),
    db.from('internship_fields').select('id, name').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <div className="space-y-6">
      <SectionHead title="Batches"
                   body="Optional cohorts for grouping intakes. Internship dates always come from each student's own verified start date, not from the batch." />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <BatchForm fields={fields ?? []} />
        <div>
          {batches?.length ? (
            <Table head={['Batch', 'Field', 'Duration', 'Start', 'Created']}>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{b.name}</p>
                    {b.notes && <p className="text-[12.5px] text-slate-light">{b.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate">{(b as any).internship_fields?.name ?? 'Any'}</td>
                  <td className="px-4 py-3 text-slate">{b.duration ? `${b.duration} weeks` : 'Any'}</td>
                  <td className="px-4 py-3 text-slate">{b.start_date ? shortDate(b.start_date) : '—'}</td>
                  <td className="px-4 py-3 text-slate">{shortDate(b.created_at)}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <Card className="p-5"><p className="text-[14px] text-slate-light">No batches created yet.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}
