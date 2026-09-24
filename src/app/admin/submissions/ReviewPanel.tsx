'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

export function ReviewPanel({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [score, setScore] = React.useState(85);
  const [feedback, setFeedback] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);

  async function act(status: 'approved' | 'revision_required' | 'rejected') {
    setError(null); setBusy(status);
    try {
      const res = await postJson(`/api/admin/submissions/${submissionId}`, {
        status,
        score: status === 'approved' ? score : undefined,
        feedback: feedback || undefined,
      });
      const p = (res as any)?.progression;
      setDone(status === 'approved'
        ? `Approved at ${score}/100.${p?.completed ? ` Week completed${p.unlockedWeek ? ` — week ${p.unlockedWeek} unlocked.` : '.'}` : ''}`
        : `Marked as ${status.replace(/_/g, ' ')}.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed.');
    } finally { setBusy(null); }
  }

  if (done) return <div className="mt-5"><Alert tone="good">{done}</Alert></div>;

  return (
    <div className="mt-5 border-t border-mist pt-5">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="form-row">
          <span>Score (0-100)</span>
          <input type="number" min={0} max={100} value={score}
                 onChange={(e) => setScore(Number(e.target.value))} />
        </label>
        <label className="form-row">
          <span>Feedback to the student</span>
          <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What worked, what to fix, and what to do next." />
        </label>
      </div>

      {error && <div className="mt-3"><Alert tone="bad">{error}</Alert></div>}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button onClick={() => act('approved')} disabled={!!busy}>
          {busy === 'approved' ? 'Approving…' : 'Approve'}
        </Button>
        <Button variant="secondary" onClick={() => act('revision_required')} disabled={!!busy}>
          Request revision
        </Button>
        <Button variant="danger" onClick={() => act('rejected')} disabled={!!busy}>Reject</Button>
      </div>
      <p className="mt-2 text-[12px] text-slate-light">
        The student is notified and emailed automatically with your score and feedback.
      </p>
    </div>
  );
}
