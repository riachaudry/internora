'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function TicketReply({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const [reply, setReply] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function send(next?: 'in_progress' | 'resolved' | 'closed') {
    setBusy(next ?? 'reply'); setMsg(null);
    try {
      await postJson(`/api/admin/support/${ticketId}`, {
        reply: reply || undefined, status: next,
      });
      setReply('');
      setMsg({ tone: 'good', text: next ? `Ticket marked ${next.replace(/_/g, ' ')}.` : 'Reply sent.' });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Could not send.' });
    } finally { setBusy(null); }
  }

  return (
    <div className="mt-4 border-t border-mist pt-4">
      {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
      <label className="form-row">
        <span className="text-[12px]">Reply</span>
        <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)}
                  placeholder="The student sees this in their support thread and gets a notification." />
      </label>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <Button size="sm" onClick={() => send()} disabled={!!busy || !reply.trim()}>
          {busy === 'reply' ? 'Sending…' : 'Send reply'}
        </Button>
        {status !== 'in_progress' && (
          <Button size="sm" variant="secondary" onClick={() => send('in_progress')} disabled={!!busy}>
            Mark in progress
          </Button>
        )}
        {status !== 'resolved' && (
          <Button size="sm" variant="secondary" onClick={() => send('resolved')} disabled={!!busy}>
            Mark resolved
          </Button>
        )}
        {status !== 'closed' && (
          <Button size="sm" variant="ghost" onClick={() => send('closed')} disabled={!!busy}>Close</Button>
        )}
      </div>
    </div>
  );
}
