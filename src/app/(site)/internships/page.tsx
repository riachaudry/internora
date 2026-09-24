import Link from 'next/link';
import { SectionHead, Card } from '@/components/ui';
import { ROADMAPS } from '@/lib/roadmaps';
import { PLANS, DURATIONS, formatPKR } from '@/lib/brand';

export const metadata = { title: 'Internships' };

export default function InternshipsPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="Nine fields, three durations"
        title="Choose your internship field"
        body="Each field publishes its full weekly roadmap, the tasks inside each week and the final project before you apply. A 4-week program runs the first three progression weeks plus the final project; 6 and 8-week programs go further into the track."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {ROADMAPS.map((f) => (
          <Card key={f.slug} className="flex flex-col p-6">
            <h2 className="font-display text-xl font-bold">{f.name}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">{f.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {f.skills.map((s) => (
                <span key={s} className="rounded-md bg-mist px-2 py-1 text-[12px] font-medium text-slate">{s}</span>
              ))}
            </div>
            <ul className="mt-5 space-y-1.5 border-t border-mist pt-4 text-[14px] text-slate">
              {f.weeks.slice(0, 3).map((w, i) => (
                <li key={w.title}><span className="font-semibold text-ink">Week {i + 1}</span> — {w.title}</li>
              ))}
              <li className="text-slate-light">…plus the final project week</li>
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-mist pt-4">
              <span className="text-[13px] text-slate-light">
                {DURATIONS.map((d) => `${d}w ${formatPKR(PLANS[d].fee)}`).join(' · ')}
              </span>
              <Link href={`/internships/${f.slug}`} className="text-[14px] font-semibold text-signal hover:underline">
                Full roadmap
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
