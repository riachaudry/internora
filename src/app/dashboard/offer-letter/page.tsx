import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { OfferLetter } from '@/components/documents/OfferLetter';
import { PrintButton } from '@/components/documents/DocumentShell';
import { SectionHead, EmptyState, Button, StatusBadge, Alert } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function OfferLetterPage() {
  const profile = await requireStudent();
  const { internship, docs } = await loadStudentState(profile.id);
  const offer = docs?.offer;

  if (!internship || !offer) {
    return <EmptyState title="Offer letter not issued yet"
                       body="Your offer letter is generated automatically once an admin verifies your payment and activates the internship."
                       action={<Button href="/dashboard/payment">Payment status</Button>} />;
  }

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <SectionHead title="Offer letter" body={`Offer Letter ID ${offer.public_id}`} />
        <div className="flex items-center gap-3">
          <StatusBadge status={offer.status} />
          <PrintButton />
        </div>
      </div>

      {offer.status === 'revoked' && (
        <Alert tone="bad" title="This offer letter has been revoked">
          Contact HR on WhatsApp if you believe this is a mistake.
        </Alert>
      )}

      <OfferLetter data={{
        publicId: offer.public_id,
        issueDate: offer.issue_date,
        studentName: profile.full_name,
        studentCode: profile.student_id ?? '—',
        field: (internship.internship_fields as any)?.name ?? '—',
        duration: internship.duration,
        startDate: internship.start_date!,
        endDate: internship.end_date!,
      }} />

      <p className="no-print text-center text-[13px] text-slate-light">
        Verify publicly at /verify/offer-letter/{offer.public_id}
      </p>
    </div>
  );
}
