'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function InternshipControls({ internshipId, duration, status }: {
  internshipId: string; duration: number; status: string;
}) {
  const router = useRouter();
  const [week, setWeek] = React.useState(1);
  const [remarks, setRemarks] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action); setMsg(null);
    try {
      const res = await postJson(`/api/admin/internships/${internshipId}`, { action, ...extra });
      const scores = (res as any)?.scores;
      setMsg({
        tone: 'good',
        text: scores
          ? `Done. Weekly ${scores.weeklyScore}, final ${scores.finalProjectScore}, overall ${scores.overallScore}.`
          : 'Done.',
      });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Action failed.' });
    } finally { setBusy(null); }
  }

  return (
    <div className="mt-5 border-t border-mist pt-5">
      {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}

      <div className="flex flex-wrap items-end gap-3">
        <Button size="sm" variant="secondary" onClick={() => act('recompute')} disabled={!!busy}>
          Recompute scores
        </Button>

        <div className="flex items-end gap-2">
          <label className="form-row">
            <span className="text-[12px]">Unlock week</span>
            <select value={week} onChange={(e) => setWeek(Number(e.target.value))}
                    className="h-[38px] py-0 text-[14px]">
              {Array.from({ length: duration }, (_, n) => n + 1).map((w) => (
                <option key={w} value={w}>{w === duration ? `${w} (final)` : w}</option>
              ))}
            </select>
          </label>
          <Button size="sm" variant="secondary" disabled={!!busy}
                  onClick={() => act('unlock_week', { week_number: week })}>
            Unlock
          </Button>
        </div>

        <Button size="sm" variant="secondary" onClick={() => act('record_evaluation', { remarks })} disabled={!!busy}>
          Record evaluation
        </Button>

        {status !== 'completed' ? (
          <Button size="sm" onClick={() => act('complete')} disabled={!!busy}>Mark completed</Button>
        ) : null}

        {status === 'terminated' ? (
          <Button size="sm" variant="secondary" onClick={() => act('reactivate')} disabled={!!busy}>Reactivate</Button>
        ) : (
          <Button size="sm" variant="danger" onClick={() => act('terminate', { remarks })} disabled={!!busy}>
            Terminate
          </Button>
        )}
      </div>

      <label className="form-row mt-3">
        <span className="text-[12px]">Remarks (used for evaluations and terminations)</span>
        <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </label>
    </div>
  );
}
