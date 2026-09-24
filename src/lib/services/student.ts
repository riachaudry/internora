import 'server-only';
import { createClient } from '../supabase/server';
import { dayOfInternship, daysRemaining, currentWeekNumber, totalDays } from '../dates';
import type { Duration } from '../brand';

export type StudentWeek = {
  id: string; week_number: number; title: string; summary: string; objectives: string[];
  is_final: boolean; start_date: string; end_date: string;
  status: 'locked' | 'active' | 'completed';
};

export type StudentTask = {
  id: string; week_id: string; task_code: string; task_number: number;
  title: string; description: string; instructions: string; objective: string; deliverable: string;
  points: number; is_required: boolean; submission_type: string; allowed_file_types: string[];
  unlock_date: string; deadline: string; status: string; score: number | null;
};

/**
 * One query pass for the whole student portal: application, payment,
 * internship, weeks, tasks and documents. Pages render from this snapshot so
 * every card in the dashboard agrees with every other one.
 */
export async function loadStudentState(studentId: string) {
  const supabase = createClient();

  const { data: application } = await supabase
    .from('applications')
    .select('id, duration, fee_pkr, status, applied_at, admin_note, field_id, internship_fields(name, slug)')
    .eq('student_id', studentId)
    .order('applied_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: payment } = application
    ? await supabase.from('payments')
        .select('id, method, transaction_id, payment_date, amount_pkr, screenshot_url, status, admin_note, verified_at, created_at')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: internship } = await supabase
    .from('internships')
    .select('id, duration, status, start_date, end_date, current_week, weekly_score, final_project_score, overall_score, completed_at, internship_fields(name, slug)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!internship) {
    return { application, payment, internship: null, weeks: [], tasks: [], docs: null, clock: null };
  }

  const [{ data: weeks }, { data: tasks }, { data: offer }, { data: certificate }, { data: lor }, { data: reward }] =
    await Promise.all([
      supabase.from('internship_weeks')
        .select('id, week_number, title, summary, objectives, is_final, start_date, end_date, status')
        .eq('internship_id', internship.id).order('week_number'),
      supabase.from('internship_tasks')
        .select('id, week_id, task_code, task_number, title, description, instructions, objective, deliverable, points, is_required, submission_type, allowed_file_types, unlock_date, deadline, status, score')
        .eq('internship_id', internship.id).order('task_number'),
      supabase.from('offer_letters')
        .select('id, public_id, issue_date, status').eq('internship_id', internship.id).maybeSingle(),
      supabase.from('certificates')
        .select('id, public_id, issue_date, overall_score, status').eq('internship_id', internship.id).maybeSingle(),
      supabase.from('lor_records')
        .select('id, public_id, position, performance, skills, achievements, recommendation, status, issue_date')
        .eq('internship_id', internship.id).maybeSingle(),
      supabase.from('rewards')
        .select('id, position, amount_pkr, includes_lor, status, payment_date, payment_reference, payment_method, notes')
        .eq('internship_id', internship.id).maybeSingle(),
    ]);

  const clock = internship.start_date
    ? {
        day: Math.max(0, dayOfInternship(internship.start_date)),
        totalDays: totalDays(internship.duration as Duration),
        remaining: internship.end_date ? daysRemaining(internship.end_date) : 0,
        week: currentWeekNumber(internship.start_date, internship.duration as Duration),
      }
    : null;

  return {
    application,
    payment,
    internship,
    weeks: (weeks ?? []) as StudentWeek[],
    tasks: (tasks ?? []) as StudentTask[],
    docs: { offer, certificate, lor, reward },
    clock,
  };
}

export type StudentState = Awaited<ReturnType<typeof loadStudentState>>;

/** The single place that decides what the student is allowed to see next. */
export function stageOf(state: StudentState) {
  if (state.internship?.status === 'completed') return 'completed' as const;
  if (state.internship?.status === 'active') return 'active' as const;
  if (state.payment && ['submitted', 'under_verification'].includes(state.payment.status)) return 'awaiting_verification' as const;
  if (state.payment && ['rejected', 'correction_requested', 'refunded'].includes(state.payment.status)) return 'payment_problem' as const;
  if (state.application) return 'awaiting_payment' as const;
  return 'no_application' as const;
}

export const taskProgress = (tasks: StudentTask[]) => {
  const visible = tasks.filter((t) => t.status !== 'locked');
  const approved = tasks.filter((t) => t.status === 'approved');
  const pending = visible.filter((t) => !['approved'].includes(t.status));
  const percent = tasks.length ? Math.round((approved.length / tasks.length) * 100) : 0;
  return { total: tasks.length, approved: approved.length, pending: pending.length, percent };
};
