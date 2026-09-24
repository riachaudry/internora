import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState, Progress } from '@/components/ui';
import { InternshipControls } from './InternshipControls';

export const dynamic = 'force-dynamic';

const TABS = ['active', 'completed', 'pending', 'terminated', 'all'] as const;

export default async function AdminInternshipsPage({ searchParams }: { searchParams: { tab?: string } }) {
  await requireAdmin();
  const tab = (TABS.includes(searchParams.tab as any) ? searchParams.tab : 'active') as typeof TABS[number];
  const db = createAdminClient();

  let query = db.from('internships')
    .select(`id, duration, status, start_date, end_date, current_week, weekly_score, final_project_score, overall_score, completed_at,
             internship_fields(name), profiles!internships_student_id_fkey(full_name, student_id, email)`)
    .order('created_at', { ascending: false }).limit(100);
  if (tab !== 'all') query = query.eq('status', tab);

  const { data: internships } = await query;
  const ids = (internships ?? []).map((i) => i.id);
  const { data: weeks } = ids.length
    ? await db.from('internship_weeks').select('internship_id, week_number, status, is_final').in('internship_id', ids)
    : { data: [] as any[] };

  return (
    <div className="space-y-5">
      <SectionHead title="Internships"
                   body="Every active program, its live week position and its scores. Use the controls to recompute scores, unlock a week manually, or close out a program." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t} href={`/admin/internships?tab=${t}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold capitalize ${
               tab === t ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>{t}</a>
        ))}
      </div>

      {internships?.length ? (
        <div className="space-y-4">
          {internships.map((i) => {
            const s = (i as any).profiles;
            const mine = (weeks ?? []).filter((w: any) => w.internship_id === i.id);
            const done = mine.filter((w: any) => w.status === 'completed').length;
            return (
              <Card key={i.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[17px] font-bold text-ink">{s?.full_name}</p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      <span className="font-mono">{s?.student_id}</span> ·{' '}
                      {(i as any).internship_fields?.name} · {i.duration} weeks
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-4">
                  <Item label="Start" value={i.start_date ? shortDate(i.start_date) : '—'} />
                  <Item label="End" value={i.end_date ? shortDate(i.end_date) : '—'} />
                  <Item label="Current week" value={i.current_week || '—'} />
                  <Item label="Weeks completed" value={`${done} / ${mine.length}`} />
                  <Item label="Weekly score" value={Number(i.weekly_score ?? 0).toFixed(1)} />
                  <Item label="Final project" value={Number(i.final_project_score ?? 0).toFixed(1)} />
                  <Item label="Overall" value={Number(i.overall_score ?? 0).toFixed(1)} />
                  <Item label="Completed" value={i.completed_at ? shortDate(i.completed_at) : '—'} />
                </dl>

                <div className="mt-4">
                  <Progress value={mine.length ? (done / mine.length) * 100 : 0} />
                </div>

                <InternshipControls internshipId={i.id} duration={i.duration} status={i.status} />
              </Card>
            );
          })}
        </div>
      ) : <EmptyState title="No internships" body="Nothing matches this filter." />}
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-[12px] font-semibold text-slate-light">{label}</dt>
    <dd className="mt-0.5 font-semibold text-ink">{value}</dd></div>;
}
