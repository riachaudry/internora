import Link from 'next/link';
import { Button, Card, SectionHead } from '@/components/ui';
import { ROADMAPS } from '@/lib/roadmaps';
import { BRAND, PLANS, DURATIONS, formatPKR } from '@/lib/brand';

export default function HomePage() {
  return (
    <>
      {/* Hero: the week strip is the product, so it leads. */}
      <section className="bg-ink text-white">
        <div className="wrap grid gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.08] sm:text-[3.4rem]">
              Virtual Internships.<br />Real Experience.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-white/75">
              Build practical experience through structured online projects, real-world tasks,
              professional feedback and verified internship certification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/internships" size="lg">Explore internships</Button>
              <Button href="/register" size="lg" variant="secondary"
                      className="border-white/20 bg-white/10 text-white hover:border-white/40">
                Apply now
              </Button>
            </div>
            <dl className="mt-11 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-7">
              {[['9', 'internship fields'], ['4 / 6 / 8', 'week programs'], ['Weekly', 'reviewed submissions']].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-xl font-extrabold">{v}</dt>
                  <dd className="mt-1 text-[13px] text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <WeekStrip />
        </div>
      </section>

      <section className="wrap py-20">
        <SectionHead
          eyebrow="Nine fields"
          title="Pick the track that matches the work you want to do"
          body="Every field has its own weekly roadmap, its own tasks and its own final project. Roadmaps are published before you pay, so you know exactly what the weeks contain."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAPS.map((f) => (
            <Link key={f.slug} href={`/internships/${f.slug}`}
                  className="card group p-5 transition hover:border-signal/40">
              <h3 className="font-display text-[17px] font-bold">{f.name}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate">{f.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.skills.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-md bg-mist px-2 py-1 text-[12px] font-medium text-slate">{s}</span>
                ))}
              </div>
              <p className="mt-4 text-[13px] font-semibold text-signal group-hover:underline">
                See the weekly roadmap
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-mist/60 py-20">
        <div className="wrap">
          <SectionHead
            eyebrow="How it runs"
            title="Structured, reviewed, and dated from day one"
            body="Your start date sets every deadline in the program. Weeks unlock as you finish them — not on a fixed public calendar."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ['Apply and pay', 'Choose a field and duration, then submit your fee through JazzCash or Easypaisa with a receipt.'],
              ['Get verified', 'An admin checks the payment by hand. Nothing is auto-approved.'],
              ['Work the weeks', 'Your offer letter, dates and week 1 tasks appear as soon as the payment clears.'],
              ['Finish and verify', 'Complete the final project, get scored, and receive a certificate anyone can verify online.'],
            ].map(([title, body], i) => (
              <li key={title} className="card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-[14px] font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-[16px] font-bold">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-20">
        <SectionHead eyebrow="Duration and fee" title="Three program lengths" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {DURATIONS.map((d) => {
            const plan = PLANS[d];
            return (
              <Card key={d} className="flex flex-col p-6">
                <h3 className="font-display text-lg font-bold">{plan.label}</h3>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">{formatPKR(plan.fee)}</p>
                <p className="mt-1 text-[13px] text-slate-light">One-time program fee</p>
                <ul className="mt-5 space-y-2 border-t border-mist pt-5 text-[14px] text-slate">
                  <li>{d - 1} progression weeks plus a final project</li>
                  <li>Weekly tasks reviewed by an evaluator</li>
                  <li>Offer letter on approval, certificate on completion</li>
                </ul>
                <div className="mt-5 rounded-xl bg-mist/70 p-4 text-[13px]">
                  <p className="font-semibold text-ink">Performance rewards</p>
                  <ul className="mt-2 space-y-1 text-slate">
                    {plan.rewards.map((r) => (
                      <li key={r.position}>
                        {['1st', '2nd', '3rd'][r.position - 1]} place — {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button href="/register" className="mt-6 w-full">Apply for {plan.label.toLowerCase()}</Button>
              </Card>
            );
          })}
        </div>
        <p className="prose-narrow mt-7 text-[14px]">
          Performance rewards are based on published evaluation criteria and confirmed after final
          evaluation. They are not guaranteed income and not everyone receives one.
        </p>
      </section>

      <section className="wrap pb-20">
        <Card className="grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:p-10">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Questions before you apply?</h2>
            <p className="prose-narrow mt-3">
              Message HR directly on WhatsApp. You will get an answer from a person, not a bot.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={BRAND.hr.whatsappLink}>Message {BRAND.hr.name}</Button>
              <Button href="/faq" variant="secondary">Read the FAQ</Button>
            </div>
          </div>
          <div className="rounded-xl bg-mist/70 p-5 text-[14px] leading-relaxed">
            <p className="font-semibold text-ink">HR</p>
            <p className="text-slate">{BRAND.hr.name}</p>
            <p className="mt-3 font-semibold text-ink">WhatsApp</p>
            <p className="text-slate">{BRAND.hr.whatsapp}</p>
          </div>
        </Card>
      </section>
    </>
  );
}

/** A static preview of the real progression UI students see in the dashboard. */
function WeekStrip() {
  const weeks = [
    { n: 1, title: 'HTML foundations', state: 'done' },
    { n: 2, title: 'CSS and responsive design', state: 'done' },
    { n: 3, title: 'JavaScript', state: 'active' },
    { n: 4, title: 'Frontend project', state: 'locked' },
    { n: 5, title: 'Working with APIs', state: 'locked' },
  ];
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[.04] p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[15px] font-bold text-white">Web Development · 8 weeks</p>
        <span className="text-[12px] text-white/50">Day 17 of 56</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#38B48E]" style={{ width: '30%' }} />
      </div>
      <ul className="mt-5 space-y-2">
        {weeks.map((w) => (
          <li key={w.n}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                w.state === 'active'
                  ? 'border-[#38B48E]/50 bg-[#38B48E]/10'
                  : 'border-white/10 bg-white/[.03]'
              }`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold ${
              w.state === 'done' ? 'bg-[#38B48E] text-ink'
                : w.state === 'active' ? 'bg-white text-ink' : 'bg-white/10 text-white/40'
            }`}>
              {w.state === 'done' ? '✓' : w.state === 'locked' ? '🔒' : w.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-white">Week {w.n}</span>
              <span className="block truncate text-[12px] text-white/50">{w.title}</span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
              {w.state === 'done' ? 'Complete' : w.state === 'active' ? 'In progress' : 'Locked'}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-relaxed text-white/45">
        Weeks unlock once the previous week's required tasks are approved. Sample view.
      </p>
    </div>
  );
}
