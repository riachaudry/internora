'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { ROADMAPS } from '@/lib/roadmaps';
import { DURATIONS, PLANS, formatPKR } from '@/lib/brand';

const EDUCATION = ['Matric / O Level', 'Intermediate / A Level', 'Diploma', 'Bachelor\u2019s', 'Master\u2019s', 'MPhil / PhD', 'Other'];
const STEPS = ['Account', 'About you', 'Profile'];

export function RegisterForm({
  invited, inviteToken, preselectField, preselectDuration,
}: {
  invited: { full_name: string; email: string } | null;
  inviteToken?: string; preselectField?: string; preselectDuration?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, any>>({
    full_name: invited?.full_name ?? '', email: invited?.email ?? '', country: 'Pakistan',
  });

  const set = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const merged = { ...data, ...form };

    if (step < STEPS.length - 1) {
      if (step === 0 && merged.password !== merged.confirm_password) {
        setError('The two passwords do not match.'); return;
      }
      setData(merged); setError(null); setStep(step + 1); return;
    }

    setBusy(true); setError(null);
    const payload = {
      ...merged,
      skills: String(merged.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      invite_token: inviteToken,
    };
    delete (payload as any).confirm_password;

    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) { setError(json.error ?? 'Registration failed. Check your details and try again.'); setBusy(false); return; }

    const target = preselectField
      ? `/dashboard/apply?field=${preselectField}&duration=${preselectDuration ?? 8}`
      : '/dashboard';
    router.replace(`/login?next=${encodeURIComponent(target)}&message=Account created. Sign in to continue.`);
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <ol className="mb-6 flex gap-2" aria-label="Registration progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-signal' : 'bg-mist-deep'}`} />
            <p className={`mt-2 text-[12px] font-semibold ${i <= step ? 'text-ink' : 'text-slate-light'}`}>{s}</p>
          </li>
        ))}
      </ol>

      {invited && step === 0 && (
        <Alert tone="good" title="You were invited">
          <p className="mt-1">Complete your registration to continue.</p>
        </Alert>
      )}
      {error && <Alert tone="bad">{error}</Alert>}

      {step === 0 && (
        <>
          <Text name="full_name" label="Full name" defaultValue={data.full_name} required />
          <Text name="email" label="Email" type="email" defaultValue={data.email} required readOnly={!!invited} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="phone" label="Phone" defaultValue={data.phone} required placeholder="03XXXXXXXXX" />
            <Text name="whatsapp" label="WhatsApp number" defaultValue={data.whatsapp} required placeholder="03XXXXXXXXX" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="password" label="Password" type="password" required minLength={8}
                  hint="8+ characters, with upper and lower case and a number." />
            <Text name="confirm_password" label="Confirm password" type="password" required />
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="date_of_birth" label="Date of birth" type="date" defaultValue={data.date_of_birth} />
            <Select name="gender" label="Gender" defaultValue={data.gender}
                    options={['Female', 'Male', 'Prefer not to say']} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="city" label="City" defaultValue={data.city} required />
            <Text name="country" label="Country" defaultValue={data.country ?? 'Pakistan'} required />
          </div>
          <Select name="education_level" label="Education level" defaultValue={data.education_level}
                  options={EDUCATION} required />
          <Text name="university" label="University / institute" defaultValue={data.university} required />
          <Text name="field_of_study" label="Field of study" defaultValue={data.field_of_study} required />
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <label className="field-label" htmlFor="bio">Short bio</label>
            <textarea id="bio" name="bio" rows={3} defaultValue={data.bio} className="field"
                      placeholder="Two or three lines about what you are working toward." />
          </div>
          <Text name="skills" label="Skills" defaultValue={data.skills}
                placeholder="HTML, CSS, JavaScript" hint="Separate with commas." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="linkedin_url" label="LinkedIn URL (optional)" type="url" defaultValue={data.linkedin_url} />
            <Text name="portfolio_url" label="Portfolio URL (optional)" type="url" defaultValue={data.portfolio_url} />
          </div>
          <p className="rounded-xl bg-mist/70 px-4 py-3 text-[13px] leading-relaxed text-slate">
            You will upload your profile photo from the dashboard right after signing in.
            {preselectField && (
              <> You picked <strong className="text-ink">{ROADMAPS.find((r) => r.slug === preselectField)?.name}</strong>
                {preselectDuration && DURATIONS.includes(Number(preselectDuration) as any) &&
                  <> · {preselectDuration} weeks · {formatPKR(PLANS[Number(preselectDuration) as 4 | 6 | 8].fee)}</>}
                — we will take you straight to that application.
              </>
            )}
          </p>
          <label className="flex items-start gap-2.5 text-[14px] leading-relaxed text-slate">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-mist-deep text-signal" />
            <span>
              I understand this is a project-based virtual internship program, that performance
              rewards depend on eligibility and final evaluation, and that Internora does not
              guarantee employment.
            </span>
          </label>
        </>
      )}

      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <Button type="button" variant="secondary" size="lg" onClick={() => setStep(step - 1)}>Back</Button>
        )}
        <Button type="submit" size="lg" disabled={busy} className="flex-1">
          {busy ? 'Creating account…' : step < STEPS.length - 1 ? 'Continue' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}

function Text({ name, label, hint, ...rest }: any) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" {...rest} />
      {hint && <p className="mt-1.5 text-[13px] text-slate-light">{hint}</p>}
    </div>
  );
}

function Select({ name, label, options, ...rest }: any) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <select id={name} name={name} className="field" {...rest}>
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
