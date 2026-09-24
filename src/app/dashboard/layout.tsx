import type { Metadata } from 'next';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PortalShell } from '@/components/portal/PortalShell';

export const metadata: Metadata = { title: 'Student Dashboard · Internora' };
export const dynamic = 'force-dynamic';

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/profile', label: 'My Profile' },
      { href: '/dashboard/internship', label: 'My Internship' },
      { href: '/dashboard/offer-letter', label: 'Offer Letter' },
      { href: '/dashboard/timeline', label: 'Timeline' },
    ],
  },
  {
    group: 'Work',
    items: [
      { href: '/dashboard/roadmap', label: 'Weekly Roadmap' },
      { href: '/dashboard/tasks', label: 'Tasks' },
      { href: '/dashboard/submissions', label: 'Submissions' },
      { href: '/dashboard/feedback', label: 'Feedback' },
      { href: '/dashboard/progress', label: 'Progress' },
      { href: '/dashboard/projects', label: 'Projects' },
    ],
  },
  {
    group: 'Outcomes',
    items: [
      { href: '/dashboard/leaderboard', label: 'Leaderboard' },
      { href: '/dashboard/certificate', label: 'Certificate' },
      { href: '/dashboard/lor', label: 'LOR' },
      { href: '/dashboard/rewards', label: 'Rewards' },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/dashboard/notifications', label: 'Notifications' },
      { href: '/dashboard/support', label: 'Support' },
      { href: '/dashboard/settings', label: 'Settings' },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStudent();
  const supabase = createClient();
  const { count } = await supabase.from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id).eq('is_read', false);

  const nav = NAV.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.href === '/dashboard/notifications' ? { ...item, badge: count ?? 0 } : item),
  }));

  return (
    <PortalShell profile={profile} nav={nav} unread={count ?? 0} base="/dashboard">
      {children}
    </PortalShell>
  );
}
