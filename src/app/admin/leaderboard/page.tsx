import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DURATIONS, PLANS, type Duration } from '@/lib/brand';
import { Avatar } from '@/components/portal/Avatar';
import { SectionHead, Table, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage({ searchParams }: { searchParams: { duration?: string } }) {
  await requireAdmin();
  const duration = (DURATIONS.includes(Number(searchParams.duration) as Duration)
    ? Number(searchParams.duration) : 4) as Duration;

  const { data: rows } = await createAdminClient().from('leaderboard_view')
    .select('*').eq('duration', duration).order('overall_score', { ascending: false }).limit(100);

  return (
    <div className="space-y-5">
      <SectionHead title="Leaderboard"
                   body="Rankings drive reward assignment. Confirm these before assigning rewards on the Rewards page." />

      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <a key={d} href={`/admin/leaderboard?duration=${d}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               duration === d ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {d} weeks
          </a>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">Reward tier for this group</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {PLANS[duration].rewards.map((r) => (
            <li key={r.position} className="rounded-xl bg-mist/70 p-3.5">
              <p className="text-[12px] font-semibold text-slate-light">Position {r.position}</p>
              <p className="mt-0.5 font-display text-[16px] font-bold text-ink">{r.label}</p>
            </li>
          ))}
        </ul>
      </Card>

      {rows?.length ? (
        <Table head={['Rank', 'Student', 'Field', 'Status', 'Overall score']}>
          {rows.map((r: any) => (
            <tr key={r.internship_id}>
              <td className="px-4 py-3">
                <span className={`font-display text-[15px] font-extrabold ${Number(r.duration_rank) <= 3 ? 'text-signal' : 'text-ink'}`}>
                  #{r.duration_rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar url={r.avatar_url} name={r.full_name} size={30} />
                  <div>
                    <p className="font-semibold text-ink">{r.full_name}</p>
                    <p className="font-mono text-[12px] text-slate-light">{r.student_code}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate">{r.field_name}</td>
              <td className="px-4 py-3"><Badge tone={r.status === 'completed' ? 'good' : 'info'}>{r.status}</Badge></td>
              <td className="px-4 py-3 font-display font-bold text-ink">{Number(r.overall_score ?? 0).toFixed(1)}</td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState title="No ranked interns" body="Rankings appear once internships are active and scored." />}
    </div>
  );
}
