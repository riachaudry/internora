import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { Certificate } from '@/components/documents/Certificate';
import { PrintButton } from '@/components/documents/DocumentShell';
import { SectionHead, EmptyState, Button, StatusBadge, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function CertificatePage() {
  const profile = await requireStudent();
  const { internship, weeks, docs } = await loadStudentState(profile.id);
  const cert = docs?.certificate;

  if (!cert) {
    const done = weeks.filter((w) => w.status === 'completed').length;
    return (
      <div className="space-y-5">
        <SectionHead title="Certificate" />
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Not issued yet</h2>
          <p className="prose-narrow mt-2 text-[15px]">
            Certificates are issued after meeting the published completion criteria: every week completed,
            the final project approved, and a final evaluation recorded by an admin.
          </p>
          {internship && (
            <p className="mt-4 text-[14px] font-semibold text-ink">
              Weeks completed: {done} of {weeks.length}
            </p>
          )}
          <div className="mt-5">
            <Button href="/dashboard/roadmap">Open my roadmap</Button>
          </div>
        </Card>
      </div>
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <SectionHead title="Certificate of internship" body={`Certificate ID ${cert.public_id}`} />
        <div className="flex items-center gap-3">
          <StatusBadge status={cert.status} />
          <PrintButton />
        </div>
      </div>

      <Certificate
        data={{
          publicId: cert.public_id,
          issueDate: cert.issue_date,
          studentName: profile.full_name,
          studentCode: profile.student_id ?? '—',
          field: (internship!.internship_fields as any)?.name ?? '—',
          duration: internship!.duration,
          startDate: internship!.start_date!,
          endDate: internship!.end_date!,
          overallScore: Number(cert.overall_score),
          status: cert.status as 'issued' | 'revoked',
        }}
        verifyUrl={`${site}/verify/certificate/${cert.public_id}`}
      />

      <p className="no-print text-center text-[13px] text-slate-light">
        Anyone can verify this at /verify/certificate/{cert.public_id}
      </p>
    </div>
  );
}
