import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { PortalShell } from '@/components/portal/PortalShell';

export const metadata: Metadata = { title: 'Admin · Internora' };
export const dynamic = 'force-dynamic';

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/calendar', label: 'Calendar' },
      { href: '/admin/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    group: 'Intake',
    items: [
      { href: '/admin/students', label: 'Students' },
      { href: '/admin/applications', label: 'Applications' },
      { href: '/admin/payments', label: 'Payments' },
      { href: '/admin/invitations', label: 'Invitations' },
    ],
  },
  {
    group: 'Delivery',
    items: [
      { href: '/admin/internships', label: 'Internships' },
      { href: '/admin/fields', label: 'Fields' },
      { href: '/admin/batches', label: 'Batches' },
      { href: '/admin/roadmaps', label: 'Weekly Roadmaps' },
      { href: '/admin/tasks', label: 'Tasks' },
      { href: '/admin/submissions', label: 'Submissions' },
      { href: '/admin/evaluations', label: 'Evaluations' },
    ],
  },
  {
    group: 'Documents',
    items: [
      { href: '/admin/offer-letters', label: 'Offer Letters' },
      { href: '/admin/certificates', label: 'Certificates' },
      { href: '/admin/lor', label: 'LOR' },
      { href: '/admin/rewards', label: 'Rewards' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/admin/notifications', label: 'Notifications' },
      { href: '/admin/emails', label: 'Emails' },
      { href: '/admin/support', label: 'Support' },
      { href: '/admin/profile', label: 'Admin Profile' },
      { href: '/admin/settings', label: 'Settings' },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  const db = createAdminClient();

  const [{ count: unread }, { count: pendingPayments }, { count: pendingReviews }, { count: openTickets }] =
    await Promise.all([
      createClient().from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id).eq('is_read', false),
      db.from('payments').select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_verification']),
      db.from('submissions').select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']),
      db.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

  const badges: Record<string, number> = {
    '/admin/payments': pendingPayments ?? 0,
    '/admin/submissions': pendingReviews ?? 0,
    '/admin/support': openTickets ?? 0,
    '/admin/notifications': unread ?? 0,
  };

  const nav = NAV.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      badges[item.href] ? { ...item, badge: badges[item.href] } : item),
  }));

  return (
    <PortalShell profile={profile} nav={nav} unread={unread ?? 0} base="/admin">
      {children}
    </PortalShell>
  );
}
