import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { completeInternship, recomputeScores, unlockNextWeek } from '@/lib/services/internship';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  action: z.enum(['recompute', 'complete', 'terminate', 'reactivate', 'unlock_week', 'record_evaluation']),
  week_number: z.number().int().min(1).max(8).optional(),
  remarks: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { action, week_number, remarks } = parsed.data;

    const db = createAdminClient();
    const { data: internship } = await db.from('internships')
      .select('id, student_id, status').eq('id', params.id).single();
    if (!internship) return fail(new Error('Internship not found.'));

    if (action === 'recompute') {
      const scores = await recomputeScores(internship.id);
      await audit(admin.id, 'internship.recompute', 'internship', internship.id);
      return ok({ scores });
    }

    if (action === 'complete') {
      const result = await completeInternship(internship.id);
      await audit(admin.id, 'internship.complete', 'internship', internship.id);
      return ok(result);
    }

    if (action === 'unlock_week') {
      if (!week_number) return fail(new Error('Choose a week to unlock.'));
      await unlockNextWeek(internship.id, week_number - 1);
      await audit(admin.id, 'internship.unlock_week', 'internship', internship.id, { week_number });
      return ok();
    }

    if (action === 'record_evaluation') {
      const scores = await recomputeScores(internship.id);
      if (!scores) return fail(new Error('No tasks found to evaluate.'));
      const { error } = await db.from('evaluations').insert({
        internship_id: internship.id,
        weekly_score: scores.weeklyScore,
        final_project_score: scores.finalProjectScore,
        overall_score: scores.overallScore,
        remarks: remarks ?? null,
        evaluated_by: admin.id,
      });
      if (error) return fail(new Error(error.message));
      await audit(admin.id, 'internship.evaluate', 'internship', internship.id);
      return ok({ scores });
    }

    const status = action === 'terminate' ? 'terminated' : 'active';
    await db.from('internships').update({ status }).eq('id', internship.id);
    await notify(internship.student_id, 'internship_activated',
      action === 'terminate'
        ? `Your internship has been terminated.${remarks ? ` ${remarks}` : ''}`
        : 'Your internship has been reactivated.',
      '/dashboard');
    await audit(admin.id, `internship.${action}`, 'internship', internship.id, { remarks });
    return ok();
  } catch (e) { return fail(e); }
}
