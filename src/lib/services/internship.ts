import 'server-only';
import { addDays } from 'date-fns';
import { createAdminClient } from '../supabase/admin';
import { isoDate, weekWindows, internshipEndDate, shortDate } from '../dates';
import { taskCode } from '../ids';
import { computeScores, isWeekComplete } from '../scoring';
import { notify } from '../notifications';
import { sendEmail } from '../email';
import { audit } from '../audit';
import { PLANS, type Duration } from '../brand';

/**
 * Activates an internship after an admin verifies payment.
 *
 * Builds every week window and every task row from the stored roadmap, so the
 * timeline is real data rather than anything computed in the browser. Dates are
 * derived from the chosen start date — nothing here is hard-coded.
 */
export async function activateInternship(opts: {
  applicationId: string;
  startDate: Date | string;   // admin picks "today" or a scheduled date
  adminId: string;
}) {
  const db = createAdminClient();
  const { applicationId, startDate, adminId } = opts;

  const { data: app, error: appErr } = await db
    .from('applications')
    .select('id, student_id, field_id, duration, status, profiles!applications_student_id_fkey(full_name,email), internship_fields(name, slug)')
    .eq('id', applicationId)
    .single();
  if (appErr || !app) throw new Error('Application not found.');

  const { data: payment } = await db
    .from('payments').select('status').eq('application_id', applicationId)
    .order('created_at', { ascending: false }).limit(1).single();
  if (payment?.status !== 'verified') throw new Error('Payment must be verified before activation.');

  const { data: existing } = await db.from('internships').select('id').eq('application_id', applicationId).maybeSingle();
  if (existing) return { internshipId: existing.id, alreadyActive: true };

  const duration = app.duration as Duration;
  const start = new Date(startDate);
  const end = internshipEndDate(start, duration);

  const { data: internship, error: intErr } = await db.from('internships').insert({
    application_id: applicationId,
    student_id: app.student_id,
    field_id: app.field_id,
    duration,
    status: 'active',
    start_date: isoDate(start),
    end_date: isoDate(end),
    current_week: 1,
  }).select('id').single();
  if (intErr || !internship) throw new Error(intErr?.message ?? 'Could not create the internship.');

  await buildWeeksAndTasks(internship.id, app.field_id, duration, start);

  await db.from('applications').update({
    status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId,
  }).eq('id', applicationId);

  const offer = await issueOfferLetter(internship.id);

  const field = (app as any).internship_fields?.name ?? 'your field';
  const student = (app as any).profiles;

  await notify(app.student_id, 'internship_activated',
    `Your ${duration}-week ${field} internship runs from ${shortDate(start)} to ${shortDate(end)}. Week 1 is open.`,
    '/dashboard/roadmap');
  await notify(app.student_id, 'offer_letter_issued',
    `Offer letter ${offer.publicId} has been issued.`, '/dashboard/offer-letter');

  if (student?.email) {
    await sendEmail(student.email, 'payment_verified', {
      name: student.full_name, startDate: shortDate(start), endDate: shortDate(end),
    });
    await sendEmail(student.email, 'offer_letter', {
      name: student.full_name, offerId: offer.publicId, field, duration,
    });
  }

  await audit(adminId, 'internship.activate', 'internship', internship.id, { duration, start: isoDate(start) });
  return { internshipId: internship.id, offerLetterId: offer.publicId, alreadyActive: false };
}

/** Copies roadmap templates into per-student week and task rows with real dates. */
async function buildWeeksAndTasks(internshipId: string, fieldId: string, duration: Duration, start: Date) {
  const db = createAdminClient();

  const { data: templateWeeks, error } = await db
    .from('roadmap_weeks')
    .select('id, week_number, title, summary, objectives, is_final, roadmap_tasks(*)')
    .eq('field_id', fieldId).eq('duration', duration)
    .order('week_number');
  if (error || !templateWeeks?.length) throw new Error('No roadmap found for this field and duration. Run the roadmap seed.');

  const windows = weekWindows(start, duration);

  for (const tw of templateWeeks as any[]) {
    const win = windows[tw.week_number - 1];
    const isFirst = tw.week_number === 1;

    const { data: week } = await db.from('internship_weeks').insert({
      internship_id: internshipId,
      week_number: tw.week_number,
      title: tw.title,
      summary: tw.summary,
      objectives: tw.objectives,
      is_final: tw.is_final,
      start_date: isoDate(win.startDate),
      end_date: isoDate(win.endDate),
      status: isFirst ? 'active' : 'locked',
      unlocked_at: isFirst ? new Date().toISOString() : null,
    }).select('id').single();
    if (!week) continue;

    const tasks = (tw.roadmap_tasks ?? []).sort((a: any, b: any) => a.task_number - b.task_number);
    if (!tasks.length) continue;

    await db.from('internship_tasks').insert(tasks.map((rt: any) => ({
      internship_id: internshipId,
      week_id: week.id,
      roadmap_task_id: rt.id,
      task_code: taskCode(tw.week_number, rt.task_number),
      task_number: rt.task_number,
      title: rt.title,
      description: rt.description,
      instructions: rt.instructions,
      objective: rt.objective,
      deliverable: rt.deliverable,
      points: rt.points,
      is_required: rt.is_required,
      submission_type: rt.submission_type,
      allowed_file_types: rt.allowed_file_types,
      unlock_date: isoDate(win.startDate),
      deadline: isoDate(addDays(win.startDate, Math.min(rt.deadline_offset_days ?? 7, 6))),
      status: isFirst ? 'available' : 'locked',
    })));
  }
}

export async function issueOfferLetter(internshipId: string) {
  const db = createAdminClient();
  const { data: existing } = await db.from('offer_letters').select('public_id').eq('internship_id', internshipId).maybeSingle();
  if (existing) return { publicId: existing.public_id };

  const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-OL', p_scope: 'offer_letter' });
  const { data, error } = await db.from('offer_letters')
    .insert({ internship_id: internshipId, public_id: pid as unknown as string })
    .select('public_id').single();
  if (error) throw new Error(error.message);
  return { publicId: data.public_id };
}

/**
 * Called after an admin reviews a submission. Enforces progression server-side:
 * a week only completes when enough required task points are approved, and the
 * next week only unlocks after that.
 */
export async function evaluateWeekProgress(internshipId: string, weekId: string) {
  const db = createAdminClient();

  const { data: tasks } = await db.from('internship_tasks')
    .select('points, is_required, status').eq('week_id', weekId);
  if (!tasks?.length) return { completed: false };
  if (!isWeekComplete(tasks as any)) return { completed: false };

  const { data: week } = await db.from('internship_weeks')
    .select('id, week_number, status, internship_id').eq('id', weekId).single();
  if (!week || week.status === 'completed') return { completed: false };

  await db.from('internship_weeks')
    .update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', weekId);

  const { data: internship } = await db.from('internships')
    .select('id, student_id, duration, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();

  await notify(internship!.student_id, 'week_completed', `Week ${week.week_number} is complete.`, '/dashboard/roadmap');

  const next = await unlockNextWeek(internshipId, week.week_number);
  if (!next) await completeInternship(internshipId);

  await recomputeScores(internshipId);
  return { completed: true, unlockedWeek: next?.week_number ?? null };
}

export async function unlockNextWeek(internshipId: string, afterWeek: number) {
  const db = createAdminClient();
  const { data: next } = await db.from('internship_weeks')
    .select('id, week_number, title, is_final, end_date')
    .eq('internship_id', internshipId).eq('week_number', afterWeek + 1).maybeSingle();
  if (!next) return null;

  await db.from('internship_weeks')
    .update({ status: 'active', unlocked_at: new Date().toISOString() }).eq('id', next.id);
  await db.from('internship_tasks')
    .update({ status: 'available' }).eq('week_id', next.id).eq('status', 'locked');
  await db.from('internships')
    .update({ current_week: next.week_number }).eq('id', internshipId);

  const { count } = await db.from('internship_tasks')
    .select('id', { count: 'exact', head: true }).eq('week_id', next.id);

  const { data: internship } = await db.from('internships')
    .select('student_id, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();

  await notify(internship!.student_id,
    next.is_final ? 'final_project_unlocked' : 'week_unlocked',
    next.is_final
      ? `Your final project is unlocked. Deadline ${shortDate(next.end_date)}.`
      : `Week ${next.week_number}: ${next.title} is now open.`,
    '/dashboard/roadmap');

  const student = (internship as any)?.profiles;
  if (student?.email) {
    await sendEmail(student.email, 'new_task', {
      name: student.full_name, week: next.week_number, title: next.title,
      taskCount: count ?? 0, deadline: shortDate(next.end_date),
    });
  }
  return next;
}

export async function recomputeScores(internshipId: string) {
  const db = createAdminClient();
  const { data: tasks } = await db.from('internship_tasks')
    .select('points, is_required, score, status, internship_weeks!inner(is_final)')
    .eq('internship_id', internshipId);
  if (!tasks) return null;

  const scored = (tasks as any[]).map((t) => ({
    points: t.points, is_required: t.is_required, score: t.score, status: t.status,
    is_final_week: t.internship_weeks?.is_final ?? false,
  }));
  const { weeklyScore, finalProjectScore, overallScore } = computeScores(scored);

  await db.from('internships').update({
    weekly_score: weeklyScore, final_project_score: finalProjectScore, overall_score: overallScore,
  }).eq('id', internshipId);

  return { weeklyScore, finalProjectScore, overallScore };
}

export async function completeInternship(internshipId: string) {
  const db = createAdminClient();
  const scores = await recomputeScores(internshipId);
  await db.from('internships').update({
    status: 'completed', completed_at: new Date().toISOString(),
  }).eq('id', internshipId);

  const { data: internship } = await db.from('internships')
    .select('student_id, duration').eq('id', internshipId).single();
  if (internship) {
    await notify(internship.student_id, 'internship_completed',
      `All weeks are complete. Final score ${scores?.overallScore ?? 0}. Your certificate is being reviewed.`,
      '/dashboard/certificate');
  }
  return scores;
}

/** Marks past-deadline tasks as overdue. Safe to run on every dashboard load. */
export async function refreshOverdueTasks(internshipId: string) {
  const db = createAdminClient();
  await db.from('internship_tasks')
    .update({ status: 'overdue' })
    .eq('internship_id', internshipId)
    .in('status', ['available', 'in_progress'])
    .lt('deadline', isoDate(new Date()));
}

export const rewardFor = (duration: Duration, position: 1 | 2 | 3) =>
  PLANS[duration].rewards.find((r) => r.position === position)!;
