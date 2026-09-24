import { BRAND } from '../brand';

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Inlined styles — most email clients strip <style> blocks. */
const shell = (title: string, body: string, cta?: { label: string; href: string }) => `
<div style="background:#EEF2F7;padding:32px 16px;font-family:Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #DDE5EF">
    <div style="background:#101C33;padding:22px 28px">
      <span style="display:inline-block;width:30px;height:30px;background:#1F6F5C;border-radius:8px;color:#fff;font-weight:700;text-align:center;line-height:30px;font-size:14px;vertical-align:middle">IN</span>
      <span style="color:#fff;font-size:19px;font-weight:700;letter-spacing:-.01em;margin-left:10px;vertical-align:middle">${BRAND.legalName}</span>
      <div style="color:#8FA3BF;font-size:12px;margin-top:6px">${BRAND.tagline}</div>
    </div>
    <div style="padding:28px">
      <h1 style="margin:0 0 14px;font-size:20px;color:#101C33">${title}</h1>
      <div style="color:#3A4A63;font-size:15px;line-height:1.6">${body}</div>
      ${cta ? `<p style="margin:26px 0 0"><a href="${cta.href}" style="background:#1F6F5C;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">${cta.label}</a></p>` : ''}
    </div>
    <div style="padding:18px 28px;background:#F7F9FC;border-top:1px solid #DDE5EF;color:#6B7C96;font-size:12px;line-height:1.6">
      HR: ${BRAND.hr.name} &nbsp;·&nbsp; WhatsApp: ${BRAND.hr.whatsapp}<br/>
      This is a project-based virtual internship program.
    </div>
  </div>
</div>`;

export type TemplateKey =
  | 'welcome' | 'invitation' | 'application_received' | 'payment_submitted'
  | 'payment_verified' | 'offer_letter' | 'internship_activated' | 'new_task'
  | 'deadline_reminder' | 'task_reviewed' | 'certificate' | 'lor' | 'reward';

type Ctx = Record<string, any>;

export const TEMPLATES: Record<TemplateKey, (c: Ctx) => { subject: string; html: string }> = {
  welcome: (c) => ({
    subject: `Welcome to ${BRAND.legalName}`,
    html: shell('Your account is ready',
      `<p>Hi ${c.name},</p><p>Your Internora account is set up. Your student ID is <strong>${c.studentId}</strong>. Complete your profile, then pick an internship field and duration to apply.</p>`,
      { label: 'Open your dashboard', href: `${site()}/dashboard` }),
  }),
  invitation: (c) => ({
    subject: `You are invited to apply — ${BRAND.legalName}`,
    html: shell(`${c.name}, you're invited to apply`,
      `<p>You've been invited to apply for a project-based virtual internship with Internora.</p>
       <p>Programs run for 4, 6 or 8 weeks across nine fields, with weekly tasks, reviewed submissions, a verified certificate on completion, and performance rewards for the top three finishers in each group.</p>
       <p style="color:#6B7C96;font-size:13px">This invitation link expires in ${c.ttlHours} hours. We never send passwords by email.</p>`,
      { label: c.existingAccount ? 'Sign in' : 'Complete registration', href: c.link }),
  }),
  application_received: (c) => ({
    subject: 'We received your application',
    html: shell('Application received',
      `<p>Hi ${c.name},</p><p>Your application for <strong>${c.field}</strong> (${c.duration} weeks) is recorded. The next step is submitting your fee of <strong>PKR ${c.fee}</strong> and uploading the receipt.</p>`,
      { label: 'Submit payment', href: `${site()}/dashboard/payment` }),
  }),
  payment_submitted: (c) => ({
    subject: 'Payment submitted — under verification',
    html: shell('Payment received for review',
      `<p>Hi ${c.name},</p><p>We have your payment details (transaction <strong>${c.txn}</strong>). Verification is manual and usually takes up to 24 hours. You'll get an email the moment it's confirmed.</p>`,
      { label: 'Check status', href: `${site()}/dashboard` }),
  }),
  payment_verified: (c) => ({
    subject: 'Payment verified — your internship is active',
    html: shell('Payment verified',
      `<p>Hi ${c.name},</p><p>Your payment is verified and your internship is active from <strong>${c.startDate}</strong> to <strong>${c.endDate}</strong>. Week 1 is unlocked.</p>`,
      { label: 'Start week 1', href: `${site()}/dashboard/roadmap` }),
  }),
  offer_letter: (c) => ({
    subject: `Your offer letter — ${c.offerId}`,
    html: shell('Offer letter issued',
      `<p>Hi ${c.name},</p><p>Your offer letter <strong>${c.offerId}</strong> has been issued for ${c.field} (${c.duration} weeks).</p>`,
      { label: 'View offer letter', href: `${site()}/dashboard/offer-letter` }),
  }),
  internship_activated: (c) => ({
    subject: 'Your internship has started',
    html: shell('Internship activated',
      `<p>Hi ${c.name},</p><p>Your ${c.duration}-week ${c.field} internship runs from ${c.startDate} to ${c.endDate}. Week 1 tasks are available now.</p>`,
      { label: 'Open tasks', href: `${site()}/dashboard/roadmap` }),
  }),
  new_task: (c) => ({
    subject: `Week ${c.week} is unlocked`,
    html: shell(`Week ${c.week}: ${c.title}`,
      `<p>Hi ${c.name},</p><p>${c.taskCount} tasks are now available. They're due by <strong>${c.deadline}</strong>.</p>`,
      { label: 'View this week', href: `${site()}/dashboard/roadmap` }),
  }),
  deadline_reminder: (c) => ({
    subject: `Deadline in ${c.days} days — week ${c.week}`,
    html: shell('Deadline approaching',
      `<p>Hi ${c.name},</p><p>You have ${c.pending} task(s) still open for week ${c.week}, due ${c.deadline}.</p>`,
      { label: 'Submit now', href: `${site()}/dashboard/roadmap` }),
  }),
  task_reviewed: (c) => ({
    subject: `Task reviewed: ${c.task}`,
    html: shell(c.status === 'approved' ? 'Task approved' : 'Revision requested',
      `<p>Hi ${c.name},</p><p><strong>${c.task}</strong> — ${c.status === 'approved' ? `approved with ${c.score}/100.` : 'needs another pass.'}</p>${c.feedback ? `<p style="background:#F7F9FC;padding:14px;border-radius:10px;border-left:3px solid #1F6F5C">${c.feedback}</p>` : ''}`,
      { label: 'See feedback', href: `${site()}/dashboard/feedback` }),
  }),
  certificate: (c) => ({
    subject: `Your certificate — ${c.certificateId}`,
    html: shell('Certificate issued',
      `<p>Hi ${c.name},</p><p>You completed the ${c.duration}-week ${c.field} internship with an overall score of <strong>${c.score}</strong>. Your certificate ID is <strong>${c.certificateId}</strong> and anyone can verify it at the link below.</p>`,
      { label: 'View certificate', href: `${site()}/verify/certificate/${c.certificateId}` }),
  }),
  lor: (c) => ({
    subject: `Letter of recommendation — ${c.lorId}`,
    html: shell('Letter of recommendation issued',
      `<p>Hi ${c.name},</p><p>Based on your performance (position ${c.position} in your group), a letter of recommendation has been issued: <strong>${c.lorId}</strong>.</p>`,
      { label: 'Download LOR', href: `${site()}/dashboard/lor` }),
  }),
  reward: (c) => ({
    subject: 'Performance reward approved',
    html: shell('Performance reward approved',
      `<p>Hi ${c.name},</p><p>You finished at position <strong>${c.position}</strong> in the ${c.duration}-week group. Your approved reward is <strong>${c.rewardLabel}</strong>. ${BRAND.hr.name} will contact you on WhatsApp to arrange the transfer.</p>`,
      { label: 'View rewards', href: `${site()}/dashboard/rewards` }),
  }),
};
