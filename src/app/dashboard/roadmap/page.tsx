import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { shortDate, isOverdue } from '@/lib/dates';
import { WEEK_COMPLETION_THRESHOLD } from '@/lib/brand';
import { Card, SectionHead, StatusBadge, Progress, EmptyState, Button, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const profile = await requireStudent();
  const { internship, weeks, tasks } = await loadStudentState(profile.id);

  if (!internship || !weeks.length) {
    return (
      <EmptyState title="Your roadmap unlocks with your internship"
                  body="Once your payment is verified, your full weekly roadmap is generated with real dates and deadlines."
                  action={<Button href="/dashboard/payment">Go to payment</Button>} />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHead
        title="Weekly roadmap"
        body={`Each week unlocks only after ${Math.round(WEEK_COMPLETION_THRESHOLD * 100)}% of the previous week's required task points are approved. This is enforced on the server, not just hidden in the interface.`}
      />

      <div className="space-y-4">
        {weeks.map((week) => {
          const weekTasks = tasks.filter((t) => t.week_id === week.id);
          const approved = weekTasks.filter((t) => t.status === 'approved');
          const pct = weekTasks.length ? Math.round((approved.length / weekTasks.length) * 100) : 0;
          const locked = week.status === 'locked';

          return (
            <Card key={week.id} className={`p-5 ${locked ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[13px] font-bold uppercase tracking-wide text-slate-light">
                      {week.is_final ? 'Final project' : `Week ${week.week_number}`}
                    </span>
                    <StatusBadge status={week.status} />
                    {week.is_final && <Badge tone="warn">30% of final score</Badge>}
                  </div>
                  <h2 className="mt-1.5 font-display text-lg font-bold text-ink">{week.title}</h2>
                  <p className="prose-narrow mt-1.5 text-[14px]">{week.summary}</p>
                </div>
                <div className="text-right text-[13px] text-slate-light">
                  <p>{shortDate(week.start_date)} — {shortDate(week.end_date)}</p>
                  <p className="mt-1 font-semibold text-ink">{approved.length}/{weekTasks.length} approved</p>
                </div>
              </div>

              {!!week.objectives?.length && (
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {week.objectives.map((o) => (
                    <li key={o} className="flex gap-2 text-[13.5px] text-slate">
                      <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                      {o}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5"><Progress value={pct} /></div>

              {locked ? (
                <p className="mt-4 text-[13.5px] font-medium text-slate-light">
                  🔒 Locked — finish the previous week to unlock these tasks.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-mist border-t border-mist">
                  {weekTasks.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <Link href={`/dashboard/tasks/${t.id}`} className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold text-ink">
                          {t.task_number}. {t.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-slate-light">
                          <span className="font-mono">{t.task_code}</span> · {t.points} pts
                          {t.is_required ? ' · required' : ' · optional'}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[13px] ${isOverdue(t.deadline) && t.status !== 'approved' ? 'font-semibold text-danger' : 'text-slate-light'}`}>
                          due {shortDate(t.deadline)}
                        </span>
                        <StatusBadge status={isOverdue(t.deadline) && !['approved', 'under_review'].includes(t.status) ? 'overdue' : t.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
