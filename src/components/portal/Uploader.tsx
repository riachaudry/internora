'use client';
import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { checkFile, ALLOWED_UPLOAD_EXT, MAX_UPLOAD_BYTES } from '@/lib/validation';

export type Uploaded = { url: string; path: string; name: string; size: number };

/**
 * Uploads straight to Supabase Storage under `<bucket>/<user-id>/<file>`,
 * which is the exact path the storage policies authorise. The parent form
 * only ever sends the resulting URL to our API.
 */
export function Uploader({
  bucket, userId, onDone, accept, allowed = ALLOWED_UPLOAD_EXT,
  maxBytes = MAX_UPLOAD_BYTES, label = 'Choose file', current,
}: {
  bucket: string; userId: string;
  onDone: (file: Uploaded | null) => void;
  accept?: string; allowed?: string[]; maxBytes?: number;
  label?: string; current?: string | null;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Uploaded | null>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const check = checkFile(file.name, file.size, allowed, maxBytes);
    if (!check.ok) { setError(check.error); onDone(null); return; }

    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) throw new Error(upErr.message);

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      let url = pub.publicUrl;
      // Private buckets return no usable public URL, so fall back to a signed one.
      if (bucket !== 'avatars') {
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signed?.signedUrl) url = signed.signedUrl;
      }

      const result: Uploaded = { url, path, name: file.name, size: file.size };
      setDone(result);
      onDone(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setError(message);
      onDone(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mist-deep bg-mist/40 px-4 py-3 hover:border-signal">
        <input type="file" accept={accept} onChange={handle} disabled={busy} className="sr-only" />
        <span className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-sm">
          {busy ? 'Uploading…' : label}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-slate-light">
          {done?.name ?? (current ? 'File already attached' : `${allowed.join(', ')} · up to ${Math.round(maxBytes / 1048576)} MB`)}
        </span>
      </label>
      {error && <p className="mt-1.5 text-[13px] font-medium text-danger">{error}</p>}
      {done && <p className="mt-1.5 text-[13px] font-medium text-signal">Uploaded.</p>}
    </div>
  );
}
