import { Card, Badge, Button } from '@/components/ui';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';
export function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Verify ${params.id}` };
}

export default async function VerifyOfferLetterPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id).trim().toUpperCase();
  const { data } = await createAdminClient()
    .from('offer_letters')
    .select(`public_id, issue_date, status,
             internships!inner(duration, start_date, end_date, status,
               profiles!internships_student_id_fkey(full_name, student_id),
               internship_fields(name))`)
    .eq('public_id', id).maybeSingle();

  if (!data) {
    return (
      <div className="wrap py-16">
        <Card className="max-w-2xl p-8">
          <Badge tone="bad">No record found</Badge>
          <h1 className="mt-4 font-display text-2xl font-extrabold">
            No offer letter matches <span className="font-mono">{id}</span>
          </h1>
          <p className="prose-narrow mt-3">IDs look like INT-OL-2026-000001.</p>
          <Button href="/verify/offer-letter" variant="secondary" className="mt-6">Try another ID</Button>
        </Card>
      </div>
    );
  }

  const internship = (data as any).internships;
  const valid = data.status === 'issued';
  return (
    <div className="wrap py-16">
      <Card className="max-w-3xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone={valid ? 'good' : 'bad'}>{valid ? 'Valid offer letter' : 'Revoked'}</Badge>
          <span className="font-mono text-[13px] text-slate-light">{data.public_id}</span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold">{internship.profiles.full_name}</h1>
        <p className="mt-2 text-[16px] text-slate">
          was offered a place in the {internship.duration}-week {internship.internship_fields?.name} project-based
          virtual internship at Internora.
        </p>
        <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-mist/60 p-6 sm:grid-cols-3">
          {[
            ['Student ID', internship.profiles.student_id],
            ['Duration', `${internship.duration} weeks`],
            ['Issue date', shortDate(data.issue_date)],
            ['Start date', shortDate(internship.start_date)],
            ['End date', shortDate(internship.end_date)],
            ['Internship status', internship.status],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-[11px] font-semibold text-slate-light">{k}</dt>
              <dd className="mt-0.5 text-[15px] font-semibold capitalize text-ink">{v as string}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
