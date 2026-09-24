import { Card, SectionHead, Alert, Button } from '@/components/ui';
import { BRAND } from '@/lib/brand';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="About Internora"
        title="Structured practice, reviewed by a person"
        body="Internora runs project-based virtual internships for students, fresh graduates and career changers. The programs exist to close one specific gap: people finish a degree or a course and still have nothing concrete to show an employer."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">What we do</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            You choose a field and a length, then work through a published roadmap of weekly tasks.
            Every task has a defined deliverable. Every submission is reviewed by an evaluator who
            approves it, scores it, or sends it back with written feedback. At the end you have a
            final project, a score, and a certificate that anyone can verify from a public link.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">What we are not</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Internora is an independent private training program. It is not affiliated with any
            government body or university, it is not an accredited institution, and it does not
            place people into jobs. Completing a program gives you reviewed project work and a
            verifiable record of it — nothing more, and nothing less.
          </p>
        </Card>
      </div>

      <h2 className="mt-14 font-display text-2xl font-extrabold">How the program is designed</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ['Published before you pay', 'Every roadmap, task, deadline rule and scoring weight is on the public site before anyone pays a fee.'],
          ['Reviewed, not automated', 'Payments are verified by hand. Submissions are scored by a person. Nothing is approved by a script.'],
          ['Verifiable afterwards', 'Certificates carry an ID and a public verification page, so an employer can confirm a claim in one click.'],
        ].map(([t, b]) => (
          <Card key={t} className="p-5">
            <h3 className="font-display text-[16px] font-bold">{t}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate">{b}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-12 grid gap-6 p-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-bold">Who runs it</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Applications, payment verification, evaluations and documents are handled by HR
            directly. If something in your program is unclear, message HR on WhatsApp — you will
            get an answer from a person.
          </p>
          <Button href={BRAND.hr.whatsappLink} className="mt-5">Message {BRAND.hr.name}</Button>
        </div>
        <div className="rounded-xl bg-mist/70 p-5 text-[15px]">
          <p className="font-semibold text-ink">HR</p>
          <p className="text-slate">{BRAND.hr.name}</p>
          <p className="mt-3 font-semibold text-ink">WhatsApp</p>
          <p className="text-slate">{BRAND.hr.whatsapp}</p>
        </div>
      </Card>

      <Alert tone="info" title="Our commitments to you">
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          <li>This is a project-based virtual internship program.</li>
          <li>Performance rewards are subject to eligibility and final evaluation.</li>
          <li>Certificates are issued after meeting the published completion criteria.</li>
          <li>LORs are issued according to performance and eligibility.</li>
        </ul>
      </Alert>
    </div>
  );
}
