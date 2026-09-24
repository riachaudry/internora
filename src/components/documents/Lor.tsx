import { DocumentSheet, Field } from './DocumentShell';
import { shortDate } from '@/lib/dates';

export type LorData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number; position: number;
  performance: string; skills: string[]; achievements: string; recommendation: string;
};

export function Lor({ data }: { data: LorData }) {
  return (
    <DocumentSheet docTitle="LETTER OF RECOMMENDATION" docId={data.publicId} issueDate={shortDate(data.issueDate)}>
      <h1 className="font-display text-2xl font-extrabold">Letter of Recommendation</h1>
      <p className="mt-5 text-[15px] text-slate">To whom it may concern,</p>

      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-slate">
        I am writing to recommend <strong className="text-ink">{data.studentName}</strong>, who completed
        the {data.duration}-week <strong className="text-ink">{data.field}</strong> project-based virtual
        internship at Internora and finished at position <strong className="text-ink">{data.position}</strong> in
        their group.
      </p>

      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-slate">{data.performance}</p>

      {!!data.skills.length && (
        <>
          <p className="mt-6 text-[13px] font-semibold text-ink">Demonstrated skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span key={s} className="rounded-md bg-mist px-2.5 py-1 text-[13px] font-medium text-slate">{s}</span>
            ))}
          </div>
        </>
      )}

      {data.achievements && (
        <>
          <p className="mt-6 text-[13px] font-semibold text-ink">Achievements</p>
          <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-slate">{data.achievements}</p>
        </>
      )}

      <p className="mt-6 max-w-[68ch] text-[15px] leading-relaxed text-slate">{data.recommendation}</p>

      <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-mist/60 p-6 sm:grid-cols-4">
        <Field label="Student ID" value={<span className="font-mono">{data.studentCode}</span>} />
        <Field label="LOR ID" value={<span className="font-mono">{data.publicId}</span>} />
        <Field label="Field" value={data.field} />
        <Field label="Position" value={`${data.position} of group`} />
      </dl>
    </DocumentSheet>
  );
}
