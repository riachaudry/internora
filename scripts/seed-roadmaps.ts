/**
 * Publishes the nine launch fields and their full weekly roadmaps for the
 * 4, 6 and 8 week durations. Safe to re-run: it upserts by slug and replaces
 * each (field, duration) roadmap in place.
 *
 *   npm run seed:roadmaps
 */
import { adminDb, log, done } from './_env';
import { ROADMAPS } from '../src/lib/roadmaps';
import { roadmapFor, type RoadmapTask } from '../src/lib/roadmaps/types';
import { DURATIONS } from '../src/lib/brand';

async function main() {
  const db = adminDb();
  let weekCount = 0;
  let taskCount = 0;

  for (const [index, field] of ROADMAPS.entries()) {
    const { data: existing } = await db.from('internship_fields')
      .select('id').eq('slug', field.slug).maybeSingle();

    const payload = {
      slug: field.slug,
      name: field.name,
      short_description: field.shortDescription,
      description: field.description,
      skills: field.skills,
      evaluation_criteria: field.evaluationCriteria,
      certificate_criteria: field.certificateCriteria,
      reward_criteria: field.rewardCriteria,
      icon: field.icon,
      sort_order: index,
      is_active: true,
    };

    let fieldId = existing?.id;
    if (fieldId) {
      await db.from('internship_fields').update(payload).eq('id', fieldId);
    } else {
      const { data, error } = await db.from('internship_fields')
        .insert(payload).select('id').single();
      if (error) throw new Error(`${field.name}: ${error.message}`);
      fieldId = data.id;
    }

    log(`${field.name}`);

    for (const duration of DURATIONS) {
      // Replace this duration's roadmap wholesale; tasks cascade on delete.
      await db.from('roadmap_weeks').delete().eq('field_id', fieldId).eq('duration', duration);

      const weeks = roadmapFor(field, duration);
      for (const [i, week] of weeks.entries()) {
        const weekNumber = i + 1;
        const { data: row, error } = await db.from('roadmap_weeks').insert({
          field_id: fieldId,
          duration,
          week_number: weekNumber,
          title: week.title,
          summary: week.summary,
          objectives: week.objectives,
          is_final: !!week.isFinal,
        }).select('id').single();
        if (error) throw new Error(`${field.name} ${duration}w week ${weekNumber}: ${error.message}`);
        weekCount++;

        const tasks = week.tasks.map((t: RoadmapTask, n: number) => ({
          week_id: row.id,
          task_number: n + 1,
          title: t.title,
          description: t.description,
          instructions: t.description,
          objective: t.objective,
          deliverable: t.deliverable,
          points: t.points ?? 10,
          is_required: true,
          submission_type: t.submissionType ?? 'file_or_url',
          allowed_file_types: t.allowedFileTypes ?? ['pdf', 'docx', 'jpg', 'png', 'zip', 'txt'],
          deadline_offset_days: t.deadlineOffsetDays ?? 7,
        }));

        if (tasks.length) {
          const { error: taskError } = await db.from('roadmap_tasks').insert(tasks);
          if (taskError) throw new Error(`${field.name} ${duration}w week ${weekNumber} tasks: ${taskError.message}`);
          taskCount += tasks.length;
        }
      }
      log(`   ${duration}-week roadmap: ${weeks.length} weeks`);
    }
  }

  done(`${ROADMAPS.length} fields · ${weekCount} roadmap weeks · ${taskCount} roadmap tasks published.`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
