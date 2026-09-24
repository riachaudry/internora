import { Card, SectionHead, Alert, Table } from '@/components/ui';
import { PLANS, DURATIONS, formatPKR } from '@/lib/brand';

export const metadata = { title: 'Performance rewards' };

export default function RewardsPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="Recognition for top performers"
        title="Performance rewards"
        body="At the end of each program, the three highest overall scores in a duration group are confirmed by admin and receive a performance reward. Rewards recognise finished, reviewed work — they are not income and not everyone receives one."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {DURATIONS.map((d) => (
          <Card key={d} className="p-6">
            <h2 className="font-display text-lg font-bold">{PLANS[d].label}</h2>
            <p className="mt-1 text-[13px] text-slate-light">Fee {formatPKR(PLANS[d].fee)}</p>
            <ul className="mt-5 space-y-3 border-t border-mist pt-4">
              {PLANS[d].rewards.map((r) => (
                <li key={r.position} className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-slate">
                    {['1st', '2nd', '3rd'][r.position - 1]} place
                  </span>
                  <span className="rounded-lg bg-signal-light px-2.5 py-1 text-[13px] font-semibold text-signal-dark">
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">How the ranking is calculated</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Your overall score is 70% weekly work and 30% final project. Weekly work is the share of
            task points you earned across the progression weeks; each task is scored out of 100 by an
            evaluator and weighted by its point value.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate">
            Ties are broken by completion date — the student who finished earlier ranks higher.
            Admin confirms the final ranking before any reward is approved.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">Eligibility</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate">
            <li>Every required task submitted and reviewed</li>
            <li>Every week marked complete</li>
            <li>Final project approved</li>
            <li>Original work only — plagiarised submissions are rejected</li>
            <li>Ranking confirmed by admin after final evaluation</li>
          </ul>
        </Card>
      </div>

      <h3 className="mt-12 font-display text-lg font-bold">Reward status at a glance</h3>
      <div className="mt-4">
        <Table head={['Status', 'What it means']}>
          {[
            ['Pending', 'Final evaluation has not been completed for your group yet.'],
            ['Eligible', 'You placed in the top three and are awaiting admin confirmation.'],
            ['Approved', 'Admin confirmed the reward. HR will contact you on WhatsApp to arrange the transfer.'],
            ['Paid', 'The reward has been transferred and the reference is recorded against your record.'],
            ['Not eligible', 'You did not place in the top three, or an eligibility condition was not met.'],
          ].map(([s, m]) => (
            <tr key={s}>
              <td className="px-4 py-3 font-semibold text-ink">{s}</td>
              <td className="px-4 py-3 text-slate">{m}</td>
            </tr>
          ))}
        </Table>
      </div>

      <Alert tone="warn" title="Please read">
        <p className="mt-1">
          Performance rewards are subject to eligibility and final evaluation. Internora does not
          promise guaranteed income, guaranteed rewards for every participant, or employment.
        </p>
      </Alert>
    </div>
  );
}
