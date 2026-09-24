import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DURATIONS, WEEK_COMPLETION_THRESHOLD, type Duration } from '@/lib/brand';
import { SectionHead, Card, Badge, Alert, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminRoadmapsPage({ searchParams }: { searchParams: { field?: string; duration?: string } }) {
  await requireAdmin();
  const db = createAdminClient();

  const { data: fields } = await db.from('internship_fields')
    .select('id, slug, name').eq('is_active', true).order('sort_order');
  if (!fields?.length) {
    return <Alert tone="warn" title="No fields yet">Run <code>npm run seed:roadmaps</code> first.</Alert>;
  }

  const slug = searchParams.field ?? fields[0].slug;
  const field = fields.find((f) => f.slug === slug) ?? fields[0];
  const duration = (DURATIONS.includes(Number(searchParams.duration) as Duration)
    ? Number(searchParams.duration) : 8) as Duration;

  const { data: weeks } = await db.from('roadmap_weeks')
    .select('id, week_number, title, summary, objectives, is_final')
    .eq('field_id', field.id).eq('duration', duration).order('week_number');

  const ids = (weeks ?? []).map((w) => w.id);
  const { data: tasks } = ids.length
    ? await db.from('roadmap_tasks')
        .select('id, week_id, task_number, title, objective, deliverable, points, is_required, submission_type, deadline_offset_days')
        .in('week_id', ids).order('task_number')
    : { data: [] as any[] };

  return (
    <div className="space-y-5">
      <SectionHead title="Weekly roadmaps"
                   body={`The template every internship is generated from. A ${duration}-week program runs the first ${duration - 1} progression weeks plus the final project week. Each week unlocks at ${Math.round(WEEK_COMPLETION_THRESHOLD * 100)}% of the previous week's required points approved.`} />

      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <a key={f.id} href={`/admin/roadmaps?field=${f.slug}&duration=${duration}`}
             className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
               f.slug === field.slug ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {f.name}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <a key={d} href={`/admin/roadmaps?field=${field.slug}&duration=${d}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               duration === d ? 'bg-signal text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {d} weeks
          </a>
        ))}
      </div>

      {weeks?.length ? (
        <div className="space-y-4">
          {weeks.map((w) => {
            const wt = (tasks ?? []).filter((t: any) => t.week_id === w.id);
            const points = wt.reduce((s: number, t: any) => s + t.points, 0);
            return (
              <Card key={w.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">
                      {w.is_final ? 'Final project' : `Week ${w.week_number}`}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-ink">{w.title}</h2>
                    <p className="prose-narrow mt-1.5 text-[14px]">{w.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone="info">{wt.length} tasks</Badge>
                    <Badge>{points} points</Badge>
                  </div>
                </div>

                {!!w.objectives?.length && (
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {w.objectives.map((o: string) => (
                      <li key={o} className="text-[13.5px] text-slate">• {o}</li>
                    ))}
                  </ul>
                )}

                <ul className="mt-4 divide-y divide-mist border-t border-mist">
                  {wt.map((t: any) => (
                    <li key={t.id} className="py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold text-ink">{t.task_number}. {t.title}</p>
                        <p className="text-[12.5px] text-slate-light">
                          {t.points} pts · {t.is_required ? 'required' : 'optional'} ·
                          due +{t.deadline_offset_days}d · {t.submission_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <p className="mt-1 text-[13.5px] text-slate">{t.objective}</p>
                      <p className="mt-0.5 text-[13px] text-slate-light">Deliverable: {t.deliverable}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No roadmap published for this combination"
                    body="Run the roadmap seed script to publish all nine fields across the 4, 6 and 8 week durations." />
      )}
    </div>
  );
}
