import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState, stageOf } from '@/lib/services/student';
import { SectionHead, Alert, Button } from '@/components/ui';
import { ApplyForm } from './ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const profile = await requireStudent();
  const state = await loadStudentState(profile.id);
  const stage = stageOf(state);

  const { data: fields } = await createClient()
    .from('internship_fields')
    .select('id, slug, name, short_description, skills, evaluation_criteria, certificate_criteria, reward_criteria')
    .eq('is_active', true).order('sort_order');

  if (stage !== 'no_application') {
    return (
      <div className="space-y-5">
        <SectionHead title="Apply for an internship" />
        <Alert tone="info" title="You already have an application in progress">
          Internora runs one internship per account at a time. Finish or cancel the current one before applying again.
        </Alert>
        <Button href="/dashboard">Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHead
        eyebrow="Step 1 of 2"
        title="Apply for an internship"
        body="Pick a field and a duration. The fee, the weekly roadmap and the reward tier are all set by that choice — nothing is added later."
      />
      <ApplyForm fields={fields ?? []} />
    </div>
  );
}
