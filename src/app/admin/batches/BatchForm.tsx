'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DURATIONS } from '@/lib/brand';
import { Card, Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function BatchForm({ fields }: { fields: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [fieldId, setFieldId] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await postJson('/api/admin/batches', {
        name,
        field_id: fieldId || null,
        duration: duration ? Number(duration) : null,
        start_date: startDate || undefined,
        notes: notes || undefined,
      });
      setMsg({ tone: 'good', text: 'Batch created.' });
      setName(''); setFieldId(''); setDuration(''); setStartDate(''); setNotes('');
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not create.' });
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5 lg:sticky lg:top-24 lg:self-start">
      <h2 className="font-display text-lg font-bold">New batch</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <label className="form-row"><span>Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="October 2026 intake" /></label>
        <label className="form-row"><span>Field (optional)</span>
          <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            <option value="">Any field</option>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select></label>
        <label className="form-row"><span>Duration (optional)</span>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Any duration</option>
            {DURATIONS.map((d) => <option key={d} value={d}>{d} weeks</option>)}
          </select></label>
        <label className="form-row"><span>Start date (optional)</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
        <label className="form-row"><span>Notes</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Creating…' : 'Create batch'}</Button>
      </form>
    </Card>
  );
}
