import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState } from '@/components/ui';
import { DocActions } from '../DocActions';

export const dynamic = 'force-dynamic';

export default async function AdminOfferLettersPage() {
  await requireAdmin();
  const { data: letters } = await createAdminClient().from('offer_letters')
    .select(`id, public_id, issue_date, status, revoked_reason,
             internships(duration, start_date, end_date, internship_fields(name),
                         profiles!internships_student_id_fkey(full_name, student_id))`)
    .order('created_at', { ascending: false }).limit(100);

  if (!letters?.length) {
    return <EmptyState title="No offer letters yet"
                       body="An offer letter is issued automatically the moment a payment is verified and an internship activates." />;
  }

  return (
    <div className="space-y-5">
      <SectionHead title="Offer letters"
                   body="Issued automatically on activation. You can correct dates, regenerate, or revoke a letter here — every action is audited." />
      <div className="space-y-4">
        {letters.map((l) => {
          const i = (l as any).internships;
          const s = i?.profiles;
          return (
            <Card key={l.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-[17px] font-bold text-ink">{s?.full_name}</p>
                  <p className="mt-0.5 text-[13px] text-slate-light">
                    <span className="font-mono">{l.public_id}</span> · {i?.internship_fields?.name} · {i?.duration} weeks
                  </p>
                  <p className="mt-1 text-[13px] text-slate-light">
                    {i?.start_date ? shortDate(i.start_date) : '—'} — {i?.end_date ? shortDate(i.end_date) : '—'} ·
                    issued {shortDate(l.issue_date)}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
              {l.revoked_reason && (
                <p className="mt-3 rounded-lg bg-danger-light p-3 text-[13.5px] text-danger">{l.revoked_reason}</p>
              )}
              <DocActions
                endpoint={`/api/admin/offer-letters/${l.id}`}
                actions={l.status === 'revoked'
                  ? [{ key: 'reinstate', label: 'Reinstate' }]
                  : [
                      { key: 'regenerate', label: 'Regenerate', variant: 'secondary' },
                      { key: 'revoke', label: 'Revoke', variant: 'danger', needsReason: true },
                    ]}
                dateFields
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
