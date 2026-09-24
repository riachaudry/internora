import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, Badge, Progress } from '@/components/ui';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';
export function generateMetadata({ params }: { params: { username: string } }) {
  return { title: `${params.username} · Public profile` };
}

/**
 * Public profile. Only rendered when the student turned public_profile on, and
 * only ever shows the fields below — never email, phone, WhatsApp, date of
 * birth, payments or submissions.
 */
export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const db = createAdminClient();

  const { data: profile } = await db.from('profiles')
    .select('id, full_name, student_id, username, avatar_url, bio, skills, education_level, university, field_of_study, city, country, linkedin_url, portfolio_url, public_profile')
    .eq('username', params.username).eq('public_profile', true).maybeSingle();
  if (!profile) notFound();

  const { data: internships } = await db.from('internships')
    .select('id, duration, status, overall_score, start_date, end_date, internship_fields(name)')
    .eq('student_id', profile.id).order('start_date', { ascending: false });

  const { data: certificates } = await db.from('certificates')
    .select('public_id, issue_date, overall_score, status, internships!inner(student_id, duration, internship_fields(name))')
    .eq('internships.student_id', profile.id).eq('status', 'issued');

  const { data: rewards } = await db.from('rewards')
    .select('position, duration, status').eq('student_id', profile.id).in('status', ['approved', 'paid']);

  return (
    <div className="wrap py-16">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6 text-center">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={112} height={112}
                     className="mx-auto h-28 w-28 rounded-full object-cover" />
            ) : (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-mist font-display text-3xl font-extrabold text-slate">
                {profile.full_name.charAt(0)}
              </div>
            )}
            <h1 className="mt-4 font-display text-xl font-extrabold">{profile.full_name}</h1>
            <p className="mt-1 font-mono text-[12px] text-slate-light">{profile.student_id}</p>
            {profile.bio && <p className="mt-4 text-[14px] leading-relaxed text-slate">{profile.bio}</p>}

            <dl className="mt-5 space-y-2 border-t border-mist pt-4 text-left text-[14px]">
              {[['Education', profile.education_level], ['Institute', profile.university],
                ['Field of study', profile.field_of_study],
                ['Location', [profile.city, profile.country].filter(Boolean).join(', ')]]
                .filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[12px] text-slate-light">{k}</dt>
                  <dd className="font-medium text-ink">{v as string}</dd>
                </div>
              ))}
            </dl>

            {(profile.linkedin_url || profile.portfolio_url) && (
              <div className="mt-4 flex flex-col gap-1.5 border-t border-mist pt-4 text-[14px]">
                {profile.linkedin_url && <a href={profile.linkedin_url} rel="nofollow noopener" className="font-semibold text-signal hover:underline">LinkedIn</a>}
                {profile.portfolio_url && <a href={profile.portfolio_url} rel="nofollow noopener" className="font-semibold text-signal hover:underline">Portfolio</a>}
              </div>
            )}
          </Card>
        </aside>

        <div className="space-y-6">
          {!!profile.skills?.length && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.skills.map((s: string) => (
                  <span key={s} className="rounded-md bg-mist px-2.5 py-1 text-[13px] font-medium text-slate">{s}</span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold">Internship history</h2>
            {internships?.length ? (
              <ul className="mt-4 space-y-4">
                {internships.map((i: any) => (
                  <li key={i.id} className="border-t border-mist pt-4 first:border-0 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-[16px] font-bold">{i.internship_fields?.name}</p>
                      <Badge tone={i.status === 'completed' ? 'good' : 'info'}>
                        {i.status === 'completed' ? 'Completed' : 'In progress'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-slate-light">
                      {i.duration} weeks · {shortDate(i.start_date)} – {shortDate(i.end_date)}
                    </p>
                    {i.status === 'completed' && (
                      <div className="mt-3 max-w-xs">
                        <Progress value={Number(i.overall_score)} label="Overall score" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-[15px] text-slate">No internships to show yet.</p>}
          </Card>

          {!!certificates?.length && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Certificates</h2>
              <ul className="mt-4 space-y-3">
                {certificates.map((c: any) => (
                  <li key={c.public_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist/60 px-4 py-3">
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{c.internships?.internship_fields?.name}</p>
                      <p className="font-mono text-[12px] text-slate-light">{c.public_id}</p>
                    </div>
                    <a href={`/verify/certificate/${c.public_id}`}
                       className="text-[13px] font-semibold text-signal hover:underline">Verify</a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {!!rewards?.length && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Achievements</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {rewards.map((r: any, idx: number) => (
                  <li key={idx}>
                    <Badge tone="warn">
                      Position {r.position} — {r.duration}-week program
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
