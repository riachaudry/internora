import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SectionHead, Card, Badge, Alert } from '@/components/ui';
import { FieldForm } from './FieldForm';

export const dynamic = 'force-dynamic';

export default async function AdminFieldsPage() {
  await requireAdmin();
  const db = createAdminClient();

  const { data: fields } = await db.from('internship_fields')
    .select('*').order('sort_order');

  const { data: weeks } = await db.from('roadmap_weeks').select('field_id, duration');

  return (
    <div className="space-y-6">
      <SectionHead title="Internship fields"
                   body="The catalog behind the public site, the application form and every generated roadmap." />

      {!fields?.length && (
        <Alert tone="warn" title="No fields published">
          Run <code>npm run seed:roadmaps</code> to publish the nine launch programs with their full weekly roadmaps.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {(fields ?? []).map((f) => {
          const counts = [4, 6, 8].map((d) => ({
            d, n: (weeks ?? []).filter((w) => w.field_id === f.id && w.duration === d).length,
          }));
          return (
            <Card key={f.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[17px] font-bold text-ink">{f.name}</p>
                  <p className="mt-0.5 font-mono text-[12px] text-slate-light">/{f.slug}</p>
                </div>
                <Badge tone={f.is_active ? 'good' : 'neutral'}>{f.is_active ? 'Active' : 'Hidden'}</Badge>
              </div>
              <p className="prose-narrow mt-2 text-[14px]">{f.short_description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(f.skills ?? []).slice(0, 8).map((s: string) => (
                  <span key={s} className="rounded-full bg-mist px-2.5 py-1 text-[12px] text-slate">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-slate-light">
                {counts.map((c) => (
                  <span key={c.d}>{c.d}w roadmap: <strong className="text-ink">{c.n} weeks</strong></span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <FieldForm />
    </div>
  );
}
