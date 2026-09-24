import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { PLANS, formatPKR, BRAND, type Duration } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, Alert, Button, Table } from '@/components/ui';

export const dynamic = 'force-dynamic';

const ORDINAL = ['', '1st', '2nd', '3rd'];

export default async function RewardsPage() {
  const profile = await requireStudent();
  const { internship, docs } = await loadStudentState(profile.id);
  const duration = (internship?.duration ?? 4) as Duration;
  const plan = PLANS[duration];
  const reward = docs?.reward;

  return (
    <div className="space-y-6">
      <SectionHead
        title="Performance Rewards"
        body="Discretionary recognition for the strongest performers in each track. Rewards are reviewed and approved by an admin after the internship completes."
      />

      <Alert tone="warn" title="Please read this carefully">
        <p className="mt-1">
          Performance Rewards are not a salary, stipend or guaranteed income, and Internora does not promise
          employment. Eligibility depends on completing the programme and on final scores as judged by reviewers.
        </p>
      </Alert>

      {reward ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Your award</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                {ORDINAL[reward.position ?? 0] || '—'} position · {duration}-week track
              </h2>
              <p className="mt-1.5 text-[14px] text-slate">
                {reward.amount_pkr > 0 ? formatPKR(reward.amount_pkr) : 'Recommendation letter'}
                {reward.includes_lor && reward.amount_pkr > 0 ? ' + recommendation letter' : ''}
              </p>
            </div>
            <StatusBadge status={reward.status} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Paid on</p>
              <p className="mt-1 text-[14px] font-semibold text-ink">
                {reward.payment_date ? shortDate(reward.payment_date) : 'Not yet processed'}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Method</p>
              <p className="mt-1 text-[14px] font-semibold text-ink">{reward.payment_method ?? '—'}</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Reference</p>
              <p className="mt-1 font-mono text-[13px] font-semibold text-ink">{reward.payment_reference ?? '—'}</p>
            </div>
          </div>

          {reward.notes && (
            <p className="mt-4 rounded-xl border border-mist-deep bg-mist/40 p-4 text-[14px] text-slate">{reward.notes}</p>
          )}

          {reward.status === 'pending' && (
            <p className="mt-4 text-[13.5px] text-slate-light">
              Payout details are confirmed over WhatsApp with {BRAND.hr.name} once the award is approved.
            </p>
          )}
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="font-display text-[15px] font-bold text-ink">No reward assigned yet</h2>
          <p className="prose-narrow mt-2 text-[14.5px]">
            Rewards are assigned after internships in a track are completed and final scores are recorded.
            Keep your submissions on time and your scores high — that is what the ranking is built from.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/dashboard/leaderboard">See the leaderboard</Button>
            <Button variant="ghost" href="/dashboard/progress">Check my score</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-mist px-5 py-4">
          <h2 className="font-display text-[15px] font-bold text-ink">{duration}-week track rewards</h2>
          <p className="mt-1 text-[13px] text-slate-light">Programme fee {formatPKR(plan.fee)}</p>
        </div>
        <Table head={['Position', 'Reward', 'Includes LOR']}>
          {plan.rewards.map((r, i) => (
            <tr key={r.position} className="border-t border-mist">
              <td className="px-4 py-3 text-[14px] font-semibold text-ink">{ORDINAL[i + 1]}</td>
              <td className="px-4 py-3 text-[14px] text-slate">{r.label}</td>
              <td className="px-4 py-3 text-[14px] text-slate">{r.lor ? 'Yes' : '—'}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
