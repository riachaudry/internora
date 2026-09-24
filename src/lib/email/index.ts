import 'server-only';
import { createAdminClient } from '../supabase/admin';
import { TEMPLATES, type TemplateKey } from './templates';

/**
 * Provider-agnostic email sender. Set EMAIL_PROVIDER=console in development
 * to print emails instead of sending them. No credentials are hard-coded.
 */
export async function sendEmail(to: string, template: TemplateKey, context: Record<string, any> = {}) {
  const { subject, html } = TEMPLATES[template](context);
  const provider = process.env.EMAIL_PROVIDER ?? 'console';
  let status = 'sent';
  let error: string | null = null;

  try {
    if (provider === 'resend') {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'Internora <no-reply@internora.app>',
        to, subject, html,
      });
      if ((res as any)?.error) throw new Error((res as any).error.message);
    } else {
      console.info(`[email:${template}] -> ${to}\n${subject}`);
    }
  } catch (e) {
    status = 'failed';
    error = e instanceof Error ? e.message : String(e);
    console.error(`[email:${template}] failed for ${to}:`, error);
  }

  try {
    await createAdminClient().from('email_log').insert({ to_email: to, template, subject, status, error });
  } catch { /* logging must never break the request */ }

  return { status, error };
}
