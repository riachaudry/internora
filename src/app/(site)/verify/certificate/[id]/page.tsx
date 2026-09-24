import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { hashIp } from '@/lib/ids';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Verify ${params.id}` };
}

/**
 * Public verification. Reveals only what an employer needs to confirm a claim:
 * name, field, duration, dates, score and status. No contact details, no
 * submissions, no payment information.
 */
export default async function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id).trim().toUpperCase();
  const db = createAdminClient();

  const { data } = await db
    .from('certificates')
    .select(`id, public_id, issue_date, overall_score, status,
             internships!inner(duration, start_date, end_date,
               profiles!internships_student_id_fkey(full_name, student_id),
               internship_fields(name))`)
    .eq('public_id', id)
    .maybeSingle();

  const ip = headers().get('x-forwarded-for')?.split(',')[0] ?? '';
  await db.from('certificate_verifications').insert({
    certificate_id: (data as any)?.id ?? null,
    queried_id: id, found: !!data, ip_hash: ip ? hashIp(ip) : null,
  });

  if (!data) {
    return (
      <div className="wrap py-16">
        <Card className="max-w-2xl p-8">
          <Badge tone="bad">No record found</Badge>
          <h1 className="mt-4 font-display text-2xl font-extrabold">
            No certificate matches <span className="font-mono">{id}</span>
          </h1>
          <p className="prose-narrow mt-3">
            Check the ID against the printed certificate — they look like INT-CERT-2026-000001.
            If the ID is correct and this page still shows nothing, the document was not issued by Internora.
          </p>
          <Button href="/verify/certificate" variant="secondary" className="mt-6">Try another ID</Button>
        </Card>
      </div>
    );
  }

  const internship = (data as any).internships;
  const student = internship.profiles;
  const valid = data.status === 'issued';

  return (
    <div className="wrap py-16">
      <Card className="max-w-3xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone={valid ? 'good' : 'bad'}>{valid ? 'Valid certificate' : 'Revoked'}</Badge>
          <span className="font-mono text-[13px] text-slate-light">{data.public_id}</span>
        </div>

        <h1 className="mt-5 font-display text-3xl font-extrabold">{student.full_name}</h1>
        <p className="mt-2 text-[16px] text-slate">
          completed the {internship.duration}-week {internship.internship_fields?.name} project-based
          virtual internship at Internora.
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-mist/60 p-6 sm:grid-cols-3">
          {[
            ['Student ID', student.student_id],
            ['Internship', internship.internship_fields?.name],
            ['Duration', `${internship.duration} weeks`],
            ['Start date', shortDate(internship.start_date)],
            ['End date', shortDate(internship.end_date)],
            ['Issue date', shortDate(data.issue_date)],
            ['Overall score', `${data.overall_score} / 100`],
            ['Status', valid ? 'Valid' : 'Revoked'],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-[11px] font-semibold text-slate-light">{k}</dt>
              <dd className="mt-0.5 text-[15px] font-semibold text-ink">{v as string}</dd>
            </div>
          ))}
        </dl>

        {!valid && (
          <p className="mt-5 rounded-xl bg-danger-light px-5 py-3 text-[14px] font-semibold text-danger">
            This certificate has been revoked by Internora and should not be accepted as valid.
          </p>
        )}

        <p className="mt-6 text-[13px] leading-relaxed text-slate-light">
          Internora is an independent private training program. This certificate records completion
          of a project-based virtual internship and is not an accredited qualification.
          <Link href="/verify" className="ml-1 font-semibold text-signal hover:underline">Verify another document</Link>
        </p>
      </Card>
    </div>
  );
}
