import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SectionHead } from '@/components/ui';
import { NotificationList, type Note } from './NotificationList';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const profile = await requireStudent();
  const { data } = await createClient()
    .from('notifications')
    .select('id, type, title, message, link, is_read, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <SectionHead title="Notifications"
                   body="Everything the system has told you, newest first. Important actions also go to your email." />
      <NotificationList initial={(data ?? []) as Note[]} />
    </div>
  );
}
