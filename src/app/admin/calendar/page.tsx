import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { longDate, shortDate, isoDate } from '@/lib/dates';
import { SectionHead, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** Operational calendar: internship starts, ends and week boundaries over the next 60 days. */
export default async function AdminCalendarPage() {
  await requireAdmin();
  const db = createAdminClient();

  const today = new Date();
  const horizon = new Date(today.getTime() + 60 * 86400_000);
  const from = isoDate(today);
  const to = isoDate(horizon);

  const [{ data: starts }, { data: ends }, { data: weeks }] = await Promise.all([
    db.from('internships')
      .select('id, start_date, duration, internship_fields(name), profiles!internships_student_id_fkey(full_name)')
      .gte('start_date', from).lte('start_date', to),
    db.from('internships')
      .select('id, end_date, duration, internship_fields(name), profiles!internships_student_id_fkey(full_name)')
      .gte('end_date', from).lte('end_date', to),
    db.from('internship_weeks')
      .select('id, week_number, title, start_date, is_final, internships(profiles!internships_student_id_fkey(full_name))')
      .gte('start_date', from).lte('start_date', to).limit(200),
  ]);

  type Event = { date: string; kind: string; tone: 'good' | 'warn' | 'info'; label: string; who: string };
  const events: Event[] = [
    ...(starts ?? []).map((i: any) => ({
      date: i.start_date, kind: 'Start', tone: 'good' as const,
      label: `${i.internship_fields?.name} · ${i.duration} weeks begins`,
      who: i.profiles?.full_name ?? '—',
    })),
    ...(ends ?? []).map((i: any) => ({
      date: i.end_date, kind: 'End', tone: 'warn' as const,
      label: `${i.internship_fields?.name} · ${i.duration} weeks ends`,
      who: i.profiles?.full_name ?? '—',
    })),
    ...(weeks ?? []).map((w: any) => ({
      date: w.start_date, kind: w.is_final ? 'Final' : `Week ${w.week_number}`, tone: 'info' as const,
      label: w.title, who: w.internships?.profiles?.full_name ?? '—',
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const grouped = events.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <SectionHead title="Calendar"
                   body={`Internship starts, ends and week boundaries for the next 60 days. Today is ${longDate()}.`} />

      {Object.keys(grouped).length ? (
        <div className="space-y-3">
          {Object.entries(grouped).map(([date, list]) => (
            <Card key={date} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-[16px] font-bold text-ink">{shortDate(date)}</p>
                <p className="text-[12.5px] text-slate-light">{list.length} event{list.length === 1 ? '' : 's'}</p>
              </div>
              <ul className="mt-3 divide-y divide-mist border-t border-mist">
                {list.map((e, i) => (
                  <li key={`${date}-${i}`} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">{e.label}</p>
                      <p className="text-[12.5px] text-slate-light">{e.who}</p>
                    </div>
                    <Badge tone={e.tone}>{e.kind}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing scheduled in the next 60 days"
                    body="Internship starts, week boundaries and end dates appear here as programs are activated." />
      )}
    </div>
  );
}
