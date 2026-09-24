import { requireStudent } from '@/lib/auth';
import { loadStudentState, taskProgress } from '@/lib/services/student';
import { SCORE_WEIGHTS, WEEK_COMPLETION_THRESHOLD } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatCard, Progress, StatusBadge, EmptyState, Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const profile = await requireStudent();
  const { internship, weeks, tasks, clock } = await loadStudentState(profile.id);

  if (!internship) {
    return (
      <EmptyState title="Progress starts with an active internship"
                  body="Your weekly completion, task approvals and score breakdown appear here once your internship is active."
                  action={<Button href="/dashboard/apply">Start an application</Button>} />
    );
  }

  const overall = taskProgress(tasks);
  const finalWeek = weeks.find((w) => w.is_final);
  const weeklyWeight = Math.round(SCORE_WEIGHTS.weekly * 100);
  const finalWeight = Math.round(SCORE_WEIGHTS.finalProject * 100);

  return (
    <div className="space-y-6">
      <SectionHead
        title="Progress"
        body={`Your score is ${weeklyWeight}% weekly task performance and ${finalWeight}% final project. A week counts as complete once ${Math.round(WEEK_COMPLETION_THRESHOLD * 100)}% of its required task points are approved.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall score" value={internship.overall_score != null ? Number(internship.overall_score).toFixed(1) : '—'} hint="Out of 100" tone="accent" />
        <StatCard label={`Weekly (${weeklyWeight}%)`} value={internship.weekly_score != null ? Number(internship.weekly_score).toFixed(1) : '—'} />
        <StatCard label={`Final project (${finalWeight}%)`} value={internship.final_project_score != null ? Number(internship.final_project_score).toFixed(1) : '—'} />
        <StatCard label="Tasks approved" value={`${overall.approved}/${overall.total}`} hint={clock ? `Day ${clock.day} of ${clock.totalDays}` : undefined} />
      </div>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Task completion</h2>
        <div className="mt-4"><Progress value={overall.percent} label={`${overall.percent}% of all tasks approved`} /></div>
        <p className="mt-3 text-[13.5px] text-slate-light">
          {overall.pending} task{overall.pending === 1 ? '' : 's'} still open across unlocked weeks.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Week by week</h2>
        <div className="mt-4 space-y-4">
          {weeks.map((week) => {
            const weekTasks = tasks.filter((t) => t.week_id === week.id);
            const required = weekTasks.filter((t) => t.is_required);
            const requiredPoints = required.reduce((s, t) => s + t.points, 0);
            const earnedPoints = required
              .filter((t) => t.status === 'approved')
              .reduce((s, t) => s + t.points, 0);
            const pct = requiredPoints ? Math.round((earnedPoints / requiredPoints) * 100) : 0;

            return (
              <div key={week.id} className="rounded-xl border border-mist-deep p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[13px] font-bold uppercase tracking-wide text-slate-light">
                      {week.is_final ? 'Final project' : `Week ${week.week_number}`}
                    </span>
                    <StatusBadge status={week.status} />
                  </div>
                  <span className="text-[12.5px] text-slate-light">
                    {shortDate(week.start_date)} — {shortDate(week.end_date)}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-ink">{week.title}</p>
                <div className="mt-3">
                  <Progress value={pct} label={`${earnedPoints}/${requiredPoints} required points approved`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {finalWeek && (
        <Card className="p-5">
          <h2 className="font-display text-[15px] font-bold text-ink">Final project</h2>
          <p className="prose-narrow mt-2 text-[14.5px]">{finalWeek.summary}</p>
          <p className="mt-3 text-[13.5px] text-slate-light">
            Window: {shortDate(finalWeek.start_date)} — {shortDate(finalWeek.end_date)} · Status: {finalWeek.status}
          </p>
        </Card>
      )}
    </div>
  );
}
