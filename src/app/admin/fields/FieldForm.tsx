'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function FieldForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({
    name: '', short_description: '', description: '', skills: '',
    evaluation_criteria: '', certificate_criteria: '', reward_criteria: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await postJson('/api/admin/fields', {
        ...f,
        skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
        is_active: true,
      });
      setMsg({ tone: 'good', text: 'Field created. Add its weekly roadmap next.' });
      setF({ name: '', short_description: '', description: '', skills: '',
             evaluation_criteria: '', certificate_criteria: '', reward_criteria: '' });
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not save.' });
    } finally { setBusy(false); }
  }

  if (!open) {
    return <Button variant="secondary" onClick={() => setOpen(true)}>Add a new field</Button>;
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold">New internship field</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-row"><span>Name</span>
            <input required value={f.name} onChange={set('name')} placeholder="Cloud Engineering" /></label>
          <label className="form-row"><span>Skills (comma separated)</span>
            <input value={f.skills} onChange={set('skills')} placeholder="AWS, Docker, CI/CD" /></label>
        </div>
        <label className="form-row"><span>Short description</span>
          <input required minLength={10} maxLength={200} value={f.short_description}
                 onChange={set('short_description')} /></label>
        <label className="form-row"><span>Full description</span>
          <textarea required rows={4} value={f.description} onChange={set('description')} /></label>
        <label className="form-row"><span>Evaluation criteria</span>
          <textarea required rows={2} value={f.evaluation_criteria} onChange={set('evaluation_criteria')} /></label>
        <label className="form-row"><span>Certificate criteria</span>
          <textarea required rows={2} value={f.certificate_criteria} onChange={set('certificate_criteria')} /></label>
        <label className="form-row"><span>Reward criteria</span>
          <textarea required rows={2} value={f.reward_criteria} onChange={set('reward_criteria')} /></label>

        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <div className="flex gap-2.5">
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create field'}</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
