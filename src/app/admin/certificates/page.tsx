import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, Badge, Alert } from '@/components/ui';
import { DocActions } from '../DocActions';

export const dynamic = 'force-dynamic';

export default async function AdminCertificatesPage() {
  await requireAdmin();
  const db = createAdminClient();

  const { data: certificates } = await db.from('certificates')
    .select(`id, public_id, issue_date, overall_score, status, revoked_reason, internship_id,
             internships(duration, internship_fields(name), profiles!internships_student_id_fkey(full_name, student_id))`)
    .order('created_at', { ascending: false }).limit(100);

  // Completed internships with no certificate yet — the issue queue.
  const { data: completed } = await db.from('internships')
    .select('id, duration, overall_score, completed_at, internship_fields(name), profiles!internships_student_id_fkey(full_name, student_id)')
    .eq('status', 'completed').order('completed_at', { ascending: false }).limit(50);

  const issuedIds = new Set((certificates ?? []).map((c) => c.internship_id));
  const queue = (completed ?? []).filter((i) => !issuedIds.has(i.id));

  return (
    <div className="space-y-6">
      <SectionHead title="Certificates"
                   body="Certificates are issued after meeting the published completion criteria: all weeks complete and the final project approved. The server refuses to issue one otherwise." />

      <div>
        <h2 className="font-display text-lg font-bold">Ready to issue</h2>
        {queue.length ? (
          <div className="mt-3 space-y-3">
            {queue.map((i) => {
              const s = (i as any).profiles;
              return (
                <Card key={i.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[16px] font-bold text-ink">{s?.full_name}</p>
                      <p className="mt-0.5 text-[13px] text-slate-light">
                        <span className="font-mono">{s?.student_id}</span> ·{' '}
                        {(i as any).internship_fields?.name} · {i.duration} weeks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="good">Score {Number(i.overall_score ?? 0).toFixed(1)}</Badge>
                      <span className="text-[12.5px] text-slate-light">
                        completed {i.completed_at ? shortDate(i.completed_at) : '—'}
                      </span>
                    </div>
                  </div>
                  <DocActions endpoint="/api/admin/certificates"
                              body={{ internship_id: i.id }}
                              actions={[{ key: 'issue', label: 'Issue certificate' }]} />
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="mt-3"><Alert tone="info">No completed internships are waiting for a certificate.</Alert></div>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-bold">Issued certificates</h2>
        <div className="mt-3 space-y-3">
          {(certificates ?? []).map((c) => {
            const i = (c as any).internships;
            const s = i?.profiles;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink">{s?.full_name}</p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      <span className="font-mono">{c.public_id}</span> · {i?.internship_fields?.name} ·
                      issued {shortDate(c.issue_date)} · score {Number(c.overall_score).toFixed(1)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.revoked_reason && (
                  <p className="mt-3 rounded-lg bg-danger-light p-3 text-[13.5px] text-danger">{c.revoked_reason}</p>
                )}
                <DocActions endpoint="/api/admin/certificates"
                            body={{ internship_id: c.internship_id }}
                            actions={c.status === 'revoked'
                              ? [{ key: 'reinstate', label: 'Reinstate' }]
                              : [{ key: 'revoke', label: 'Revoke', variant: 'danger', needsReason: true }]} />
              </Card>
            );
          })}
          {!certificates?.length && <Alert tone="info">Nothing issued yet.</Alert>}
        </div>
      </div>
    </div>
  );
}
