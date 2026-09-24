'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

type Action = {
  key: string; label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  needsReason?: boolean;
};

/** Shared action strip for offer letters, certificates and LORs. */
export function DocActions({ endpoint, actions, body = {}, dateFields = false }: {
  endpoint: string; actions: Action[]; body?: Record<string, unknown>; dateFields?: boolean;
}) {
  const router = useRouter();
  const [reason, setReason] = React.useState('');
  const [issueDate, setIssueDate] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function act(a: Action) {
    setBusy(a.key); setMsg(null);
    try {
      await postJson(endpoint, {
        action: a.key, ...body,
        ...(a.needsReason && reason ? { reason } : {}),
      });
      setMsg({ tone: 'good', text: `${a.label} done.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Action failed.' });
    } finally { setBusy(null); }
  }

  async function saveDates() {
    setBusy('edit_dates'); setMsg(null);
    try {
      await postJson(endpoint, {
        action: 'edit_dates',
        issue_date: issueDate || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setMsg({ tone: 'good', text: 'Dates updated.' });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Could not update dates.' });
    } finally { setBusy(null); }
  }

  return (
    <div className="mt-4 border-t border-mist pt-4">
      {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}

      {dateFields && (
        <div className="mb-3 flex flex-wrap items-end gap-2.5">
          <label className="form-row"><span className="text-[12px]">Issue date</span>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></label>
          <label className="form-row"><span className="text-[12px]">Start date</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label className="form-row"><span className="text-[12px]">End date</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
          <Button size="sm" variant="secondary" onClick={saveDates} disabled={!!busy}>Save dates</Button>
        </div>
      )}

      {actions.some((a) => a.needsReason) && (
        <label className="form-row mb-3">
          <span className="text-[12px]">Reason (recorded on the document and in the audit log)</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      )}

      <div className="flex flex-wrap gap-2.5">
        {actions.map((a) => (
          <Button key={a.key} size="sm" variant={a.variant ?? 'primary'}
                  onClick={() => act(a)} disabled={!!busy}>
            {busy === a.key ? 'Working…' : a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
