import { notFound } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import { ROADMAPS, roadmapBySlug, roadmapFor } from '@/lib/roadmaps';
import { PLANS, DURATIONS, formatPKR, type Duration } from '@/lib/brand';

export const dynamicParams = false;
export function generateStaticParams() {
  return ROADMAPS.map((f) => ({ slug: f.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const field = roadmapBySlug(params.slug);
  return { title: field?.name ?? 'Internship' };
}

export default function FieldPage({
  params, searchParams,
}: { params: { slug: string }; searchParams: { duration?: string } }) {
  const field = roadmapBySlug(params.slug);
  if (!field) notFound();

  const duration = (DURATIONS.includes(Number(searchParams.duration) as Duration)
    ? Number(searchParams.duration) : 8) as Duration;
  const weeks = roadmapFor(field, duration);
  const plan = PLANS[duration];
  const totalTasks = weeks.reduce((s, w) => s + w.tasks.length, 0);
  const totalPoints = weeks.reduce((s, w) => s + w.tasks.reduce((p, t) => p + (t.points ?? 10), 0), 0);

  return (
    <div className="wrap py-14">
      <p className="text-[13px] font-semibold text-signal">Internship field</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{field.name}</h1>
      <p className="prose-narrow mt-4 text-[17px]">{field.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {field.skills.map((s) => (
          <span key={s} className="rounded-md bg-mist px-2.5 py-1 text-[13px] font-medium text-slate">{s}</span>
        ))}
      </div>

      {/* Duration switcher — the roadmap below re-renders for the chosen length */}
      <div className="mt-9 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-semibold text-ink">Program length:</span>
        {DURATIONS.map((d) => (
          <a key={d} href={`/internships/${field.slug}?duration=${d}`}
             className={`rounded-xl border px-4 py-2 text-[14px] font-semibold transition ${
               d === duration ? 'border-signal bg-signal text-white' : 'border-mist-deep bg-white text-slate hover:border-slate-light'
             }`}>
            {d} weeks · {formatPKR(PLANS[d].fee)}
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {weeks.map((w, i) => (
            <Card key={`${w.title}-${i}`} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">
                  Week {i + 1} — {w.title}
                </h2>
                {w.isFinal && <Badge tone="warn">Final project</Badge>}
              </div>
              <p className="mt-2 text-[15px] text-slate">{w.summary}</p>

              <p className="mt-4 text-[13px] font-semibold text-ink">Objectives</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] text-slate">
                {w.objectives.map((o) => <li key={o}>{o}</li>)}
              </ul>

              <p className="mt-4 text-[13px] font-semibold text-ink">Tasks ({w.tasks.length})</p>
              <ol className="mt-2 divide-y divide-mist border-t border-mist">
                {w.tasks.map((t, ti) => (
                  <li key={t.title} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{ti + 1}. {t.title}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-slate">{t.description}</p>
                        <p className="mt-1.5 text-[13px] text-slate-light">Deliverable: {t.deliverable}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-mist px-2 py-1 text-[12px] font-semibold text-slate">
                        {t.points ?? 10} pts
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="font-display text-2xl font-extrabold">{formatPKR(plan.fee)}</p>
            <p className="text-[13px] text-slate-light">{plan.label} · one-time fee</p>
            <dl className="mt-5 space-y-2 border-t border-mist pt-4 text-[14px]">
              {[['Weeks', `${duration} (${duration - 1} + final project)`],
                ['Tasks', String(totalTasks)],
                ['Total points', String(totalPoints)],
                ['Mode', 'Online / virtual'],
                ['Type', 'Project-based internship']].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-light">{k}</dt><dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <Button href={`/register?field=${field.slug}&duration=${duration}`} className="mt-5 w-full">Apply now</Button>
          </Card>

          <Card className="p-6 text-[14px] leading-relaxed">
            <h3 className="font-display text-[15px] font-bold">Performance rewards</h3>
            <ul className="mt-2 space-y-1 text-slate">
              {plan.rewards.map((r) => (
                <li key={r.position}>{['1st', '2nd', '3rd'][r.position - 1]} place — {r.label}</li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-slate-light">{field.rewardCriteria}</p>
          </Card>

          <Card className="p-6 text-[14px] leading-relaxed">
            <h3 className="font-display text-[15px] font-bold">Evaluation</h3>
            <p className="mt-2 text-slate">{field.evaluationCriteria}</p>
            <p className="mt-3 text-[13px] font-semibold text-ink">Certificate criteria</p>
            <p className="mt-1 text-slate">{field.certificateCriteria}</p>
            <p className="mt-3 text-[13px] text-slate-light">Final score = 70% weekly work + 30% final project.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
