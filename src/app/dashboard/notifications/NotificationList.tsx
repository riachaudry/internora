'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postJson } from '@/components/portal/form';
import { Card, Button, Badge } from '@/components/ui';

export type Note = {
  id: string; type: string; title: string; message: string;
  link: string | null; is_read: boolean; created_at: string;
};

const relative = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

export function NotificationList({ initial, base = '/dashboard' }: { initial: Note[]; base?: string }) {
  const router = useRouter();
  const [notes, setNotes] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  React.useEffect(() => setNotes(initial), [initial]);

  const unread = notes.filter((n) => !n.is_read).length;
  const shown = filter === 'unread' ? notes.filter((n) => !n.is_read) : notes;

  async function markRead(id?: string) {
    setBusy(true);
    try {
      await postJson('/api/notifications', id ? { id } : {});
      setNotes((list) => list.map((n) => (!id || n.id === id ? { ...n, is_read: true } : n)));
      router.refresh();
    } catch {
      /* the list simply stays unread; the next load will reconcile */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(['all', 'unread'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
                      filter === f ? 'bg-ink text-white' : 'bg-white text-slate hover:bg-mist'
                    }`}>
              {f === 'all' ? `All (${notes.length})` : `Unread (${unread})`}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => markRead()} disabled={busy || !unread}>
          Mark all as read
        </Button>
      </div>

      {!shown.length ? (
        <Card className="p-8 text-center">
          <p className="font-display text-[15px] font-bold text-ink">
            {filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
          </p>
          <p className="mt-1.5 text-[14px] text-slate-light">
            Payment verification, week unlocks, review decisions and issued documents all show up here.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((n) => (
            <li key={n.id}>
              <Card className={`p-4 ${n.is_read ? '' : 'border-signal/40 bg-signal-light/25'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[15px] font-bold text-ink">{n.title}</p>
                      {!n.is_read && <Badge tone="success">New</Badge>}
                    </div>
                    <p className="prose-narrow mt-1 text-[14px]">{n.message}</p>
                    <p className="mt-1.5 text-[12px] text-slate-light">{relative(n.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {n.link && (
                      <Link href={n.link.startsWith('/') ? n.link : `${base}${n.link}`}
                            className="rounded-lg border border-mist-deep px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-mist">
                        Open
                      </Link>
                    )}
                    {!n.is_read && (
                      <button type="button" onClick={() => markRead(n.id)} disabled={busy}
                              className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-slate hover:bg-mist">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
