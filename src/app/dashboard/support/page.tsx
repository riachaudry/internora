import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BRAND } from '@/lib/brand';
import { SectionHead, Alert } from '@/components/ui';
import { SupportClient, type Ticket } from './SupportClient';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const profile = await requireStudent();
  const { data } = await createClient()
    .from('support_tickets')
    .select('id, subject, message, status, attachment_url, created_at, support_messages(id, body, author_id, created_at)')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false });

  const tickets = ((data ?? []) as unknown as Ticket[]).map((t) => ({
    ...t,
    support_messages: [...(t.support_messages ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));

  return (
    <div className="space-y-6">
      <SectionHead title="Support"
                   body="Ask about payments, deadlines, submissions or documents. Tickets are answered inside the portal." />

      <Alert tone="info" title="Urgent payment or verification question?">
        <p className="mt-1">
          Message {BRAND.hr.name} on WhatsApp at{' '}
          <a className="font-semibold underline underline-offset-2" href={BRAND.hr.whatsappLink}
             target="_blank" rel="noreferrer noopener">{BRAND.hr.whatsapp}</a>{' '}
          and include your student ID. Never send payments to any number other than the one shown on your payment page.
        </p>
      </Alert>

      <SupportClient userId={profile.id} tickets={tickets} />
    </div>
  );
}
