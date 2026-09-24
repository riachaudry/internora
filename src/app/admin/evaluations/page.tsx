import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SCORE_WEIGHTS } from '@/lib/brand';
import { SectionHead, Table, EmptyState, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminEvaluationsPage() {
  await requireAdmin();
  const db = createAdminClient();

  const { data: evaluations } = await db.from('evaluations')
    .select(`id, weekly_score, final_project_score, overall_score, remarks, evaluated_at,
             internships(duration, internship_fields(name), profiles!internships_student_id_fkey(full_name, student_id))`)
    .order('evaluated_at', { ascending: false }).limit(100);

  return (
    <div className="space-y-5">
      <SectionHead title="Evaluations"
                   body={`Recorded final evaluations. Weekly work is weighted ${SCORE_WEIGHTS.weekly * 100}% and the final project ${SCORE_WEIGHTS.finalProject * 100}%. Record a new one from the Internships page.`} />

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">How the score is built</h2>
        <ul className="mt-3 space-y-1.5 text-[14px] text-slate">
          <li>• Each task is scored 0-100 by the reviewer and weighted by its own point value.</li>
          <li>• Weekly tasks and final-project tasks are aggregated separately.</li>
          <li>• Overall = weekly × 0.7 + final project × 0.3, recomputed on every review.</li>
        </ul>
      </Card>

      {evaluations?.length ? (
        <Table head={['Student', 'Field', 'Weekly', 'Final project', 'Overall', 'Recorded']}>
          {evaluations.map((e) => {
            const i = (e as any).internships;
            const s = i?.profiles;
            return (
              <tr key={e.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{s?.full_name}</p>
                  <p className="font-mono text-[12px] text-slate-light">{s?.student_id}</p>
                </td>
                <td className="px-4 py-3 text-slate">{i?.internship_fields?.name} · {i?.duration}w</td>
                <td className="px-4 py-3 text-slate">{Number(e.weekly_score).toFixed(1)}</td>
                <td className="px-4 py-3 text-slate">{Number(e.final_project_score).toFixed(1)}</td>
                <td className="px-4 py-3 font-display font-bold text-ink">{Number(e.overall_score).toFixed(1)}</td>
                <td className="px-4 py-3 text-slate">{shortDate(e.evaluated_at)}</td>
              </tr>
            );
          })}
        </Table>
      ) : <EmptyState title="No evaluations recorded yet"
                      body="Record one from the Internships page once a student's work has been reviewed." />}
    </div>
  );
}
