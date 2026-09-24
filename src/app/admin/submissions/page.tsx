import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState, Badge } from '@/components/ui';
import { ReviewPanel } from './ReviewPanel';

export const dynamic = 'force-dynamic';

const TABS = ['under_review', 'approved', 'revision_required', 'rejected', 'all'] as const;

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: { tab?: string } }) {
  await requireAdmin();
  const tab = (TABS.includes(searchParams.tab as any) ? searchParams.tab : 'under_review') as typeof TABS[number];
  const db = createAdminClient();

  let query = db.from('submissions')
    .select(`id, attempt, file_url, file_name, url, text_response, comments, status, submitted_at, score, feedback,
             internship_tasks(title, task_code, points, deliverable, objective, internship_weeks(week_number, is_final, title)),
             profiles!submissions_student_id_fkey(full_name, student_id)`)
    .order('submitted_at', { ascending: true });

  if (tab !== 'all') query = query.eq('status', tab);
  const { data: submissions } = await query.limit(100);

  return (
    <div className="space-y-5">
      <SectionHead title="Submission review"
                   body="Approving enough of a week's required task points completes that week and unlocks the next one. Scores feed straight into the leaderboard." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t} href={`/admin/submissions?tab=${t}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               tab === t ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {t.replace(/_/g, ' ')}
          </a>
        ))}
      </div>

      {submissions?.length ? (
        <div className="space-y-4">
          {submissions.map((s) => {
            const task = (s as any).internship_tasks;
            const week = task?.internship_weeks;
            const student = (s as any).profiles;
            return (
              <Card key={s.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-[17px] font-bold text-ink">{task?.title}</p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      <span className="font-mono">{task?.task_code}</span> ·{' '}
                      {week?.is_final ? 'Final project' : `Week ${week?.week_number}`} · {task?.points} points
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate">
                      {student?.full_name} · <span className="font-mono text-[12.5px]">{student?.student_id}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="info">Attempt {s.attempt}</Badge>
                    <StatusBadge status={s.status} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-mist/60 p-4">
                  <p className="text-[12px] font-semibold text-slate-light">Required deliverable</p>
                  <p className="mt-1 text-[14px] text-ink">{task?.deliverable}</p>
                </div>

                <div className="mt-4 space-y-2 text-[14px]">
                  {s.file_url && (
                    <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                       className="block font-semibold text-signal underline">{s.file_name ?? 'Attached file'}</a>
                  )}
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                       className="block break-all text-signal underline">{s.url}</a>
                  )}
                  {s.text_response && (
                    <p className="whitespace-pre-line text-slate">{s.text_response}</p>
                  )}
                  {s.comments && (
                    <p className="text-[13.5px] text-slate-light">
                      <span className="font-semibold text-ink">Student note:</span> {s.comments}
                    </p>
                  )}
                  <p className="text-[12.5px] text-slate-light">Submitted {shortDate(s.submitted_at)}</p>
                </div>

                {s.feedback && (
                  <p className="mt-3 rounded-lg bg-signal-light/40 p-3 text-[13.5px] text-ink">
                    <span className="font-semibold">Your feedback:</span> {s.feedback}
                    {s.score != null && ` · ${s.score}/100`}
                  </p>
                )}

                {s.status === 'under_review' && <ReviewPanel submissionId={s.id} />}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Review queue is clear" body="No submissions match this filter." />
      )}
    </div>
  );
}
