import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState } from '@/lib/services/student';
import { PLANS, formatPKR, type Duration } from '@/lib/brand';
import { Avatar } from '@/components/portal/Avatar';
import { SectionHead, Card, Table, Badge, EmptyState, Alert } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Row = {
  internship_id: string; student_id: string; full_name: string; avatar_url: string | null;
  student_code: string | null; field_name: string; field_slug: string;
  duration: number; overall_score: number | null; status: string;
  field_rank: number; duration_rank: number;
};

export default async function LeaderboardPage() {
  const profile = await requireStudent();
  const { internship } = await loadStudentState(profile.id);
  const duration = (internship?.duration ?? 4) as Duration;

  const { data } = await createClient()
    .from('leaderboard_view')
    .select('*')
    .eq('duration', duration)
    .order('duration_rank')
    .limit(50);

  const rows = (data ?? []) as Row[];
  const mine = rows.find((r) => r.student_id === profile.id);
  const plan = PLANS[duration];

  return (
    <div className="space-y-6">
      <SectionHead
        title="Leaderboard"
        body={`Ranked by overall score within the ${duration}-week track. Rankings move as reviewers approve work, so this is a live standing, not a final result.`}
      />

      <Alert tone="info" title="How rewards relate to this ranking">
        <p className="mt-1">
          Performance Rewards for the {duration}-week track: 1st {formatPKR(plan.rewards[0].amount)},
          {' '}2nd {formatPKR(plan.rewards[1].amount)}, 3rd recommendation letter. Rewards are discretionary
          recognition for outstanding work, reviewed and approved by an admin — never guaranteed income.
        </p>
      </Alert>

      {mine && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-signal/40 bg-signal-light/40 p-5">
          <div className="flex items-center gap-3">
            <Avatar url={mine.avatar_url} name={mine.full_name} size={44} />
            <div>
              <p className="font-display text-[16px] font-bold text-ink">Your standing</p>
              <p className="text-[13px] text-slate-light">
                {mine.field_name} · rank {mine.field_rank} in your field
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold text-ink">#{mine.duration_rank}</p>
            <p className="text-[13px] text-slate-light">
              Score {mine.overall_score != null ? Number(mine.overall_score).toFixed(1) : '—'}
            </p>
          </div>
        </Card>
      )}

      {!rows.length ? (
        <EmptyState title="No ranked internships yet"
                    body="Once students in this track have scored work, the standings appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table head={['#', 'Student', 'Field', 'Score', 'Status']}>
            {rows.map((r) => {
              const isMe = r.student_id === profile.id;
              return (
                <tr key={r.internship_id} className={`border-t border-mist ${isMe ? 'bg-signal-light/30' : ''}`}>
                  <td className="px-4 py-3 font-display text-[15px] font-bold text-ink">{r.duration_rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar url={r.avatar_url} name={r.full_name} size={30} />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {r.full_name}{isMe && <span className="ml-2 text-[12px] font-bold text-signal">You</span>}
                        </p>
                        <p className="font-mono text-[11.5px] text-slate-light">{r.student_code ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13.5px] text-slate">{r.field_name}</td>
                  <td className="px-4 py-3 text-[14px] font-semibold text-ink">
                    {r.overall_score != null ? Number(r.overall_score).toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.status === 'completed' ? 'success' : 'neutral'}>{r.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}
