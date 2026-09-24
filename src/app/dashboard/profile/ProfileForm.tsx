'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert, Badge, StatCard } from '@/components/ui';
import { Avatar } from '@/components/portal/Avatar';
import { Uploader } from '@/components/portal/Uploader';
import { patchJson } from '@/components/portal/form';

export function ProfileForm({ profile, state }: {
  profile: any;
  state: {
    internshipField: string | null; duration: number | null; overallScore: number | null;
    certificateId: string | null; lorId: string | null;
  };
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    full_name: profile.full_name ?? '', phone: profile.phone ?? '', whatsapp: profile.whatsapp ?? '',
    city: profile.city ?? '', country: profile.country ?? '', education_level: profile.education_level ?? '',
    university: profile.university ?? '', field_of_study: profile.field_of_study ?? '',
    bio: profile.bio ?? '', linkedin_url: profile.linkedin_url ?? '', portfolio_url: profile.portfolio_url ?? '',
  });
  const [skills, setSkills] = React.useState<string[]>(profile.skills ?? []);
  const [skillDraft, setSkillDraft] = React.useState('');
  const [avatar, setAvatar] = React.useState<string | null>(profile.avatar_url ?? null);
  const [publicProfile, setPublicProfile] = React.useState<boolean>(!!profile.public_profile);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function addSkill() {
    const s = skillDraft.trim();
    if (!s || skills.includes(s) || skills.length >= 20) { setSkillDraft(''); return; }
    setSkills([...skills, s]); setSkillDraft('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await patchJson('/api/profile', { ...form, skills, avatar_url: avatar ?? undefined, public_profile: publicProfile });
      setMsg({ tone: 'good', text: 'Profile saved.' });
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={save} className="space-y-5">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Photo</h2>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <Avatar url={avatar} name={form.full_name || 'Student'} size={72} />
            <div className="min-w-[240px] flex-1">
              <Uploader bucket="avatars" userId={profile.id}
                        allowed={['jpg', 'jpeg', 'png', 'webp']} maxBytes={2 * 1024 * 1024}
                        accept="image/png,image/jpeg,image/webp"
                        onDone={(f) => setAvatar(f?.url ?? avatar)} label="Upload photo" current={avatar} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Personal details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="form-row"><span>Full name</span>
              <input required value={form.full_name} onChange={set('full_name')} /></label>
            <label className="form-row"><span>Email</span>
              <input value={profile.email} readOnly /></label>
            <label className="form-row"><span>Phone</span>
              <input value={form.phone} onChange={set('phone')} /></label>
            <label className="form-row"><span>WhatsApp</span>
              <input value={form.whatsapp} onChange={set('whatsapp')} /></label>
            <label className="form-row"><span>City</span>
              <input value={form.city} onChange={set('city')} /></label>
            <label className="form-row"><span>Country</span>
              <input value={form.country} onChange={set('country')} /></label>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Education</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="form-row"><span>Education level</span>
              <input value={form.education_level} onChange={set('education_level')} /></label>
            <label className="form-row"><span>University / Institute</span>
              <input value={form.university} onChange={set('university')} /></label>
            <label className="form-row sm:col-span-2"><span>Field of study</span>
              <input value={form.field_of_study} onChange={set('field_of_study')} /></label>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">About you</h2>
          <div className="mt-4 space-y-4">
            <label className="form-row"><span>Bio</span>
              <textarea rows={4} maxLength={600} value={form.bio} onChange={set('bio')}
                        placeholder="A few lines about what you build and what you're aiming for." /></label>

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Skills</p>
              <div className="flex gap-2">
                <input value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                       placeholder="React, Figma, SQL…"
                       className="w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-[15px] focus:border-signal focus:outline-none" />
                <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <button key={s} type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="rounded-full bg-mist px-3 py-1.5 text-[13px] font-medium text-slate hover:bg-danger-light hover:text-danger">
                    {s} ✕
                  </button>
                ))}
                {!skills.length && <p className="text-[13px] text-slate-light">No skills added yet.</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-row"><span>LinkedIn URL</span>
                <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')}
                       placeholder="https://linkedin.com/in/…" /></label>
              <label className="form-row"><span>Portfolio URL</span>
                <input type="url" value={form.portfolio_url} onChange={set('portfolio_url')}
                       placeholder="https://…" /></label>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Public profile</h2>
          <label className="mt-3 flex items-start gap-3">
            <input type="checkbox" checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)}
                   className="mt-1 h-4 w-4 accent-[#1F6F5C]" />
            <span className="text-[14px] text-slate">
              Publish a public page at <span className="font-mono text-ink">/profile/{profile.username}</span> showing
              your name, bio, skills, internship history and verified documents. Your email, phone, WhatsApp,
              date of birth and payment details are never published.
            </span>
          </label>
          {publicProfile && profile.username && (
            <Link href={`/profile/${profile.username}`} target="_blank"
                  className="mt-3 inline-block text-[13.5px] font-semibold text-signal underline">
              View my public profile
            </Link>
          )}
        </Card>

        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
      </form>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Identity</h2>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            <div className="flex justify-between"><dt className="text-slate">Student ID</dt>
              <dd className="font-mono font-semibold text-ink">{profile.student_id ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Username</dt>
              <dd className="font-mono font-semibold text-ink">{profile.username ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Public</dt>
              <dd><Badge tone={publicProfile ? 'good' : 'neutral'}>{publicProfile ? 'On' : 'Off'}</Badge></dd></div>
          </dl>
        </Card>

        <StatCard label="Internship" value={state.internshipField ?? '—'}
                  hint={state.duration ? `${state.duration} weeks` : undefined} />
        <StatCard label="Overall score"
                  value={state.overallScore != null ? state.overallScore.toFixed(1) : '—'} tone="good" />

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Documents</h2>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li className="flex justify-between"><span className="text-slate">Certificate</span>
              <span className="font-mono text-ink">{state.certificateId ?? '—'}</span></li>
            <li className="flex justify-between"><span className="text-slate">LOR</span>
              <span className="font-mono text-ink">{state.lorId ?? '—'}</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
