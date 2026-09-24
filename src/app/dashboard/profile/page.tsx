import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState } from '@/lib/services/student';
import { SectionHead } from '@/components/ui';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await requireStudent();
  const { data: full } = await createClient().from('profiles')
    .select('*').eq('id', profile.id).single();
  const state = await loadStudentState(profile.id);

  return (
    <div className="space-y-6">
      <SectionHead title="My profile"
                   body="This is what appears on your certificate, offer letter and — if you switch it on — your public profile page." />
      <ProfileForm profile={full} state={{
        internshipField: (state.internship?.internship_fields as any)?.name ?? null,
        duration: state.internship?.duration ?? null,
        overallScore: state.internship ? Number(state.internship.overall_score ?? 0) : null,
        certificateId: state.docs?.certificate?.public_id ?? null,
        lorId: state.docs?.lor?.status === 'issued' ? state.docs.lor.public_id : null,
      }} />
    </div>
  );
}
