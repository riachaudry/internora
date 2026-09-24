import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { Avatar } from '@/components/portal/Avatar';
import { SectionHead, Table, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireAdmin();
  const db = createAdminClient();
  const q = (searchParams.q ?? '').trim();

  let query = db.from('profiles')
    .select('id, full_name, email, student_id, username, avatar_url, city, university, created_at, is_demo')
    .eq('role', 'student').order('created_at', { ascending: false }).limit(200);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,student_id.ilike.%${q}%`);

  const { data: students } = await query;

  const ids = (students ?? []).map((s) => s.id);
  const { data: internships } = ids.length
    ? await db.from('internships')
        .select('student_id, status, duration, overall_score, internship_fields(name)')
        .in('student_id', ids)
    : { data: [] as any[] };

  return (
    <div className="space-y-5">
      <SectionHead title="Students" body={`${students?.length ?? 0} accounts${q ? ` matching “${q}”` : ''}.`} />

      <form className="flex gap-2" action="/admin/students">
        <input name="q" defaultValue={q} placeholder="Search name, email or student ID"
               className="w-full max-w-md rounded-xl border border-mist-deep px-3.5 py-2.5 text-[15px] focus:border-signal focus:outline-none" />
        <button className="rounded-xl bg-ink px-4 text-[14px] font-semibold text-white">Search</button>
      </form>

      {students?.length ? (
        <Table head={['Student', 'Student ID', 'Internship', 'Score', 'Joined', '']}>
          {students.map((s) => {
            const i = (internships ?? []).find((x: any) => x.student_id === s.id);
            return (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar url={s.avatar_url} name={s.full_name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {s.full_name} {s.is_demo && <Badge>Demo</Badge>}
                      </p>
                      <p className="truncate text-[12px] text-slate-light">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12.5px] text-slate">{s.student_id}</td>
                <td className="px-4 py-3 text-slate">
                  {i ? `${(i as any).internship_fields?.name ?? '—'} · ${i.duration}w` : '—'}
                  {i && <div className="text-[12px] text-slate-light">{i.status}</div>}
                </td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {i ? Number(i.overall_score ?? 0).toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-slate">{shortDate(s.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {s.username && (
                    <Link href={`/profile/${s.username}`} target="_blank"
                          className="text-[13px] font-semibold text-signal">Profile</Link>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      ) : (
        <EmptyState title="No students found" body="Nothing matches that search." />
      )}
    </div>
  );
}
