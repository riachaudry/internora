import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState, stageOf, taskProgress } from '@/lib/services/student';
import { longDate, shortDate, isOverdue } from '@/lib/dates';
import { formatPKR, PLANS, type Duration } from '@/lib/brand';
import { Card, StatCard, Badge, StatusBadge, Progress, Button, Alert, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const profile = await requireStudent();
  const state = await loadStudentState(profile.id);
  const stage = stageOf(state);
  const { internship, weeks, tasks, docs, clock, application, payment } = state;
  const field = (internship?.internship_fields as any)?.name
    ?? (application?.internship_fields as any)?.name
    ?? null;
  const progress = taskProgress(tasks);

  const supabase = createClient();
  const { data: recent } = await supabase.from('notifications')
    .select('id, title, message, link, created_at, is_read')
    .eq('user_id', profile.id).order('created_at', { ascending: false }).limit(4);

  const activeWeek = weeks.find((w) => w.status === 'active');
  const dueSoon = tasks
    .filter((t) => !['approved', 'locked'].includes(t.status))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* TODAY — always the live system date, never a stored one. */}
      <Card className="flex flex-wrap items-center justify-between gap-5 p-5">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Today</p>
          <p className="mt-1 font-display text-xl font-extrabold text-ink sm:text-2xl">{longDate()}</p>
          <p className="mt-1 text-[14px] text-slate">
            Welcome back, {profile.full_name.split(' ')[0]}
            {profile.student_id && <> · <span className="font-mono text-[13px]">{profile.student_id}</span></>}
          </p>
        </div>
        {clock && internship?.start_date ? (
          <div className="flex gap-6">
            <div>
              <p className="text-[12px] font-semibold text-slate-light">Progress</p>
              <p className="font-display text-xl font-extrabold text-ink">
                Day {Math.min(clock.day, clock.totalDays)} of {clock.totalDays}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-light">Days remaining</p>
              <p className="font-display text-xl font-extrabold text-signal">{clock.remaining}</p>
            </div>
          </div>
        ) : (
          <Badge tone="info">No active internship yet</Badge>
        )}
      </Card>

      {stage === 'no_application' && (
        <EmptyState
          title="You haven't applied yet"
          body="Choose an internship field and a 4, 6 or 8 week duration. Your fee, roadmap and reward tier all follow from that choice."
          action={<Button href="/dashboard/apply">Browse internships</Button>}
        />
      )}

      {stage === 'awaiting_payment' && application && (
        <Alert tone="warn" title="Next step: submit your fee">
          Your application for {field} ({application.duration} weeks) is recorded. Send{' '}
          <strong>{formatPKR(application.fee_pkr)}</strong> to the JazzCash / Easypaisa account shown on the
          payment page, then submit your transaction ID and screenshot.{' '}
          <Link href="/dashboard/payment" className="font-semibold underline">Go to payment</Link>
        </Alert>
      )}

      {stage === 'awaiting_verification' && (
        <Alert tone="info" title="Payment under verification">
          Every payment is checked by hand — it is never verified automatically. Once it clears, your
          internship activates, your offer letter is issued and week 1 unlocks.
        </Alert>
      )}

      {stage === 'payment_problem' && payment && (
        <Alert tone="bad" title={`Payment ${payment.status.replace(/_/g, ' ')}`}>
          {payment.admin_note ?? 'Check your payment details and submit again.'}{' '}
          <Link href="/dashboard/payment" className="font-semibold underline">Open payment page</Link>
        </Alert>
      )}

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Internship status"
                  value={internship ? internship.status.replace(/^\w/, (c: string) => c.toUpperCase()) : 'Not started'}
                  tone={internship?.status === 'active' ? 'good' : 'neutral'} />
        <StatCard label="Selected field" value={field ?? '—'} />
        <StatCard label="Duration" value={internship ? `${internship.duration} weeks` : application ? `${application.duration} weeks` : '—'} />
        <StatCard label="Current week"
                  value={internship?.current_week ? `Week ${internship.current_week}` : '—'}
                  hint={activeWeek ? activeWeek.title : undefined} />
        <StatCard label="Start date" value={internship?.start_date ? shortDate(internship.start_date) : '—'} />
        <StatCard label="End date" value={internship?.end_date ? shortDate(internship.end_date) : '—'} />
        <StatCard label="Tasks completed" value={`${progress.approved} / ${progress.total || '—'}`} tone="good" />
        <StatCard label="Tasks pending" value={progress.pending} tone={progress.pending ? 'warn' : 'neutral'} />
        <StatCard label="Overall score" value={internship ? Number(internship.overall_score ?? 0).toFixed(1) : '—'}
                  hint="70% weekly · 30% final project" />
        <StatCard label="Offer letter" value={docs?.offer ? 'Issued' : 'Pending'} tone={docs?.offer ? 'good' : 'neutral'} />
        <StatCard label="Certificate" value={docs?.certificate ? 'Issued' : 'Not yet issued'}
                  tone={docs?.certificate ? 'good' : 'neutral'} />
        <StatCard label="Reward status"
                  value={docs?.reward ? docs.reward.status.replace(/_/g, ' ') : 'Pending evaluation'}
                  tone={docs?.reward?.status === 'paid' ? 'good' : 'neutral'} />
      </div>

      {internship && (
        <Card className="p-5">
          <Progress value={progress.percent} label="Overall internship progress" />
          <div className="mt-5 flex flex-wrap gap-1.5">
            {weeks.map((w) => (
              <span key={w.id}
                    className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${
                      w.status === 'completed' ? 'bg-signal-light text-signal-dark'
                      : w.status === 'active' ? 'bg-ink text-white'
                      : 'bg-mist text-slate-light'}`}>
                {w.status === 'completed' ? '✓ ' : w.status === 'locked' ? '🔒 ' : '● '}
                {w.is_final ? 'Final project' : `Week ${w.week_number}`}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* TODAY'S STATUS */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Today&rsquo;s status</h2>
          {internship && clock ? (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Row label="Date" value={longDate()} />
                <Row label="Internship" value={field ?? '—'} />
                <Row label="Week" value={activeWeek ? `${activeWeek.week_number}${activeWeek.is_final ? ' (final)' : ''}` : '—'} />
                <Row label="Day" value={`${Math.min(clock.day, clock.totalDays)}`} />
                <Row label="Status" value={<StatusBadge status={internship.status} />} />
                <Row label="Tasks available" value={tasks.filter((t) => ['available', 'in_progress', 'revision_required'].includes(t.status)).length} />
              </dl>

              <h3 className="mt-7 text-[13px] font-semibold text-slate-light">Nearest deadlines</h3>
              {dueSoon.length ? (
                <ul className="mt-2 divide-y divide-mist">
                  {dueSoon.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                      <Link href={`/dashboard/tasks/${t.id}`} className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-ink">{t.title}</p>
                        <p className="font-mono text-[12px] text-slate-light">{t.task_code}</p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] ${isOverdue(t.deadline) ? 'font-semibold text-danger' : 'text-slate'}`}>
                          {shortDate(t.deadline)}
                        </span>
                        <StatusBadge status={isOverdue(t.deadline) && t.status !== 'approved' ? 'overdue' : t.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[14px] text-slate-light">Nothing outstanding right now.</p>
              )}
            </>
          ) : (
            <p className="mt-3 text-[14px] text-slate-light">
              Your daily status appears here once an admin verifies your payment and activates the internship.
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Notifications</h2>
              <Link href="/dashboard/notifications" className="text-[13px] font-semibold text-signal">All</Link>
            </div>
            {recent?.length ? (
              <ul className="mt-3 space-y-3">
                {recent.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link ?? '/dashboard/notifications'} className="block">
                      <p className="text-[13.5px] font-semibold text-ink">
                        {!n.is_read && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />}
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-light">{n.message}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-slate-light">Nothing yet.</p>
            )}
          </Card>

          {internship && (
            <Card className="p-5">
              <h2 className="font-display text-lg font-bold">Reward tier</h2>
              <p className="mt-1 text-[13px] text-slate-light">
                {internship.duration}-week group · subject to eligibility and final evaluation.
              </p>
              <ul className="mt-3 space-y-2 text-[14px]">
                {PLANS[internship.duration as Duration].rewards.map((r) => (
                  <li key={r.position} className="flex justify-between">
                    <span className="text-slate">Position {r.position}</span>
                    <span className="font-semibold text-ink">{r.label}</span>
                  </li>
                ))}
              </ul>
              <Button href="/dashboard/rewards" variant="secondary" size="sm" className="mt-4">My reward status</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold text-slate-light">{label}</dt>
      <dd className="mt-0.5 text-[14.5px] font-semibold text-ink">{value}</dd>
    </div>
  );
}
