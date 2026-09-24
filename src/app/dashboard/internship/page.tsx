import { requireStudent } from '@/lib/auth';
import { loadStudentState, taskProgress } from '@/lib/services/student';
import { shortDate } from '@/lib/dates';
import { formatPKR, PLANS, WEEK_COMPLETION_THRESHOLD, type Duration } from '@/lib/brand';
import { Card, SectionHead, StatusBadge, Progress, EmptyState, Button, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function MyInternshipPage() {
  const profile = await requireStudent();
  const { internship, weeks, tasks, application, docs } = await loadStudentState(profile.id);

  if (!internship) {
    return <EmptyState title="No active internship"
                       body="Your internship record is created when an admin verifies your payment."
                       action={<Button href={application ? '/dashboard/payment' : '/dashboard/apply'}>
                         {application ? 'Go to payment' : 'Apply now'}</Button>} />;
  }

  const field = (internship.internship_fields as any)?.name ?? '—';
  const progress = taskProgress(tasks);
  const plan = PLANS[internship.duration as Duration];

  return (
    <div className="space-y-6">
      <SectionHead title="My internship" body={`${field} · ${internship.duration}-week project-based virtual internship.`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">Program record</h2>
              <StatusBadge status={internship.status} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px] sm:grid-cols-3">
              <Item label="Field" value={field} />
              <Item label="Duration" value={`${internship.duration} weeks`} />
              <Item label="Mode" value="Online / Virtual" />
              <Item label="Type" value="Project-Based Internship" />
              <Item label="Start date" value={internship.start_date ? shortDate(internship.start_date) : '—'} />
              <Item label="End date" value={internship.end_date ? shortDate(internship.end_date) : '—'} />
              <Item label="Fee paid" value={application ? formatPKR(application.fee_pkr) : '—'} />
              <Item label="Offer letter" value={docs?.offer?.public_id ?? 'Pending'} />
              <Item label="Completed" value={internship.completed_at ? shortDate(internship.completed_at) : '—'} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Scores</h2>
            <p className="mt-1 text-[13.5px] text-slate-light">
              Final score is 70% weekly work and 30% final project. Scores update as submissions are reviewed.
            </p>
            <div className="mt-5 space-y-4">
              <Progress value={Number(internship.weekly_score ?? 0)} label="Weekly work (70% weight)" />
              <Progress value={Number(internship.final_project_score ?? 0)} label="Final project (30% weight)" />
              <div className="border-t border-mist pt-4">
                <Progress value={Number(internship.overall_score ?? 0)} label="Overall score" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Completion requirements</h2>
            <ul className="mt-3 space-y-2 text-[14px] text-slate">
              <li>• Every week&rsquo;s required tasks submitted and reviewed.</li>
              <li>• At least {Math.round(WEEK_COMPLETION_THRESHOLD * 100)}% of each week&rsquo;s required task points approved.</li>
              <li>• Final project submitted and approved.</li>
              <li>• Certificates are issued after meeting the published completion criteria.</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Progress</h2>
            <div className="mt-4"><Progress value={progress.percent} label="Tasks approved" /></div>
            <dl className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-slate">Weeks completed</dt>
                <dd className="font-semibold text-ink">{weeks.filter((w) => w.status === 'completed').length}/{weeks.length}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">Tasks approved</dt>
                <dd className="font-semibold text-ink">{progress.approved}/{progress.total}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">Tasks pending</dt>
                <dd className="font-semibold text-ink">{progress.pending}</dd></div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Reward tier</h2>
            <ul className="mt-3 space-y-1.5 text-[14px]">
              {plan.rewards.map((r) => (
                <li key={r.position} className="flex justify-between">
                  <span className="text-slate">Position {r.position}</span>
                  <span className="font-semibold text-ink">{r.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-light">
              Performance rewards are subject to eligibility and final evaluation.
            </p>
            {docs?.reward && <div className="mt-3"><Badge tone="info">Your status: {docs.reward.status.replace(/_/g, ' ')}</Badge></div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-[12px] font-semibold text-slate-light">{label}</dt>
    <dd className="mt-0.5 font-semibold text-ink">{value}</dd></div>;
}
