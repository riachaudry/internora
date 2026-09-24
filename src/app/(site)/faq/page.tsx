import { SectionHead, Button } from '@/components/ui';
import { BRAND, formatPKR, PLANS } from '@/lib/brand';

export const metadata = { title: 'FAQ' };

const FAQS: [string, string][] = [
  ['Is this a paid internship?', `No. Internora is a paid-for training program: you pay a one-time fee (${formatPKR(PLANS[4].fee)}, ${formatPKR(PLANS[6].fee)} or ${formatPKR(PLANS[8].fee)} depending on length). The only money that moves toward students is the performance reward for the top three finishers in each duration group, which depends on final evaluation.`],
  ['Is Internora affiliated with a university or the government?', 'No. Internora is an independent private program. It is not accredited, not government-affiliated, and not connected to any university. The certificate records what you completed here.'],
  ['Will this get me a job?', 'It cannot guarantee one. What it gives you is reviewed project work, a final project you can show, and a verifiable record. How far that takes you depends on you and the market.'],
  ['How do I pay?', `Send the exact fee through JazzCash or Easypaisa to ${BRAND.payment.accountName}, number ${BRAND.payment.number}. Then upload the transaction ID, date, amount and screenshot in your dashboard.`],
  ['How long does verification take?', 'Payments are checked by hand, usually within 24 hours. You are notified in the dashboard and by email either way. Nothing is auto-verified.'],
  ['When does my internship start?', 'Admin either starts it immediately on approval or schedules a start date. Your end date, every week window and every task deadline are then calculated from that date.'],
  ['Can I skip ahead to a later week?', 'No. A week unlocks only after at least 70% of the previous week\u2019s required task points are approved. This is enforced on the server, so it cannot be bypassed in the browser.'],
  ['What happens if I miss a deadline?', 'The task is marked overdue. You can still submit it, but an evaluator may score it lower. If a whole week stalls, message support from your dashboard and explain the situation.'],
  ['What file types can I submit?', 'PDF, DOCX, JPG, PNG, ZIP and TXT files up to 25 MB, plus links and written responses. Each task lists what it accepts.'],
  ['How is my final score calculated?', 'Weekly work is 70% and the final project is 30%. Each task is scored out of 100 and weighted by its point value.'],
  ['When do I get my certificate?', 'After every week is marked complete, the final project is approved, and admin issues it. It carries an ID and a public verification page.'],
  ['Who gets a letter of recommendation?', 'The top three finishers in a duration group are eligible. Each LOR is drafted, reviewed and approved by admin before it is issued — they are not generated automatically.'],
  ['Can I change my field or duration after applying?', 'Before your payment is verified, yes — contact HR on WhatsApp. After activation, the roadmap and dates are already generated and a change means starting a new application.'],
  ['Is my data private?', 'Your profile, submissions, payment details and documents are visible only to you and the admin team. Your public profile is off by default; you choose whether to turn it on.'],
];

export default function FaqPage() {
  return (
    <div className="wrap py-16">
      <SectionHead eyebrow="Answers" title="Frequently asked questions" />
      <div className="mt-10 max-w-3xl divide-y divide-mist-deep border-y border-mist-deep">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <h2 className="font-display text-[16px] font-bold">{q}</h2>
              <span className="mt-1 shrink-0 text-slate-light transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-slate">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href={BRAND.hr.whatsappLink}>Ask HR on WhatsApp</Button>
        <Button href="/contact" variant="secondary">Contact page</Button>
      </div>
    </div>
  );
}
