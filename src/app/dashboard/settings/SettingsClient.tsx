'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { patchJson } from '@/components/portal/form';
import { Card, Button, Alert } from '@/components/ui';

export function SettingsClient({ email, publicProfile, username }: {
  email: string; publicProfile: boolean; username: string | null;
}) {
  const router = useRouter();
  const [pw, setPw] = React.useState({ next: '', confirm: '' });
  const [pwState, setPwState] = React.useState<{ busy: boolean; error?: string; done?: boolean }>({ busy: false });
  const [visible, setVisible] = React.useState(publicProfile);
  const [visState, setVisState] = React.useState<{ busy: boolean; error?: string; done?: boolean }>({ busy: false });
  const [signingOut, setSigningOut] = React.useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) { setPwState({ busy: false, error: 'The two passwords do not match.' }); return; }
    if (pw.next.length < 8) { setPwState({ busy: false, error: 'Use at least 8 characters.' }); return; }
    setPwState({ busy: true });
    const { error } = await createClient().auth.updateUser({ password: pw.next });
    if (error) setPwState({ busy: false, error: error.message });
    else { setPw({ next: '', confirm: '' }); setPwState({ busy: false, done: true }); }
  }

  async function toggleVisibility(next: boolean) {
    setVisible(next);
    setVisState({ busy: true });
    try {
      await patchJson('/api/profile', { public_profile: next });
      setVisState({ busy: false, done: true });
      router.refresh();
    } catch (err) {
      setVisible(!next);
      setVisState({ busy: false, error: err instanceof Error ? err.message : 'Could not update visibility.' });
    }
  }

  async function signOutEverywhere() {
    setSigningOut(true);
    await createClient().auth.signOut({ scope: 'global' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Sign-in email</p>
            <p className="mt-1 truncate text-[14px] font-semibold text-ink">{email}</p>
            <p className="mt-1 text-[12.5px] text-slate-light">
              To change your sign-in email, open a support ticket so we can keep your documents consistent.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">Public page</p>
            <p className="mt-1 font-mono text-[13px] text-ink">{username ? `/profile/${username}` : 'Not assigned yet'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Change password</h2>
        {pwState.error && <div className="mt-3"><Alert tone="danger" title="Not changed">{pwState.error}</Alert></div>}
        {pwState.done && <div className="mt-3"><Alert tone="success" title="Password updated">Use it the next time you sign in.</Alert></div>}
        <form onSubmit={changePassword} className="mt-4 grid max-w-md gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="next-pw">New password</label>
            <input id="next-pw" type="password" className="field" required minLength={8} autoComplete="new-password"
                   value={pw.next} onChange={(e) => setPw((v) => ({ ...v, next: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="confirm-pw">Confirm new password</label>
            <input id="confirm-pw" type="password" className="field" required minLength={8} autoComplete="new-password"
                   value={pw.confirm} onChange={(e) => setPw((v) => ({ ...v, confirm: e.target.value }))} />
          </div>
          <div><Button type="submit" disabled={pwState.busy}>{pwState.busy ? 'Saving…' : 'Update password'}</Button></div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Profile visibility</h2>
        {visState.error && <div className="mt-3"><Alert tone="danger" title="Not updated">{visState.error}</Alert></div>}
        <label className="mt-4 flex items-start gap-3 rounded-xl border border-mist-deep bg-mist/40 p-4">
          <input type="checkbox" className="mt-0.5 h-4 w-4" checked={visible} disabled={visState.busy}
                 onChange={(e) => toggleVisibility(e.target.checked)} />
          <span className="text-[13.5px] text-slate">
            Show my public profile page. When off, the page returns a not-found response to everyone, including
            people who already have the link.
          </span>
        </label>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Sessions</h2>
        <p className="prose-narrow mt-2 text-[14px]">
          Signing out everywhere ends your session on every device. Use this if you signed in on a shared computer.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={signOutEverywhere} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out everywhere'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
