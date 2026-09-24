import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { shortDate, isOverdue } from '@/lib/dates';
import { Card, SectionHead, StatusBadge, Alert, Badge } from '@/components/ui';
import { SubmitForm } from './SubmitForm';

export const dynamic = 'force-dynamic';

export default async function TaskPage({ params }: { params: { taskId: string } }) {
  const profile = await requireStudent();
  const supabase = createClient();

  // RLS restricts this to the signed-in student's own internship.
  const { data: task } = await supabase.from('internship_tasks')
    .select('*, internship_weeks(week_number, title, status, is_final)')
    .eq('id', params.taskId).maybeSingle();
  if (!task) notFound();

  const week = (task as any).internship_weeks;
  const { data: submissions } = await supabase.from('submissions')
    .select('id, attempt, file_url, file_name, url, text_response, comments, status, submitted_at, score, feedback, reviewed_at')
    .eq('task_id', task.id).order('attempt', { ascending: false });

  const locked = week?.status === 'locked' || task.status === 'locked';
  const closed = task.status === 'approved';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/tasks" className="text-[13px] font-semibold text-signal">← All tasks</Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">
            {week?.is_final ? 'Final project' : `Week ${week?.week_number}`} · {week?.title}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">{task.title}</h1>
          <p className="mt-1.5 font-mono text-[13px] text-slate-light">{task.task_code}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={isOverdue(task.deadline) && !['approved', 'under_review'].includes(task.status) ? 'overdue' : task.status} />
          <Badge tone="info">{task.points} points</Badge>
          {task.is_required ? <Badge tone="warn">Required</Badge> : <Badge>Optional</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Brief</h2>
            <p className="prose-narrow mt-2 text-[15px]">{task.description}</p>
            <h3 className="mt-6 text-[13px] font-semibold text-slate-light">Instructions</h3>
            <p className="prose-narrow mt-1.5 whitespace-pre-line text-[15px]">{task.instructions}</p>
            <h3 className="mt-6 text-[13px] font-semibold text-slate-light">Objective</h3>
            <p className="prose-narrow mt-1.5 text-[15px]">{task.objective}</p>
            <h3 className="mt-6 text-[13px] font-semibold text-slate-light">Required deliverable</h3>
            <p className="prose-narrow mt-1.5 text-[15px]">{task.deliverable}</p>
          </Card>

          {locked ? (
            <Alert tone="warn" title="This task is locked">
              Weeks unlock in order. Finish the current week&rsquo;s required work and wait for it to be approved.
            </Alert>
          ) : closed ? (
            <Alert tone="good" title="Approved">
              Scored {task.score ?? 100}/100. No further submissions are needed.
            </Alert>
          ) : (
            <SubmitForm
              taskId={task.id} userId={profile.id}
              submissionType={task.submission_type}
              allowed={task.allowed_file_types}
              resubmit={task.status === 'revision_required'}
            />
          )}

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Submission history</h2>
            {submissions?.length ? (
              <ol className="mt-4 space-y-4">
                {submissions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-mist-deep p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink">Attempt {s.attempt}</p>
                      <div className="flex items-center gap-2">
                        {s.score != null && <Badge tone="good">{s.score}/100</Badge>}
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-[12.5px] text-slate-light">Submitted {shortDate(s.submitted_at)}</p>
                    {s.file_url && (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                         className="mt-2 inline-block text-[13.5px] font-semibold text-signal underline">
                        {s.file_name ?? 'Attached file'}
                      </a>
                    )}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                         className="mt-2 block break-all text-[13.5px] text-signal underline">{s.url}</a>
                    )}
                    {s.text_response && (
                      <p className="mt-2 whitespace-pre-line text-[13.5px] text-slate">{s.text_response}</p>
                    )}
                    {s.feedback && (
                      <div className="mt-3 rounded-lg bg-mist/70 p-3">
                        <p className="text-[12px] font-semibold text-slate-light">Evaluator feedback</p>
                        <p className="mt-1 whitespace-pre-line text-[13.5px] text-ink">{s.feedback}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-[14px] text-slate-light">Nothing submitted yet.</p>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Details</h2>
            <dl className="mt-4 space-y-3 text-[14px]">
              <Row label="Unlocks" value={shortDate(task.unlock_date)} />
              <Row label="Deadline" value={shortDate(task.deadline)} />
              <Row label="Points" value={task.points} />
              <Row label="Submission type" value={task.submission_type.replace(/_/g, ' ')} />
              <Row label="File types" value={(task.allowed_file_types ?? []).join(', ')} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
