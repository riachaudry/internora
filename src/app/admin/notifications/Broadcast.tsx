'use client';
import * as React from 'react';
import { Card, Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function Broadcast() {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [audience, setAudience] = React.useState<'all' | 'active' | 'completed'>('all');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await postJson('/api/admin/announcements', { title, body, audience });
      setMsg({ tone: 'good', text: `Sent to ${(res as any)?.recipients ?? 0} students.` });
      setTitle(''); setBody('');
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not send.' });
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold">Send an announcement</h2>
      <p className="mt-1 text-[14px] text-slate">Published as an announcement and pushed to each student&rsquo;s notifications.</p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <label className="form-row"><span>Title</span>
            <input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="form-row"><span>Audience</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value as any)}>
              <option value="all">All students</option>
              <option value="active">Active interns</option>
              <option value="completed">Completed interns</option>
            </select></label>
        </div>
        <label className="form-row"><span>Message</span>
          <textarea required rows={3} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send announcement'}</Button>
      </form>
    </Card>
  );
}
