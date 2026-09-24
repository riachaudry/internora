import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SCORE_WEIGHTS } from '@/lib/brand';
import { round2 } from '@/lib/scoring';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  internship_id: z.string().uuid(),
  weekly_score: z.number().min(0).max(100),
  final_project_score: z.number().min(0).max(100),
  remarks: z.string().max(2000).optional(),
});

/**
 * Records the final evaluation. The overall score is computed here from the
 * published weights so the number on a certificate can never be hand-typed.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { internship_id, weekly_score, final_project_score, remarks } = parsed.data;

    const overall = round2(
      weekly_score * SCORE_WEIGHTS.weekly + final_project_score * SCORE_WEIGHTS.finalProject,
    );

    const db = createAdminClient();
    const { data: internship } = await db.from('internships')
      .select('id, student_id').eq('id', internship_id).maybeSingle();
    if (!internship) return fail(new Error('Internship not found.'));

    const { error } = await db.from('evaluations').insert({
      internship_id, weekly_score, final_project_score,
      overall_score: overall, remarks: remarks ?? null, evaluated_by: admin.id,
    });
    if (error) return fail(new Error(error.message));

    await db.from('internships').update({
      weekly_score, final_project_score, overall_score: overall,
    }).eq('id', internship_id);

    await notify(internship.student_id, 'internship_completed',
      `Your final evaluation is recorded. Overall score: ${overall}/100.`, '/dashboard/feedback');
    await audit(admin.id, 'evaluation.record', 'internship', internship_id, { overall });

    return ok({ overall });
  } catch (e) { return fail(e); }
}
