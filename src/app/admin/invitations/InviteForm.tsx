'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function InviteForm() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await postJson('/api/admin/invitations', { full_name: name, email });
      setMsg({
        tone: 'good',
        text: (res as any)?.existingAccount
          ? 'That email already has an account — a sign-in link was sent instead.'
          : 'Invitation sent.',
      });
      setName(''); setEmail('');
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not send.' });
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5 lg:sticky lg:top-24 lg:self-start">
      <h2 className="font-display text-lg font-bold">Send an invitation</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <label className="form-row"><span>Full name</span>
          <input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="form-row"><span>Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Sending…' : 'Send invitation'}</Button>
      </form>
    </Card>
  );
}
