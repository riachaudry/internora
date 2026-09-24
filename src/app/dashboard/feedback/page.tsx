import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState } from '@/lib/services/student';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState, Button, Alert } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Row = {
  id: string; attempt: number; status: string; score: number | null;
  feedback: string | null; reviewed_at: string | null;
  internship_tasks: { id: string; task_code: string; title: string; points: number } | null;
};

export default async function FeedbackPage() {
  const profile = await requireStudent();
  const supabase = createClient();
  const { internship } = await loadStudentState(profile.id);

  const [{ data: subs }, { data: evaluation }] = await Promise.all([
    supabase.from('submissions')
      .select('id, attempt, status, score, feedback, reviewed_at, internship_tasks(id, task_code, title, points)')
      .eq('student_id', profile.id)
      .not('reviewed_at', 'is', null)
      .order('reviewed_at', { ascending: false }),
    internship
      ? supabase.from('evaluations')
          .select('weekly_score, final_project_score, overall_score, remarks, evaluated_at')
          .eq('internship_id', internship.id).order('evaluated_at', { ascending: false }).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = (subs ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <SectionHead title="Feedback"
                   body="Written reviewer notes on your submitted work, newest first. Revision requests tell you exactly what to change before resubmitting." />

      {evaluation && (
        <Alert tone="info" title="Final evaluation recorded">
          <p className="mt-1">
            Weekly performance {Number(evaluation.weekly_score).toFixed(1)} · Final project {Number(evaluation.final_project_score).toFixed(1)} ·
            {' '}Overall {Number(evaluation.overall_score).toFixed(1)} (recorded {shortDate(evaluation.evaluated_at)}).
          </p>
          {evaluation.remarks && <p className="mt-2 text-[14px]">{evaluation.remarks}</p>}
        </Alert>
      )}

      {!rows.length ? (
        <EmptyState
          title="No reviewed work yet"
          body="Once a reviewer looks at a submission, their decision and notes appear here."
          action={<Button href="/dashboard/tasks">Open my tasks</Button>}
        />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="font-mono text-[11.5px] text-slate-light">{r.internship_tasks?.task_code ?? '—'}</span>
                    <span className="text-[12.5px] text-slate-light">Attempt #{r.attempt}</span>
                  </div>
                  <h2 className="mt-1.5 font-display text-[16px] font-bold text-ink">
                    {r.internship_tasks?.title ?? 'Task removed'}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-ink">
                    {r.score === null ? '—' : `${r.score}/${r.internship_tasks?.points ?? '—'}`}
                  </p>
                  <p className="text-[12.5px] text-slate-light">
                    {r.reviewed_at ? shortDate(r.reviewed_at) : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-mist-deep bg-mist/40 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Reviewer notes</p>
                <p className="prose-narrow mt-1.5 whitespace-pre-line text-[14px]">
                  {r.feedback?.trim() || 'No written notes were left for this submission.'}
                </p>
              </div>

              {['revision_requested', 'rejected'].includes(r.status) && r.internship_tasks && (
                <div className="mt-4">
                  <Button href={`/dashboard/tasks/${r.internship_tasks.id}`} size="sm">Resubmit this task</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <p className="text-[13px] text-slate-light">
        Full submission history lives on the <Link className="text-signal underline underline-offset-2" href="/dashboard/submissions">Submissions</Link> page.
      </p>
    </div>
  );
}
