import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TRUST_STATEMENTS } from '@/lib/brand';
import { SectionHead, Card } from '@/components/ui';
import { SettingsClient } from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await requireStudent();
  const { data } = await createClient()
    .from('profiles').select('email, username, public_profile').eq('id', profile.id).single();

  return (
    <div className="space-y-6">
      <SectionHead title="Settings" body="Account security and what other people can see about you." />

      <SettingsClient
        email={data?.email ?? profile.email}
        username={data?.username ?? null}
        publicProfile={data?.public_profile ?? false}
      />

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Programme terms you agreed to</h2>
        <ul className="mt-3 space-y-2">
          {TRUST_STATEMENTS.map((s) => (
            <li key={s} className="flex gap-2 text-[13.5px] text-slate">
              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
