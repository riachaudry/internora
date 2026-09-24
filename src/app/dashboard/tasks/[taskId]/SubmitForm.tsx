'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { Uploader, type Uploaded } from '@/components/portal/Uploader';
import { postJson } from '@/components/portal/form';

export function SubmitForm({ taskId, userId, submissionType, allowed, resubmit }: {
  taskId: string; userId: string; submissionType: string; allowed: string[]; resubmit: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<Uploaded | null>(null);
  const [url, setUrl] = React.useState('');
  const [text, setText] = React.useState('');
  const [comments, setComments] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const wantsFile = submissionType === 'file' || submissionType === 'file_or_url';
  const wantsUrl = submissionType === 'url' || submissionType === 'file_or_url';
  const wantsText = submissionType === 'text' || submissionType === 'file_or_url';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await postJson('/api/submissions', {
        task_id: taskId,
        file_url: file?.url, file_name: file?.name, file_size: file?.size,
        url: url || undefined, text_response: text || undefined, comments: comments || undefined,
      });
      setFile(null); setUrl(''); setText(''); setComments('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold">{resubmit ? 'Submit a revision' : 'Submit your work'}</h2>
      {resubmit && (
        <p className="mt-1 text-[14px] text-amber-dark">
          A revision was requested. Read the feedback below, then upload the updated deliverable.
        </p>
      )}

      <form onSubmit={submit} className="mt-4 space-y-4">
        {wantsFile && (
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">File</p>
            <Uploader bucket="submissions" userId={userId} allowed={allowed}
                      onDone={setFile} label="Upload deliverable" />
          </div>
        )}

        {wantsUrl && (
          <label className="form-row">
            <span>Link (GitHub, Figma, Drive, live demo)</span>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://github.com/your-name/project" />
          </label>
        )}

        {wantsText && (
          <label className="form-row">
            <span>Written response</span>
            <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)}
                      placeholder="Explain your approach, decisions and anything the evaluator should know." />
          </label>
        )}

        <label className="form-row">
          <span>Notes for the evaluator (optional)</span>
          <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
        </label>

        {error && <Alert tone="bad">{error}</Alert>}

        <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit for review'}</Button>
        <p className="text-[12px] text-slate-light">
          Attach a file, paste a link, or write your response — at least one is required.
        </p>
      </form>
    </Card>
  );
}
