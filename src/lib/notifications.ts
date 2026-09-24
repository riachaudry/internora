import 'server-only';
import { createAdminClient } from './supabase/admin';

export const NOTIFICATION_TYPES = {
  application_received: 'Application received',
  payment_submitted: 'Payment submitted',
  payment_verified: 'Payment verified',
  payment_rejected: 'Payment needs attention',
  internship_activated: 'Internship activated',
  offer_letter_issued: 'Offer letter issued',
  week_unlocked: 'New week unlocked',
  task_assigned: 'New tasks assigned',
  deadline_reminder: 'Deadline approaching',
  task_approved: 'Task approved',
  revision_requested: 'Revision requested',
  week_completed: 'Week completed',
  final_project_unlocked: 'Final project unlocked',
  internship_completed: 'Internship completed',
  certificate_issued: 'Certificate issued',
  lor_issued: 'Letter of recommendation issued',
  reward_approved: 'Performance reward approved',
  support_reply: 'Support replied',
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

export async function notify(
  userId: string, type: NotificationType, message: string, link?: string,
) {
  const db = createAdminClient();
  await db.from('notifications').insert({
    user_id: userId, type, title: NOTIFICATION_TYPES[type], message, link,
  });
}

export async function notifyMany(
  userIds: string[], type: NotificationType, message: string, link?: string,
) {
  if (!userIds.length) return;
  const db = createAdminClient();
  await db.from('notifications').insert(
    userIds.map((user_id) => ({ user_id, type, title: NOTIFICATION_TYPES[type], message, link })),
  );
}
