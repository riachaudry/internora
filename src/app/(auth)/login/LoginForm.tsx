'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Alert } from '@/components/ui';

export function LoginForm({ next, message }: { next?: string; message?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
    });

    if (signInError) {
      setError('That email and password do not match an account. Check both and try again.');
      setBusy(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
    router.replace(next ?? (profile?.role === 'admin' ? '/admin' : '/dashboard'));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {message && <Alert tone="good">{message}</Alert>}
      {error && <Alert tone="bad">{error}</Alert>}

      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="field-label" htmlFor="password">Password</label>
          <Link href="/forgot-password" className="text-[13px] font-semibold text-signal hover:underline">
            Forgot password?
          </Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>

      <label className="flex items-center gap-2 text-[14px] text-slate">
        <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 rounded border-mist-deep text-signal" />
        Keep me signed in on this device
      </label>

      <Button type="submit" disabled={busy} className="w-full" size="lg">
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
