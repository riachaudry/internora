import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DURATIONS, PLANS, formatPKR, type Duration } from '@/lib/brand';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, Alert } from '@/components/ui';
import { RewardControls, AssignRewards } from './RewardControls';

export const dynamic = 'force-dynamic';

export default async function AdminRewardsPage({ searchParams }: { searchParams: { duration?: string } }) {
  await requireAdmin();
  const duration = (DURATIONS.includes(Number(searchParams.duration) as Duration)
    ? Number(searchParams.duration) : 4) as Duration;

  const { data: rewards } = await createAdminClient().from('rewards')
    .select(`id, position, amount_pkr, includes_lor, status, payment_date, payment_reference, payment_method, notes, duration,
             profiles!rewards_student_id_fkey(full_name, student_id),
             internships(internship_fields(name))`)
    .eq('duration', duration).order('position');

  return (
    <div className="space-y-6">
      <SectionHead title="Performance rewards"
                   body="Rewards are assigned from the confirmed leaderboard, then approved and marked paid by hand. Nothing is paid automatically." />

      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <a key={d} href={`/admin/rewards?duration=${d}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               duration === d ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {d} weeks
          </a>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">Tier for the {duration}-week group</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {PLANS[duration].rewards.map((r) => (
            <li key={r.position} className="rounded-xl bg-mist/70 p-3.5">
              <p className="text-[12px] font-semibold text-slate-light">Position {r.position}</p>
              <p className="mt-0.5 font-display text-[16px] font-bold text-ink">{r.label}</p>
            </li>
          ))}
        </ul>
        <AssignRewards duration={duration} />
      </Card>

      {rewards?.length ? (
        <div className="space-y-3">
          {rewards.map((r) => {
            const s = (r as any).profiles;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink">
                      #{r.position} · {s?.full_name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      <span className="font-mono">{s?.student_id}</span> ·{' '}
                      {(r as any).internships?.internship_fields?.name} ·{' '}
                      {r.amount_pkr ? formatPKR(r.amount_pkr) : 'LOR only'}
                      {r.includes_lor && ' + LOR'}
                    </p>
                    {r.payment_date && (
                      <p className="mt-1 text-[12.5px] text-slate-light">
                        Paid {shortDate(r.payment_date)}
                        {r.payment_reference && ` · ref ${r.payment_reference}`}
                        {r.payment_method && ` · ${r.payment_method}`}
                      </p>
                    )}
                    {r.notes && <p className="mt-1 text-[12.5px] text-slate-light">{r.notes}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <RewardControls rewardId={r.id} status={r.status} />
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert tone="info">
          No rewards assigned for this group yet. Confirm the leaderboard, then assign the top three above.
        </Alert>
      )}
    </div>
  );
}
