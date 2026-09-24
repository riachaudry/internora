'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { isoDate } from '@/lib/dates';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function AssignRewards({ duration }: { duration: number }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function assign() {
    setBusy(true); setMsg(null);
    try {
      const res = await postJson('/api/admin/rewards', { action: 'assign', duration });
      const n = (res as any)?.assigned;
      setMsg({ tone: 'good', text: `Assigned ${Array.isArray(n) ? n.length : n ?? 0} rewards from the leaderboard.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Could not assign.' });
    } finally { setBusy(false); }
  }

  return (
    <div className="mt-4 border-t border-mist pt-4">
      {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
      <Button size="sm" onClick={assign} disabled={busy}>
        {busy ? 'Assigning…' : `Assign top 3 for the ${duration}-week group`}
      </Button>
      <p className="mt-2 text-[12px] text-slate-light">
        Uses the current leaderboard ranking. Re-running updates the existing assignments.
      </p>
    </div>
  );
}

export function RewardControls({ rewardId, status }: { rewardId: string; status: string }) {
  const router = useRouter();
  const [ref, setRef] = React.useState('');
  const [method, setMethod] = React.useState('JazzCash');
  const [date, setDate] = React.useState(isoDate(new Date()));
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function act(action: 'approve' | 'mark_paid' | 'not_eligible') {
    setBusy(action); setMsg(null);
    try {
      await postJson('/api/admin/rewards', {
        action, reward_id: rewardId,
        ...(action === 'mark_paid'
          ? { payment_date: date, payment_reference: ref, payment_method: method, notes: notes || undefined }
          : { notes: notes || undefined }),
      });
      setMsg({ tone: 'good', text: `Marked as ${action.replace(/_/g, ' ')}.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Action failed.' });
    } finally { setBusy(null); }
  }

  return (
    <div className="mt-4 border-t border-mist pt-4">
      {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}

      {status === 'approved' && (
        <div className="mb-3 flex flex-wrap items-end gap-2.5">
          <label className="form-row"><span className="text-[12px]">Payment date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="form-row"><span className="text-[12px]">Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>JazzCash</option><option>Easypaisa</option>
            </select></label>
          <label className="form-row"><span className="text-[12px]">Reference</span>
            <input value={ref} onChange={(e) => setRef(e.target.value)} /></label>
        </div>
      )}

      <label className="form-row mb-3">
        <span className="text-[12px]">Notes (visible to the student)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="flex flex-wrap gap-2.5">
        {status !== 'paid' && status !== 'approved' && (
          <Button size="sm" onClick={() => act('approve')} disabled={!!busy}>Approve reward</Button>
        )}
        {status === 'approved' && (
          <Button size="sm" onClick={() => act('mark_paid')} disabled={!!busy}>Mark as paid</Button>
        )}
        {status !== 'paid' && (
          <Button size="sm" variant="danger" onClick={() => act('not_eligible')} disabled={!!busy}>
            Mark not eligible
          </Button>
        )}
      </div>
    </div>
  );
}
