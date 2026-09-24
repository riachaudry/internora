import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SectionHead, Card } from '@/components/ui';
import { NotificationList } from '../../dashboard/notifications/NotificationList';
import { Broadcast } from './Broadcast';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const profile = await requireAdmin();
  const { data: items } = await createClient().from('notifications')
    .select('id, type, title, message, link, is_read, created_at')
    .eq('user_id', profile.id).order('created_at', { ascending: false }).limit(100);

  return (
    <div className="space-y-6">
      <SectionHead title="Notifications" body="Your own admin notifications, plus announcement broadcasting." />
      <Broadcast />
      <div>
        <h2 className="font-display text-lg font-bold">Your notifications</h2>
        {items?.length ? (
          <div className="mt-3"><NotificationList initial={items} base="/admin" /></div>
        ) : (
          <Card className="mt-3 p-5"><p className="text-[14px] text-slate-light">Nothing yet.</p></Card>
        )}
      </div>
    </div>
  );
}
