import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { createClient } from '@/lib/supabase/server';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState, Button, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

/**
 * "Projects" is the deliverable view of the internship: the final project plus
 * every task whose deliverable is a shippable artefact (repo, live link, file).
 */
export default async function ProjectsPage() {
  const profile = await requireStudent();
  const { internship, weeks, tasks } = await loadStudentState(profile.id);

  if (!internship) {
    return (
      <EmptyState title="No projects yet"
                  body="Your build work, including the final project, is collected here once your internship starts."
                  action={<Button href="/dashboard/apply">Start an application</Button>} />
    );
  }

  const { data: subs } = await createClient()
    .from('submissions')
    .select('task_id, url, file_url, file_name, status, submitted_at, score')
    .eq('student_id', profile.id)
    .order('submitted_at', { ascending: false });

  const latest = new Map<string, NonNullable<typeof subs>[number]>();
  for (const s of subs ?? []) if (!latest.has(s.task_id)) latest.set(s.task_id, s);

  const finalWeek = weeks.find((w) => w.is_final);
  const finalTasks = tasks.filter((t) => t.week_id === finalWeek?.id);
  const buildTasks = tasks.filter(
    (t) => t.week_id !== finalWeek?.id && ['link', 'file', 'repo', 'both'].includes(t.submission_type),
  );

  const renderTask = (t: (typeof tasks)[number]) => {
    const sub = latest.get(t.id);
    return (
      <Card key={t.id} className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11.5px] text-slate-light">{t.task_code}</span>
              <StatusBadge status={t.status} />
              {!t.is_required && <Badge>Optional</Badge>}
            </div>
            <h3 className="mt-1.5 font-display text-[16px] font-bold text-ink">{t.title}</h3>
            <p className="prose-narrow mt-1.5 text-[14px]">{t.deliverable}</p>
          </div>
          <div className="text-right text-[12.5px] text-slate-light">
            <p>{t.points} pts</p>
            {sub && <p className="mt-1">Sent {shortDate(sub.submitted_at)}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
          {sub?.url && <a className="text-signal underline underline-offset-2" href={sub.url} target="_blank" rel="noreferrer noopener">Open submitted link</a>}
          {sub?.file_url && <a className="text-signal underline underline-offset-2" href={sub.file_url} target="_blank" rel="noreferrer noopener">{sub.file_name ?? 'Download file'}</a>}
          <Link className="font-semibold text-ink underline decoration-mist-deep underline-offset-4 hover:decoration-signal"
                href={`/dashboard/tasks/${t.id}`}>
            {sub ? 'View task' : 'Start this task'}
          </Link>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHead title="Projects"
                   body="Everything you actually build during the internship, in one place — useful when you write your CV or show work to an employer." />

      {finalWeek && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Final project</h2>
            <StatusBadge status={finalWeek.status} />
          </div>
          <p className="prose-narrow text-[14.5px]">{finalWeek.summary}</p>
          {finalTasks.length ? finalTasks.map(renderTask) : (
            <Card className="p-5 text-[14px] text-slate-light">
              The final project unlocks after your earlier weeks are complete.
            </Card>
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">Weekly build work</h2>
        {buildTasks.length ? buildTasks.map(renderTask) : (
          <Card className="p-5 text-[14px] text-slate-light">No build tasks are unlocked yet.</Card>
        )}
      </section>
    </div>
  );
}
