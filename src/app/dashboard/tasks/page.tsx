import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { shortDate, isOverdue } from '@/lib/dates';
import { SectionHead, Table, StatusBadge, EmptyState, Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function TasksPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const profile = await requireStudent();
  const { tasks, weeks } = await loadStudentState(profile.id);

  const q = (searchParams.q ?? '').toLowerCase().trim();
  const filtered = tasks.filter((t) => {
    if (searchParams.status && t.status !== searchParams.status) return false;
    if (!q) return true;
    return `${t.title} ${t.task_code} ${t.objective}`.toLowerCase().includes(q);
  });

  if (!tasks.length) {
    return (
      <EmptyState title="No tasks yet"
                  body="Tasks are generated from your field's roadmap the moment your internship is activated."
                  action={<Button href="/dashboard">Back to dashboard</Button>} />
    );
  }

  const filters = ['available', 'in_progress', 'under_review', 'revision_required', 'approved'];

  return (
    <div className="space-y-5">
      <SectionHead title="Tasks" body="Every task in your program, with its live status, points and deadline." />

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/tasks"
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${!searchParams.status ? 'bg-ink text-white' : 'bg-white text-slate border border-mist-deep'}`}>
          All ({tasks.length})
        </Link>
        {filters.map((s) => {
          const n = tasks.filter((t) => t.status === s).length;
          return (
            <Link key={s} href={`/dashboard/tasks?status=${s}`}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${searchParams.status === s ? 'bg-ink text-white' : 'bg-white text-slate border border-mist-deep'}`}>
              {s.replace(/_/g, ' ')} ({n})
            </Link>
          );
        })}
      </div>

      <Table head={['Task', 'Week', 'Points', 'Deadline', 'Status', '']}>
        {filtered.map((t) => {
          const week = weeks.find((w) => w.id === t.week_id);
          return (
            <tr key={t.id} className="align-middle">
              <td className="px-4 py-3">
                <p className="font-semibold text-ink">{t.title}</p>
                <p className="font-mono text-[12px] text-slate-light">{t.task_code}</p>
              </td>
              <td className="px-4 py-3 text-slate">{week?.is_final ? 'Final' : `Week ${week?.week_number ?? '—'}`}</td>
              <td className="px-4 py-3 text-slate">{t.points}{t.score != null && ` · scored ${t.score}`}</td>
              <td className={`px-4 py-3 ${isOverdue(t.deadline) && t.status !== 'approved' ? 'font-semibold text-danger' : 'text-slate'}`}>
                {shortDate(t.deadline)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={isOverdue(t.deadline) && !['approved', 'under_review'].includes(t.status) ? 'overdue' : t.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/dashboard/tasks/${t.id}`} className="text-[13px] font-semibold text-signal">Open</Link>
              </td>
            </tr>
          );
        })}
        {!filtered.length && (
          <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-light">Nothing matches that filter.</td></tr>
        )}
      </Table>
    </div>
  );
}
