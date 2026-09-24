/**
 * Creates a small set of clearly-marked demo students so every screen in both
 * portals has real data to render. Every row is flagged `is_demo = true` and
 * every account uses the @demo.internora.test domain, so you can delete them
 * with one query when you go live:
 *
 *   delete from auth.users where email like '%@demo.internora.test';
 *
 *   npm run seed:demo
 */
import { adminDb, log, done } from './_env';
import { PLANS, DURATIONS, type Duration } from '../src/lib/brand';
import { weekWindows, internshipEndDate, isoDate } from '../src/lib/dates';

const DEMO_DOMAIN = '@demo.internora.test';

const PEOPLE = [
  { name: 'Ayesha Khan',    city: 'Lahore',       uni: 'University of the Punjab',       field: 'web-development',    duration: 4 as Duration, profile: 'star' },
  { name: 'Bilal Ahmed',    city: 'Karachi',      uni: 'NED University',                 field: 'data-science',       duration: 6 as Duration, profile: 'mid' },
  { name: 'Hira Siddiqui',  city: 'Islamabad',    uni: 'COMSATS',                        field: 'ui-ux-design',       duration: 4 as Duration, profile: 'mid' },
  { name: 'Usman Tariq',    city: 'Rahim Yar Khan', uni: 'Islamia University Bahawalpur', field: 'java-full-stack',   duration: 8 as Duration, profile: 'early' },
  { name: 'Sana Malik',     city: 'Faisalabad',   uni: 'GC University',                  field: 'digital-marketing',  duration: 4 as Duration, profile: 'pending' },
  { name: 'Zain Abbas',     city: 'Multan',       uni: 'BZU',                            field: 'graphic-design',     duration: 6 as Duration, profile: 'applied' },
];

async function main() {
  const db = adminDb();

  const { data: fields } = await db.from('internship_fields').select('id, slug, name');
  if (!fields?.length) {
    console.error('\nNo internship fields found. Run `npm run seed:roadmaps` first.\n');
    process.exit(1);
  }

  for (const person of PEOPLE) {
    const email = person.name.toLowerCase().replace(/\s+/g, '.') + DEMO_DOMAIN;
    const field = fields.find((f) => f.slug === person.field);
    if (!field) { log(`skipped ${person.name} — field ${person.field} not seeded`); continue; }

    // --- account ---------------------------------------------------------
    let userId: string;
    const { data: existing } = await db.from('profiles').select('id').eq('email', email).maybeSingle();
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error } = await db.auth.admin.createUser({
        email, password: 'DemoPass123', email_confirm: true,
        user_metadata: { full_name: person.name },
      });
      if (error) { log(`skipped ${person.name}: ${error.message}`); continue; }
      userId = created.user.id;
    }

    await db.from('profiles').update({
      full_name: person.name, city: person.city, country: 'Pakistan',
      university: person.uni, education_level: 'Bachelors', field_of_study: 'Computer Science',
      bio: `Demo account for ${field.name}. Seeded so every dashboard screen has real data.`,
      skills: ['Teamwork', 'Problem solving'],
      public_profile: true, is_demo: true,
      phone: '+92 300 0000000', whatsapp: '+92 300 0000000',
    }).eq('id', userId);

    // --- application -----------------------------------------------------
    const fee = PLANS[person.duration].fee;
    await db.from('applications').delete().eq('student_id', userId);
    const { data: application } = await db.from('applications').insert({
      student_id: userId, field_id: field.id, duration: person.duration, fee_pkr: fee,
      status: person.profile === 'applied' ? 'submitted'
        : person.profile === 'pending' ? 'payment_submitted' : 'approved',
      is_demo: true,
    }).select('id').single();
    if (!application) continue;

    if (person.profile === 'applied') { log(`${person.name} — application only`); continue; }

    // --- payment ---------------------------------------------------------
    await db.from('payments').insert({
      application_id: application.id, student_id: userId,
      method: person.duration === 6 ? 'easypaisa' : 'jazzcash',
      transaction_id: `DEMO-${userId.slice(0, 8)}`,
      payment_date: isoDate(new Date()),
      amount_pkr: fee,
      screenshot_url: 'https://placehold.co/600x900/EEF2F7/101C33?text=Demo+receipt',
      status: person.profile === 'pending' ? 'under_verification' : 'verified',
    });

    if (person.profile === 'pending') { log(`${person.name} — payment awaiting verification`); continue; }

    // --- internship, weeks and tasks --------------------------------------
    // Backdate the start so the demo internships sit mid-programme.
    const weeksElapsed = person.profile === 'star' ? person.duration : person.profile === 'mid' ? 2 : 1;
    const start = new Date(Date.now() - (weeksElapsed * 7 - 1) * 86400_000);
    const end = internshipEndDate(start, person.duration);

    const { data: internship } = await db.from('internships').insert({
      application_id: application.id, student_id: userId, field_id: field.id,
      duration: person.duration, status: person.profile === 'star' ? 'completed' : 'active',
      start_date: isoDate(start), end_date: isoDate(end),
      current_week: Math.min(weeksElapsed, person.duration),
      completed_at: person.profile === 'star' ? new Date().toISOString() : null,
      is_demo: true,
    }).select('id').single();
    if (!internship) continue;

    const { data: template } = await db.from('roadmap_weeks')
      .select('id, week_number, title, summary, objectives, is_final, roadmap_tasks(*)')
      .eq('field_id', field.id).eq('duration', person.duration).order('week_number');

    const windows = weekWindows(start, person.duration);

    for (const [i, week] of (template ?? []).entries()) {
      const window = windows[i];
      const completed = i < weeksElapsed - 1 || person.profile === 'star';
      const active = !completed && i === weeksElapsed - 1;

      const { data: weekRow } = await db.from('internship_weeks').insert({
        internship_id: internship.id, week_number: week.week_number,
        title: week.title, summary: week.summary, objectives: week.objectives, is_final: week.is_final,
        start_date: isoDate(window.startDate), end_date: isoDate(window.endDate),
        status: completed ? 'completed' : active ? 'active' : 'locked',
        unlocked_at: completed || active ? window.startDate.toISOString() : null,
        completed_at: completed ? window.endDate.toISOString() : null,
      }).select('id').single();
      if (!weekRow) continue;

      const tasks = ((week as any).roadmap_tasks ?? []).sort((a: any, b: any) => a.task_number - b.task_number);
      for (const t of tasks) {
        const status = completed ? 'approved' : active ? (t.task_number === 1 ? 'under_review' : 'available') : 'locked';
        const score = completed ? 80 + ((t.task_number * 7) % 18) : null;

        const { data: taskRow } = await db.from('internship_tasks').insert({
          internship_id: internship.id, week_id: weekRow.id, roadmap_task_id: t.id,
          task_code: `INT-TSK-W${week.week_number}-${String(t.task_number).padStart(2, '0')}`,
          task_number: t.task_number, title: t.title, description: t.description,
          instructions: t.instructions, objective: t.objective, deliverable: t.deliverable,
          points: t.points, is_required: t.is_required, submission_type: t.submission_type,
          allowed_file_types: t.allowed_file_types,
          unlock_date: isoDate(window.startDate),
          deadline: isoDate(new Date(window.startDate.getTime() + t.deadline_offset_days * 86400_000)),
          status, score,
        }).select('id').single();

        if (taskRow && (completed || status === 'under_review')) {
          await db.from('submissions').insert({
            task_id: taskRow.id, internship_id: internship.id, student_id: userId, attempt: 1,
            url: 'https://github.com/demo/internora-task',
            comments: 'Demo submission seeded for screenshots.',
            status: completed ? 'approved' : 'under_review',
            score, feedback: completed ? 'Clean work — the deliverable matched the brief.' : null,
            reviewed_at: completed ? new Date().toISOString() : null,
          });
        }
      }
    }

    // --- offer letter -----------------------------------------------------
    const { data: olId } = await db.rpc('next_public_id', { p_prefix: 'INT-OL', p_scope: 'offer_letter' });
    await db.from('offer_letters').insert({
      internship_id: internship.id, public_id: olId as unknown as string, issue_date: isoDate(start),
    });

    // --- completed extras: scores, certificate, LOR, reward ---------------
    if (person.profile === 'star') {
      await db.from('internships').update({
        weekly_score: 91.5, final_project_score: 88, overall_score: 90.45,
      }).eq('id', internship.id);

      const { data: certId } = await db.rpc('next_public_id', { p_prefix: 'INT-CERT', p_scope: 'certificate' });
      await db.from('certificates').insert({
        internship_id: internship.id, public_id: certId as unknown as string, overall_score: 90.45,
      });

      const { data: lorId } = await db.rpc('next_public_id', { p_prefix: 'INT-LOR', p_scope: 'lor' });
      await db.from('lor_records').insert({
        internship_id: internship.id, public_id: lorId as unknown as string, position: 1,
        performance: 'Worked through every week on schedule and consistently delivered above the required standard.',
        skills: ['Front-end development', 'Version control', 'Technical writing'],
        achievements: 'Finished first in the 4-week group with an overall score of 90.45.',
        recommendation: 'I recommend this intern without reservation for junior development roles.',
        status: 'issued', issue_date: isoDate(new Date()),
      });

      await db.from('rewards').insert({
        internship_id: internship.id, student_id: userId, duration: person.duration,
        position: 1, amount_pkr: PLANS[person.duration].rewards[0].amount,
        includes_lor: true, status: 'approved',
      });

      await db.from('evaluations').insert({
        internship_id: internship.id,
        weekly_score: 91.5, final_project_score: 88, overall_score: 90.45,
        remarks: 'Demo evaluation record.',
      });
    }

    await db.from('notifications').insert([
      { user_id: userId, type: 'payment_verified', title: 'Payment verified',
        message: 'Your payment was verified and your internship is active.', link: '/dashboard' },
      { user_id: userId, type: 'week_unlocked', title: 'New week unlocked',
        message: 'Your next week of tasks is open.', link: '/dashboard/roadmap' },
    ]);

    log(`${person.name} — ${person.profile} (${field.name}, ${person.duration}w)`);
  }

  // A demo support ticket so the support screens are not empty.
  const { data: firstDemo } = await db.from('profiles')
    .select('id').eq('is_demo', true).limit(1).maybeSingle();
  if (firstDemo) {
    const { data: ticket } = await db.from('support_tickets').insert({
      student_id: firstDemo.id,
      subject: 'Payment verified but week 2 is still locked',
      message: 'My week 1 tasks were approved yesterday. When does week 2 open?',
    }).select('id').maybeSingle();
    if (ticket) log('demo support ticket created');
  }

  done('Demo data seeded. Every demo account uses the password DemoPass123.');
  console.log('  Remove it later with: delete from auth.users where email like \'%@demo.internora.test\';');
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
