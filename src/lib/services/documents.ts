import 'server-only';
import { createAdminClient } from '../supabase/admin';
import { notify } from '../notifications';
import { sendEmail } from '../email';
import { audit } from '../audit';
import { rewardFor } from './internship';
import type { Duration } from '../brand';

/** Certificates are only issued once the published completion criteria are met. */
export async function issueCertificate(internshipId: string, adminId: string) {
  const db = createAdminClient();

  const { data: internship } = await db.from('internships')
    .select('id, student_id, duration, status, overall_score, internship_fields(name), profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();
  if (!internship) throw new Error('Internship not found.');
  if (internship.status !== 'completed') throw new Error('The internship must be complete before a certificate is issued.');

  const { count: incomplete } = await db.from('internship_weeks')
    .select('id', { count: 'exact', head: true })
    .eq('internship_id', internshipId).neq('status', 'completed');
  if ((incomplete ?? 0) > 0) throw new Error('Every week must be completed first.');

  const { data: existing } = await db.from('certificates')
    .select('public_id').eq('internship_id', internshipId).maybeSingle();
  if (existing) return { publicId: existing.public_id, alreadyIssued: true };

  const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-CERT', p_scope: 'certificate' });
  const { data: cert, error } = await db.from('certificates').insert({
    internship_id: internshipId,
    public_id: pid as unknown as string,
    overall_score: internship.overall_score,
  }).select('public_id').single();
  if (error) throw new Error(error.message);

  const student = (internship as any).profiles;
  await notify(internship.student_id, 'certificate_issued',
    `Certificate ${cert.public_id} is ready. It can be verified publicly.`, '/dashboard/certificate');
  if (student?.email) {
    await sendEmail(student.email, 'certificate', {
      name: student.full_name, certificateId: cert.public_id,
      field: (internship as any).internship_fields?.name, duration: internship.duration,
      score: internship.overall_score,
    });
  }
  await audit(adminId, 'certificate.issue', 'certificate', cert.public_id);
  return { publicId: cert.public_id, alreadyIssued: false };
}

/** LORs are drafted by admin, then approved and issued. Positions 1-3 only. */
export async function issueLor(internshipId: string, adminId: string) {
  const db = createAdminClient();
  const { data: lor } = await db.from('lor_records')
    .select('id, public_id, status, position').eq('internship_id', internshipId).single();
  if (!lor) throw new Error('Draft the letter before issuing it.');
  if (lor.status === 'issued') return { publicId: lor.public_id, alreadyIssued: true };

  await db.from('lor_records').update({
    status: 'issued', issue_date: new Date().toISOString().slice(0, 10), approved_by: adminId,
  }).eq('id', lor.id);

  const { data: internship } = await db.from('internships')
    .select('student_id, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();
  const student = (internship as any)?.profiles;

  await notify(internship!.student_id, 'lor_issued',
    `Your letter of recommendation ${lor.public_id} has been issued.`, '/dashboard/lor');
  if (student?.email) {
    await sendEmail(student.email, 'lor', {
      name: student.full_name, lorId: lor.public_id, position: lor.position,
    });
  }
  await audit(adminId, 'lor.issue', 'lor', lor.public_id);
  return { publicId: lor.public_id, alreadyIssued: false };
}

/** Records the top three of a duration group as eligible for performance rewards. */
export async function assignRewards(duration: Duration, fieldId: string | null, adminId: string) {
  const db = createAdminClient();
  let query = db.from('internships')
    .select('id, student_id, overall_score, duration')
    .eq('duration', duration).eq('status', 'completed')
    .order('overall_score', { ascending: false }).limit(3);
  if (fieldId) query = query.eq('field_id', fieldId);

  const { data: top } = await query;
  if (!top?.length) return [];

  const results = [];
  for (let i = 0; i < top.length; i++) {
    const position = (i + 1) as 1 | 2 | 3;
    const reward = rewardFor(duration, position);
    const { data } = await db.from('rewards').upsert({
      internship_id: top[i].id,
      student_id: top[i].student_id,
      duration,
      position,
      amount_pkr: reward.amount,
      includes_lor: reward.lor,
      status: 'eligible',
    }, { onConflict: 'internship_id' }).select('id, position').single();
    results.push(data);
  }
  await audit(adminId, 'reward.assign', 'reward', `${duration}-week`, { count: results.length });
  return results;
}

export async function approveReward(rewardId: string, adminId: string) {
  const db = createAdminClient();
  const { data: reward } = await db.from('rewards')
    .select('id, student_id, position, duration, amount_pkr, includes_lor, profiles!rewards_student_id_fkey(full_name,email)')
    .eq('id', rewardId).single();
  if (!reward) throw new Error('Reward not found.');

  await db.from('rewards').update({ status: 'approved' }).eq('id', rewardId);
  const label = reward.amount_pkr > 0
    ? `PKR ${reward.amount_pkr.toLocaleString('en-PK')}${reward.includes_lor ? ' + LOR' : ''}`
    : 'LOR only';

  await notify(reward.student_id, 'reward_approved',
    `Position ${reward.position} in the ${reward.duration}-week group — ${label}.`, '/dashboard/rewards');
  const student = (reward as any).profiles;
  if (student?.email) {
    await sendEmail(student.email, 'reward', {
      name: student.full_name, position: reward.position, duration: reward.duration, rewardLabel: label,
    });
  }
  await audit(adminId, 'reward.approve', 'reward', rewardId);
  return { label };
}
