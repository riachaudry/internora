import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { shortDate } from '@/lib/dates';
import { Card, SectionHead, EmptyState, Button, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Step = { label: string; date?: string | null; state: 'done' | 'active' | 'locked'; note?: string };

export default async function TimelinePage() {
  const profile = await requireStudent();
  const { application, payment, internship, weeks, docs } = await loadStudentState(profile.id);

  if (!application) {
    return <EmptyState title="Nothing on your timeline yet"
                       body="Your timeline fills in from real database dates as you move through the program."
                       action={<Button href="/dashboard/apply">Apply now</Button>} />;
  }

  const steps: Step[] = [
    { label: 'Application submitted', date: application.applied_at, state: 'done' },
    {
      label: 'Payment verified',
      date: payment?.verified_at,
      state: payment?.status === 'verified' ? 'done' : payment ? 'active' : 'locked',
      note: payment && payment.status !== 'verified' ? `Currently: ${payment.status.replace(/_/g, ' ')}` : undefined,
    },
    { label: 'Offer letter issued', date: docs?.offer?.issue_date, state: docs?.offer ? 'done' : 'locked' },
    { label: 'Internship started', date: internship?.start_date, state: internship?.start_date ? 'done' : 'locked' },
    ...weeks.map((w) => ({
      label: w.is_final ? 'Final project' : `Week ${w.week_number} — ${w.title}`,
      date: w.start_date,
      state: (w.status === 'completed' ? 'done' : w.status === 'active' ? 'active' : 'locked') as Step['state'],
      note: `${shortDate(w.start_date)} — ${shortDate(w.end_date)}`,
    })),
    { label: 'Final evaluation', date: internship?.completed_at, state: internship?.status === 'completed' ? 'done' : 'locked' },
    { label: 'Certificate issued', date: docs?.certificate?.issue_date, state: docs?.certificate ? 'done' : 'locked' },
    { label: 'Letter of recommendation', date: docs?.lor?.issue_date, state: docs?.lor?.status === 'issued' ? 'done' : 'locked' },
    { label: 'Performance reward', date: docs?.reward?.payment_date, state: docs?.reward?.status === 'paid' ? 'done' : 'locked' },
  ];

  return (
    <div className="space-y-6">
      <SectionHead title="My internship timeline"
                   body="Every date here comes from the database — nothing is a placeholder." />
      <Card className="p-6">
        <ol className="relative space-y-6 border-l-2 border-mist pl-6">
          {steps.map((s, i) => (
            <li key={`${s.label}-${i}`} className="relative">
              <span aria-hidden="true"
                    className={`absolute -left-[31px] top-1 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${
                      s.state === 'done' ? 'bg-signal text-white'
                      : s.state === 'active' ? 'bg-ink text-white'
                      : 'bg-mist text-slate-light'}`}>
                {s.state === 'done' ? '✓' : s.state === 'active' ? '●' : '🔒'}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`text-[15px] font-semibold ${s.state === 'locked' ? 'text-slate-light' : 'text-ink'}`}>
                  {s.label}
                </p>
                {s.date ? (
                  <span className="text-[13px] text-slate-light">{shortDate(s.date)}</span>
                ) : (
                  <Badge>Pending</Badge>
                )}
              </div>
              {s.note && <p className="mt-0.5 text-[13px] text-slate-light">{s.note}</p>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
