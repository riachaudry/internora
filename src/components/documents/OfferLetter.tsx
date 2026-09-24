import { DocumentSheet, Field } from './DocumentShell';
import { shortDate } from '@/lib/dates';

export type OfferLetterData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number;
  startDate: string; endDate: string;
};

export function OfferLetter({ data }: { data: OfferLetterData }) {
  return (
    <DocumentSheet docTitle="OFFER LETTER" docId={data.publicId} issueDate={shortDate(data.issueDate)}>
      <h1 className="font-display text-2xl font-extrabold">Internship Offer Letter</h1>
      <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed text-slate">
        Dear <strong className="text-ink">{data.studentName}</strong>,
      </p>
      <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-slate">
        We are pleased to confirm your place in the <strong className="text-ink">{data.field}</strong> project-based
        virtual internship at Internora, for a duration of <strong className="text-ink">{data.duration} weeks</strong>.
        Your program runs from {shortDate(data.startDate)} to {shortDate(data.endDate)}.
      </p>
      <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-slate">
        During the program you will work through a published weekly roadmap of practical tasks.
        Each submission is reviewed and scored by an evaluator, and each week unlocks once the
        previous week&rsquo;s required work is approved. On meeting the published completion criteria
        you will receive a certificate with a public verification link.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-mist/60 p-6 sm:grid-cols-3">
        <Field label="Student name" value={data.studentName} />
        <Field label="Student ID" value={<span className="font-mono">{data.studentCode}</span>} />
        <Field label="Offer letter ID" value={<span className="font-mono">{data.publicId}</span>} />
        <Field label="Internship field" value={data.field} />
        <Field label="Duration" value={`${data.duration} weeks`} />
        <Field label="Issue date" value={shortDate(data.issueDate)} />
        <Field label="Start date" value={shortDate(data.startDate)} />
        <Field label="End date" value={shortDate(data.endDate)} />
        <Field label="Mode" value="Online / Virtual" />
        <Field label="Internship type" value="Project-Based Internship" />
      </dl>

      <p className="mt-7 max-w-[68ch] text-[14px] leading-relaxed text-slate">
        This offer covers participation in a training program. It is not an offer of employment and
        carries no salary, stipend or guarantee of future employment. Performance rewards, where
        applicable, are subject to eligibility and final evaluation.
      </p>
    </DocumentSheet>
  );
}
