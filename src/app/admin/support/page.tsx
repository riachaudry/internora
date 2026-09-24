import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, EmptyState } from '@/components/ui';
import { TicketReply } from './TicketReply';

export const dynamic = 'force-dynamic';

const TABS = ['open', 'in_progress', 'resolved', 'closed', 'all'] as const;

export default async function AdminSupportPage({ searchParams }: { searchParams: { tab?: string } }) {
  const admin = await requireAdmin();
  const tab = (TABS.includes(searchParams.tab as any) ? searchParams.tab : 'open') as typeof TABS[number];
  const db = createAdminClient();

  let query = db.from('support_tickets')
    .select(`id, subject, message, attachment_url, status, created_at,
             profiles!support_tickets_student_id_fkey(full_name, student_id, email)`)
    .order('created_at', { ascending: false }).limit(100);
  if (tab !== 'all') query = query.eq('status', tab);

  const { data: tickets } = await query;
  const ids = (tickets ?? []).map((t) => t.id);
  const { data: messages } = ids.length
    ? await db.from('support_messages').select('id, ticket_id, author_id, body, created_at')
        .in('ticket_id', ids).order('created_at')
    : { data: [] as any[] };

  return (
    <div className="space-y-5">
      <SectionHead title="Support" body="Student tickets and their threads. Replies notify the student instantly." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t} href={`/admin/support?tab=${t}`}
             className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold ${
               tab === t ? 'bg-ink text-white' : 'border border-mist-deep bg-white text-slate'}`}>
            {t.replace(/_/g, ' ')}
          </a>
        ))}
      </div>

      {tickets?.length ? (
        <div className="space-y-4">
          {tickets.map((t) => {
            const s = (t as any).profiles;
            const thread = (messages ?? []).filter((m: any) => m.ticket_id === t.id);
            return (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink">{t.subject}</p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      {s?.full_name} · <span className="font-mono">{s?.student_id}</span> · {s?.email} ·
                      opened {shortDate(t.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <p className="prose-narrow mt-3 whitespace-pre-line text-[14.5px]">{t.message}</p>
                {t.attachment_url && (
                  <a href={t.attachment_url} target="_blank" rel="noopener noreferrer"
                     className="mt-2 inline-block text-[13.5px] font-semibold text-signal underline">Attachment</a>
                )}

                {!!thread.length && (
                  <ul className="mt-4 space-y-2.5 border-t border-mist pt-4">
                    {thread.map((m: any) => (
                      <li key={m.id} className={`rounded-xl p-3.5 ${m.author_id === admin.id ? 'bg-signal-light/40' : 'bg-mist/60'}`}>
                        <p className="text-[12px] font-semibold text-slate-light">
                          {m.author_id === admin.id ? 'You' : s?.full_name} · {shortDate(m.created_at)}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-[14px] text-ink">{m.body}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <TicketReply ticketId={t.id} status={t.status} />
              </Card>
            );
          })}
        </div>
      ) : <EmptyState title="No tickets" body="Nothing matches this filter." />}
    </div>
  );
}
