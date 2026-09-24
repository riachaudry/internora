import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Table, StatusBadge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const TABS = ['active', 'under_review', 'overdue', 'approved', 'all'] as const;

/** Live task instances across every internship (not the roadmap template). */
export default async function AdminTasksPage({ searchParams }: { searchParams: { tab?: string; q?: string } }) {
  await requireAdmin();
  const tab = (TABS.includes(searchParams.tab as any) ? searchParams.tab : 'active') as typeof TABS[number];
  const q = (searchParams.q ?? '').trim();
  const db = createAdminClient();

  let query = db.from('internship_tasks')
    .select(`id, task_code, title, points, is_required, unlock_date, deadline, status, score,
             internship_weeks(week_number, is_final),
             internships(duration, profiles!internships_student_id_fkey(full_name, student_id))`)
    .order('deadline').limit(200);

  if (tab === 'active') query = query.in('status', ['available', 'in_progress', 'revision_required']);
  else if (tab !== 'all') query = query.eq('status', tab);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data: tasks } = await query;

  return (
    <div className="space-y-5">
      <SectionHead title="Tasks"
                   body="Every live task instance generated for a student, with its real unlock date and deadline." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t} href={`/admin/tasks?tab=${t}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               tab === t ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {t.replace(/_/g, ' ')}
          </a>
        ))}
      </div>

      {tasks?.length ? (
        <Table head={['Task', 'Student', 'Week', 'Unlocks', 'Deadline', 'Score', 'Status']}>
          {tasks.map((t) => {
            const week = (t as any).internship_weeks;
            const student = (t as any).internships?.profiles;
            return (
              <tr key={t.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <p className="font-mono text-[12px] text-slate-light">{t.task_code} · {t.points} pts</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate">{student?.full_name ?? '—'}</p>
                  <p className="font-mono text-[12px] text-slate-light">{student?.student_id}</p>
                </td>
                <td className="px-4 py-3 text-slate">{week?.is_final ? 'Final' : `W${week?.week_number}`}</td>
                <td className="px-4 py-3 text-slate">{shortDate(t.unlock_date)}</td>
                <td className="px-4 py-3 text-slate">{shortDate(t.deadline)}</td>
                <td className="px-4 py-3 font-semibold text-ink">{t.score ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            );
          })}
        </Table>
      ) : <EmptyState title="No tasks" body="Nothing matches this filter." />}
    </div>
  );
}
