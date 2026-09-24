'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Alert } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get('email')).trim();
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true); setBusy(false);
  }

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Reset your password</h1>
      <p className="mt-2 text-[15px] text-slate">
        We will email you a link to set a new one. We never send passwords by email.
      </p>

      {sent ? (
        <Alert tone="good" title="Check your inbox">
          <p className="mt-1">
            If an account exists for that address, a reset link is on its way. The link expires in
            one hour. <Link href="/login" className="font-semibold underline">Back to sign in</Link>
          </p>
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="field" />
          </div>
          <Button type="submit" disabled={busy} size="lg" className="w-full">
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
          <Link href="/login" className="block text-center text-[14px] font-semibold text-signal hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </>
  );
}
