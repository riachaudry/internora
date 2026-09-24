import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState, Button, Table } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Row = {
  id: string; attempt: number; status: string; submitted_at: string;
  url: string | null; file_url: string | null; file_name: string | null;
  score: number | null; feedback: string | null; reviewed_at: string | null;
  internship_tasks: { id: string; task_code: string; title: string; points: number } | null;
};

export default async function SubmissionsPage() {
  const profile = await requireStudent();
  const { data } = await createClient()
    .from('submissions')
    .select('id, attempt, status, submitted_at, url, file_url, file_name, score, feedback, reviewed_at, internship_tasks(id, task_code, title, points)')
    .eq('student_id', profile.id)
    .order('submitted_at', { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  if (!rows.length) {
    return (
      <div className="space-y-5">
        <SectionHead title="Submissions" />
        <EmptyState
          title="Nothing submitted yet"
          body="Every task you submit appears here with its attempt number, status and reviewer decision. Nothing is auto-approved — a reviewer reads each one."
          action={<Button href="/dashboard/tasks">Open my tasks</Button>}
        />
      </div>
    );
  }

  const counts = {
    total: rows.length,
    approved: rows.filter((r) => r.status === 'approved').length,
    pending: rows.filter((r) => ['submitted', 'under_review'].includes(r.status)).length,
    revision: rows.filter((r) => ['revision_requested', 'rejected'].includes(r.status)).length,
  };

  return (
    <div className="space-y-6">
      <SectionHead title="Submissions"
                   body="A full history of what you sent, when you sent it, and what the reviewer decided." />

      <div className="grid gap-3 sm:grid-cols-4">
        {([['Total', counts.total], ['Approved', counts.approved],
           ['Awaiting review', counts.pending], ['Needs rework', counts.revision]] as const).map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table head={['Task', 'Attempt', 'Submitted', 'Work', 'Score', 'Status']}>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-mist align-top">
              <td className="px-4 py-3">
                {r.internship_tasks ? (
                  <Link href={`/dashboard/tasks/${r.internship_tasks.id}`}
                        className="font-semibold text-ink underline decoration-mist-deep underline-offset-4 hover:decoration-signal">
                    {r.internship_tasks.title}
                  </Link>
                ) : <span className="text-slate-light">Task removed</span>}
                <p className="mt-0.5 font-mono text-[11.5px] text-slate-light">{r.internship_tasks?.task_code ?? '—'}</p>
              </td>
              <td className="px-4 py-3 text-[13.5px] text-slate">#{r.attempt}</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{shortDate(r.submitted_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-[12.5px]">
                  {r.url && <a className="text-signal underline underline-offset-2" href={r.url} target="_blank" rel="noreferrer noopener">Link</a>}
                  {r.file_url && <a className="text-signal underline underline-offset-2" href={r.file_url} target="_blank" rel="noreferrer noopener">{r.file_name ?? 'File'}</a>}
                  {!r.url && !r.file_url && <span className="text-slate-light">Text only</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-[13.5px] font-semibold text-ink">
                {r.score === null ? <span className="font-normal text-slate-light">—</span>
                  : `${r.score}/${r.internship_tasks?.points ?? '—'}`}
              </td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>

      <p className="text-[13px] text-slate-light">
        Reviewer notes for each decision are collected on the <Link className="text-signal underline underline-offset-2" href="/dashboard/feedback">Feedback</Link> page.
      </p>
    </div>
  );
}
