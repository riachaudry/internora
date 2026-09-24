import { DocumentSheet, Field } from './DocumentShell';
import { shortDate } from '@/lib/dates';

export type CertificateData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number;
  startDate: string; endDate: string;
  overallScore: number; status: 'issued' | 'revoked';
};

export function Certificate({ data, verifyUrl }: { data: CertificateData; verifyUrl?: string }) {
  return (
    <DocumentSheet docTitle="CERTIFICATE OF INTERNSHIP" docId={data.publicId} issueDate={shortDate(data.issueDate)}>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-signal">Certificate of Internship</p>
        <p className="mt-6 text-[14px] text-slate">This certifies that</p>
        <h1 className="mt-2 font-display text-[2.4rem] font-extrabold leading-tight text-ink">{data.studentName}</h1>
        <p className="mx-auto mt-4 max-w-[60ch] text-[15px] leading-relaxed text-slate">
          has successfully completed the <strong className="text-ink">{data.field}</strong> project-based
          virtual internship at Internora, a {data.duration}-week program running from{' '}
          {shortDate(data.startDate)} to {shortDate(data.endDate)}, meeting the published completion
          criteria with an overall score of <strong className="text-ink">{data.overallScore}</strong>.
        </p>
      </div>

      <dl className="mx-auto mt-9 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-mist/60 p-6 sm:grid-cols-3">
        <Field label="Student ID" value={<span className="font-mono">{data.studentCode}</span>} />
        <Field label="Certificate ID" value={<span className="font-mono">{data.publicId}</span>} />
        <Field label="Duration" value={`${data.duration} weeks`} />
        <Field label="Start date" value={shortDate(data.startDate)} />
        <Field label="End date" value={shortDate(data.endDate)} />
        <Field label="Overall score" value={`${data.overallScore} / 100`} />
      </dl>

      {data.status === 'revoked' && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl bg-danger-light px-5 py-3 text-center text-[14px] font-semibold text-danger">
          This certificate has been revoked and is no longer valid.
        </p>
      )}

      {verifyUrl && (
        <p className="mt-8 text-center text-[12px] text-slate-light">
          Verify this certificate at {verifyUrl}
        </p>
      )}
    </DocumentSheet>
  );
}
