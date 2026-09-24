'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function LorEditor({ internshipId, position, initial, status }: {
  internshipId: string; position: number; status?: string;
  initial?: { performance: string; skills: string; achievements: string; recommendation: string };
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(!initial);
  const [f, setF] = React.useState(initial ?? { performance: '', skills: '', achievements: '', recommendation: '' });
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  async function act(action: 'draft' | 'issue' | 'revoke') {
    setBusy(action); setMsg(null);
    try {
      await postJson('/api/admin/lor', {
        internship_id: internshipId, action,
        ...(action === 'draft' ? {
          position,
          performance: f.performance,
          skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
          achievements: f.achievements,
          recommendation: f.recommendation,
        } : {}),
      });
      setMsg({ tone: 'good', text: action === 'issue' ? 'Letter issued and the student notified.' : `Letter ${action}d.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Action failed.' });
    } finally { setBusy(null); }
  }

  if (!open) {
    return (
      <div className="mt-4 border-t border-mist pt-4">
        {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
        <div className="flex flex-wrap gap-2.5">
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Edit letter</Button>
          {status !== 'issued' && (
            <Button size="sm" onClick={() => act('issue')} disabled={!!busy}>
              {busy === 'issue' ? 'Issuing…' : 'Issue letter'}
            </Button>
          )}
          {status === 'issued' && (
            <Button size="sm" variant="danger" onClick={() => act('revoke')} disabled={!!busy}>Revoke</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3.5 border-t border-mist pt-4">
      <label className="form-row"><span>Performance summary</span>
        <textarea rows={3} value={f.performance} onChange={set('performance')}
                  placeholder="How they worked through the program, consistency, quality of submissions." /></label>
      <label className="form-row"><span>Demonstrated skills (comma separated)</span>
        <input value={f.skills} onChange={set('skills')} placeholder="React, API design, technical writing" /></label>
      <label className="form-row"><span>Achievements</span>
        <textarea rows={2} value={f.achievements} onChange={set('achievements')} /></label>
      <label className="form-row"><span>Recommendation</span>
        <textarea rows={3} value={f.recommendation} onChange={set('recommendation')} /></label>

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <div className="flex flex-wrap gap-2.5">
        <Button size="sm" variant="secondary" onClick={() => act('draft')} disabled={!!busy}>
          {busy === 'draft' ? 'Saving…' : 'Save draft'}
        </Button>
        <Button size="sm" onClick={() => act('issue')} disabled={!!busy}>Issue letter</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
      </div>
    </div>
  );
}
