import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { longDate, shortDate } from '@/lib/dates';
import { formatPKR } from '@/lib/brand';
import { Card, StatCard, SectionHead, Button, StatusBadge, Table, Alert } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const profile = await requireAdmin();
  const db = createAdminClient();

  const [
    students, applications, pendingPayments, verifiedPayments,
    activeInternships, completedInternships, pendingReviews, openTickets,
  ] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    db.from('applications').select('id', { count: 'exact', head: true }),
    db.from('payments').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_verification']),
    db.from('payments').select('amount_pkr').eq('status', 'verified'),
    db.from('internships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('internships').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    db.from('submissions').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
    db.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const verifiedTotal = (verifiedPayments.data ?? []).reduce((s, p) => s + (p.amount_pkr ?? 0), 0);

  const [{ data: latestPayments }, { data: latestSubmissions }, { data: latestApplications }] = await Promise.all([
    db.from('payments')
      .select('id, amount_pkr, method, transaction_id, status, created_at, profiles!payments_student_id_fkey(full_name, student_id)')
      .order('created_at', { ascending: false }).limit(6),
    db.from('submissions')
      .select('id, status, submitted_at, internship_tasks(title, task_code), profiles!submissions_student_id_fkey(full_name)')
      .in('status', ['submitted', 'under_review'])
      .order('submitted_at', { ascending: false }).limit(6),
    db.from('applications')
      .select('id, duration, status, applied_at, internship_fields(name), profiles!applications_student_id_fkey(full_name, student_id)')
      .order('applied_at', { ascending: false }).limit(6),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead eyebrow={longDate()} title={`Welcome back, ${profile.full_name.split(' ')[0]}`}
                     body="Everything waiting on an admin decision is listed below. Nothing progresses automatically." />
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/payments" size="sm">Verify payments</Button>
          <Button href="/admin/submissions" size="sm" variant="secondary">Review submissions</Button>
        </div>
      </div>

      {(pendingPayments.count ?? 0) > 0 && (
        <Alert tone="warn" title={`${pendingPayments.count} payment${pendingPayments.count === 1 ? '' : 's'} waiting for verification`}>
          <p className="mt-1">
            An internship only activates when a payment is verified here, so students are blocked until you look.
          </p>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={students.count ?? 0} />
        <StatCard label="Applications" value={applications.count ?? 0} />
        <StatCard label="Payments to verify" value={pendingPayments.count ?? 0} tone={(pendingPayments.count ?? 0) > 0 ? 'warn' : 'neutral'} />
        <StatCard label="Verified payments" value={formatPKR(verifiedTotal)} hint="Total received" tone="accent" />
        <StatCard label="Active internships" value={activeInternships.count ?? 0} />
        <StatCard label="Completed" value={completedInternships.count ?? 0} />
        <StatCard label="Submissions to review" value={pendingReviews.count ?? 0} tone={(pendingReviews.count ?? 0) > 0 ? 'warn' : 'neutral'} />
        <StatCard label="Open tickets" value={openTickets.count ?? 0} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-mist px-5 py-4">
            <h2 className="font-display text-[15px] font-bold text-ink">Latest payments</h2>
            <Link href="/admin/payments" className="text-[13px] font-semibold text-signal">All payments</Link>
          </div>
          <Table head={['Student', 'Amount', 'Status']}>
            {(latestPayments ?? []).map((p) => {
              const student = (p as any).profiles;
              return (
                <tr key={p.id} className="border-t border-mist">
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-semibold text-ink">{student?.full_name ?? '—'}</p>
                    <p className="font-mono text-[11.5px] text-slate-light">{p.transaction_id}</p>
                  </td>
                  <td className="px-4 py-3 text-[13.5px] text-slate">{formatPKR(p.amount_pkr)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              );
            })}
            {!latestPayments?.length && (
              <tr><td className="px-4 py-6 text-[14px] text-slate-light" colSpan={3}>No payments yet.</td></tr>
            )}
          </Table>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-mist px-5 py-4">
            <h2 className="font-display text-[15px] font-bold text-ink">Waiting for review</h2>
            <Link href="/admin/submissions" className="text-[13px] font-semibold text-signal">Review queue</Link>
          </div>
          <Table head={['Student', 'Task', 'Sent']}>
            {(latestSubmissions ?? []).map((s) => {
              const student = (s as any).profiles;
              const task = (s as any).internship_tasks;
              return (
                <tr key={s.id} className="border-t border-mist">
                  <td className="px-4 py-3 text-[14px] font-semibold text-ink">{student?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-[13.5px] text-slate">
                    {task?.title ?? '—'}
                    <span className="ml-2 font-mono text-[11.5px] text-slate-light">{task?.task_code}</span>
                  </td>
                  <td className="px-4 py-3 text-[13.5px] text-slate">{shortDate(s.submitted_at)}</td>
                </tr>
              );
            })}
            {!latestSubmissions?.length && (
              <tr><td className="px-4 py-6 text-[14px] text-slate-light" colSpan={3}>The review queue is empty.</td></tr>
            )}
          </Table>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-mist px-5 py-4">
          <h2 className="font-display text-[15px] font-bold text-ink">Recent applications</h2>
          <Link href="/admin/applications" className="text-[13px] font-semibold text-signal">All applications</Link>
        </div>
        <Table head={['Student', 'Field', 'Duration', 'Applied', 'Status']}>
          {(latestApplications ?? []).map((a) => {
            const student = (a as any).profiles;
            const field = (a as any).internship_fields;
            return (
              <tr key={a.id} className="border-t border-mist">
                <td className="px-4 py-3">
                  <p className="text-[14px] font-semibold text-ink">{student?.full_name ?? '—'}</p>
                  <p className="font-mono text-[11.5px] text-slate-light">{student?.student_id ?? ''}</p>
                </td>
                <td className="px-4 py-3 text-[13.5px] text-slate">{field?.name ?? '—'}</td>
                <td className="px-4 py-3 text-[13.5px] text-slate">{a.duration} weeks</td>
                <td className="px-4 py-3 text-[13.5px] text-slate">{shortDate(a.applied_at)}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              </tr>
            );
          })}
          {!latestApplications?.length && (
            <tr><td className="px-4 py-6 text-[14px] text-slate-light" colSpan={5}>No applications yet.</td></tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
