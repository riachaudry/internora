'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Alert } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    if (password !== String(form.get('confirm'))) { setError('The two passwords do not match.'); return; }
    if (password.length < 8) { setError('Use at least 8 characters.'); return; }

    setBusy(true); setError(null);
    const { error: err } = await createClient().auth.updateUser({ password });
    if (err) { setError(err.message); setBusy(false); return; }
    router.replace('/login?message=Your password has been updated. Sign in with it now.');
  }

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && <Alert tone="bad">{error}</Alert>}
        <div>
          <label className="field-label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" required minLength={8} className="field" />
          <p className="mt-1.5 text-[13px] text-slate-light">At least 8 characters, with upper and lower case and a number.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="confirm">Confirm new password</label>
          <input id="confirm" name="confirm" type="password" required className="field" />
        </div>
        <Button type="submit" disabled={busy} size="lg" className="w-full">
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </>
  );
}
