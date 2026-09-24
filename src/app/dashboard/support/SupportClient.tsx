'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/components/portal/form';
import { Uploader } from '@/components/portal/Uploader';
import { Card, Button, Alert, StatusBadge } from '@/components/ui';

export type Ticket = {
  id: string; subject: string; message: string; status: string;
  attachment_url: string | null; created_at: string;
  support_messages: { id: string; body: string; author_id: string; created_at: string }[];
};

const when = (iso: string) => new Date(iso).toLocaleString('en-PK', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function SupportClient({ userId, tickets }: { userId: string; tickets: Ticket[] }) {
  const router = useRouter();
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [attachment, setAttachment] = React.useState<string | undefined>();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(tickets[0]?.id ?? null);
  const [reply, setReply] = React.useState('');

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setSent(false);
    try {
      await postJson('/api/support', { subject, message, attachment_url: attachment });
      setSubject(''); setMessage(''); setAttachment(undefined); setSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the ticket.');
    } finally { setBusy(false); }
  }

  async function sendReply(ticketId: string) {
    if (reply.trim().length < 2) return;
    setBusy(true); setError(null);
    try {
      await postJson(`/api/support/${ticketId}/messages`, { body: reply });
      setReply('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your reply.');
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">Your tickets</h2>
        {error && <Alert tone="danger" title="Something went wrong">{error}</Alert>}

        {!tickets.length ? (
          <Card className="p-6 text-[14px] text-slate-light">
            No tickets yet. Use the form to ask about payments, deadlines, submissions or documents.
          </Card>
        ) : tickets.map((t) => {
          const open = openId === t.id;
          return (
            <Card key={t.id} className="overflow-hidden">
              <button type="button" onClick={() => setOpenId(open ? null : t.id)}
                      aria-expanded={open}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-mist/50">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-bold text-ink">{t.subject}</p>
                  <p className="mt-0.5 text-[12.5px] text-slate-light">
                    Opened {when(t.created_at)} · {t.support_messages.length} repl{t.support_messages.length === 1 ? 'y' : 'ies'}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </button>

              {open && (
                <div className="border-t border-mist px-5 py-4">
                  <div className="space-y-3">
                    <div className="rounded-xl bg-mist/60 p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">You</p>
                      <p className="mt-1 whitespace-pre-line text-[14px] text-slate">{t.message}</p>
                      {t.attachment_url && (
                        <a className="mt-2 inline-block text-[13px] text-signal underline underline-offset-2"
                           href={t.attachment_url} target="_blank" rel="noreferrer noopener">Attached file</a>
                      )}
                    </div>
                    {t.support_messages.map((m) => {
                      const mine = m.author_id === userId;
                      return (
                        <div key={m.id}
                             className={`rounded-xl p-4 ${mine ? 'bg-mist/60' : 'border border-signal/30 bg-signal-light/30'}`}>
                          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">
                            {mine ? 'You' : 'Internora'} · {when(m.created_at)}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-[14px] text-slate">{m.body}</p>
                        </div>
                      );
                    })}
                  </div>

                  {t.status !== 'closed' && (
                    <div className="mt-4">
                      <label className="sr-only" htmlFor={`reply-${t.id}`}>Reply</label>
                      <textarea id={`reply-${t.id}`} rows={3} className="field" value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Add a reply to this ticket…" />
                      <div className="mt-2">
                        <Button size="sm" onClick={() => sendReply(t.id)} disabled={busy || reply.trim().length < 2}>
                          {busy ? 'Sending…' : 'Send reply'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div>
        <Card className="p-5">
          <h2 className="font-display text-[15px] font-bold text-ink">Open a new ticket</h2>
          {sent && <div className="mt-3"><Alert tone="success" title="Ticket opened">We will reply inside the portal.</Alert></div>}
          <form onSubmit={createTicket} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="subject">Subject</label>
              <input id="subject" className="field" required minLength={4} maxLength={120}
                     value={subject} onChange={(e) => setSubject(e.target.value)}
                     placeholder="Payment not verified yet" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="message">Details</label>
              <textarea id="message" rows={6} className="field" required minLength={10} maxLength={4000}
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe the problem, including any transaction ID or task code." />
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Attachment (optional)</p>
              <Uploader bucket="documents" userId={userId} label="Attach file"
                        onDone={(f) => setAttachment(f?.url)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Open ticket'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
