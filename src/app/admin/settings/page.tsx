import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND, PLANS, DURATIONS, TRUST_STATEMENTS, formatPKR, SCORE_WEIGHTS, WEEK_COMPLETION_THRESHOLD } from '@/lib/brand';
import { SectionHead, Card, Table, Badge, Alert } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const db = createAdminClient();

  const { data: audits } = await db.from('audit_logs')
    .select('id, action, entity, entity_id, created_at, profiles(full_name)')
    .order('created_at', { ascending: false }).limit(50);

  const emailProvider = process.env.EMAIL_PROVIDER ?? 'console';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'not set';

  return (
    <div className="space-y-6">
      <SectionHead title="Settings"
                   body="Brand, pricing and scoring are defined in code (src/lib/brand.ts) so they stay identical across the site, the portals and every generated document." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Brand</h2>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            <Row label="Name" value={BRAND.legalName} />
            <Row label="Tagline" value={BRAND.tagline} />
            <Row label="Description" value={BRAND.description} />
            <Row label="HR" value={BRAND.hr.name} />
            <Row label="HR WhatsApp" value={BRAND.hr.whatsapp} />
            <Row label="Payment account" value={BRAND.payment.accountName} />
            <Row label="Payment number" value={BRAND.payment.number} />
            <Row label="Methods" value="JazzCash, Easypaisa" />
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Environment</h2>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            <Row label="Site URL" value={siteUrl} />
            <Row label="Email provider" value={<Badge tone={emailProvider === 'resend' ? 'good' : 'warn'}>{emailProvider}</Badge>} />
            <Row label="Week completion threshold" value={`${Math.round(WEEK_COMPLETION_THRESHOLD * 100)}% of required points`} />
            <Row label="Score weighting" value={`${SCORE_WEIGHTS.weekly * 100}% weekly / ${SCORE_WEIGHTS.finalProject * 100}% final`} />
          </dl>
          {emailProvider === 'console' && (
            <div className="mt-4">
              <Alert tone="warn">Emails are logged to the console, not delivered.</Alert>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">Fees and reward tiers</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {DURATIONS.map((d) => (
            <div key={d} className="rounded-xl bg-mist/70 p-4">
              <p className="font-display text-[17px] font-bold text-ink">{PLANS[d].label}</p>
              <p className="mt-1 text-[15px] font-semibold text-signal">{formatPKR(PLANS[d].fee)}</p>
              <ul className="mt-3 space-y-1 text-[13px]">
                {PLANS[d].rewards.map((r) => (
                  <li key={r.position} className="flex justify-between">
                    <span className="text-slate">#{r.position}</span>
                    <span className="font-semibold text-ink">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">Trust statements</h2>
        <p className="mt-1 text-[13.5px] text-slate-light">Shown in the footer and on the about page.</p>
        <ul className="mt-3 space-y-2 text-[14px] text-slate">
          {TRUST_STATEMENTS.map((t) => <li key={t}>• {t}</li>)}
        </ul>
      </Card>

      <div>
        <h2 className="font-display text-lg font-bold">Audit log</h2>
        <div className="mt-3">
          <Table head={['Action', 'Entity', 'Actor', 'When']}>
            {(audits ?? []).map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-ink">{a.action}</td>
                <td className="px-4 py-3 text-slate">{a.entity}</td>
                <td className="px-4 py-3 text-slate">{(a as any).profiles?.full_name ?? 'System'}</td>
                <td className="px-4 py-3 text-slate">
                  {new Date(a.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-slate">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
