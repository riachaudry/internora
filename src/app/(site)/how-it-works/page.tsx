import { Button, Card, SectionHead, Alert } from '@/components/ui';
import { BRAND } from '@/lib/brand';

export const metadata = { title: 'How it works' };

const STEPS = [
  ['Register', 'Create an account with your real details, upload a profile photo and complete your profile. Your student ID is generated automatically.'],
  ['Choose a field and duration', 'Pick one of nine fields and a 4, 6 or 8-week program. The fee for your chosen length appears on the payment page automatically.'],
  ['Submit your payment', 'Send the exact fee through JazzCash or Easypaisa to the account shown, then upload the transaction ID, date, amount and screenshot.'],
  ['Wait for verification', 'An admin checks the payment manually against the receipt. Nothing is verified automatically. You will be notified either way.'],
  ['Receive your offer letter', 'On approval your internship activates, your start and end dates are calculated, and your offer letter is issued with its own ID.'],
  ['Work through the weeks', 'Week 1 opens immediately. Each week lists objectives, tasks, points and deadlines calculated from your start date.'],
  ['Submit and get reviewed', 'Upload files, paste links or write your response. An evaluator approves, scores, or asks for a revision with written feedback.'],
  ['Unlock the next week', 'When enough of the current week\u2019s required tasks are approved, the next week unlocks automatically. This is enforced on the server.'],
  ['Final project and evaluation', 'The final week is a complete project. Your final score is 70% weekly work and 30% final project.'],
  ['Certificate, LOR and rewards', 'Meet the published completion criteria and your certificate is issued with a public verification link. The top three in each group are confirmed by admin for performance rewards.'],
];

export default function HowItWorksPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="End to end"
        title="How an Internora internship actually runs"
        body="Ten steps from registration to a verifiable certificate. Every date in the program is calculated from your own start date."
      />

      <ol className="mt-10 space-y-3">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-[13px] font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-[16px] font-bold">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">How weeks unlock</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            A week completes when at least 70% of its required task points have been approved by an
            evaluator. Only then does the next week open. Skipping ahead is not possible —
            locked weeks are enforced by the database, not hidden in the browser.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">How scoring works</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Each task carries points. Your weekly score is the share of task points earned across
            the progression weeks, worth 70%. The final project is worth 30%. Together they form
            the overall score used for the certificate and the leaderboard.
          </p>
        </Card>
      </div>

      <Alert tone="info" title="Before you apply" >
        <p className="mt-1">
          This is a project-based virtual internship program. It is not a job, an accredited
          qualification, or a guarantee of employment. Performance rewards are subject to
          eligibility and final evaluation.
        </p>
      </Alert>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/register" size="lg">Apply now</Button>
        <Button href={BRAND.hr.whatsappLink} variant="secondary" size="lg">Ask HR on WhatsApp</Button>
      </div>
    </div>
  );
}
