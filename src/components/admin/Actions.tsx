'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

type Method = 'POST' | 'PATCH' | 'DELETE';

async function send(url: string, body: unknown, method: Method) {
  const res = await fetch(url, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? 'The action failed.');
  return data as Record<string, unknown>;
}

/**
 * One-click admin action. Every mutation in the admin portal goes through an
 * API route, so the button never writes to the database directly.
 */
export function ActionButton({
  url, body, method = 'POST', label, busyLabel = 'Working…',
  variant = 'secondary', size = 'sm', confirm, onDone,
}: {
  url: string; body: unknown; method?: Method;
  label: string; busyLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  confirm?: string;
  onDone?: (data: Record<string, unknown>) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true); setError(null);
    try {
      const data = await send(url, body, method);
      onDone?.(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The action failed.');
    } finally { setBusy(false); }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button type="button" variant={variant} size={size} onClick={run} disabled={busy}>
        {busy ? busyLabel : label}
      </Button>
      {error && <span className="text-[12px] font-medium text-danger">{error}</span>}
    </span>
  );
}

export type FieldSpec =
  | { name: string; label: string; type: 'text' | 'date' | 'number' | 'textarea'; required?: boolean; placeholder?: string; defaultValue?: string | number }
  | { name: string; label: string; type: 'select'; options: { value: string; label: string }[]; required?: boolean; defaultValue?: string }
  | { name: string; label: string; type: 'checkbox'; defaultValue?: boolean };

/**
 * Small inline admin form. `transform` lets a page coerce values (numbers,
 * booleans) before they are posted.
 */
export function ActionForm({
  url, method = 'POST', fields, submitLabel, extra, transform, successMessage = 'Done.',
}: {
  url: string; method?: Method; fields: FieldSpec[];
  submitLabel: string; extra?: Record<string, unknown>;
  transform?: (values: Record<string, string | boolean>) => Record<string, unknown>;
  successMessage?: string;
}) {
  const router = useRouter();
  const initial = React.useMemo(() => {
    const seed: Record<string, string | boolean> = {};
    for (const f of fields) {
      seed[f.name] = f.type === 'checkbox'
        ? Boolean((f as { defaultValue?: boolean }).defaultValue)
        : String((f as { defaultValue?: string | number }).defaultValue ?? '');
    }
    return seed;
  }, [fields]);

  const [values, setValues] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => setValues(initial), [initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setDone(false);
    try {
      const payload = { ...(extra ?? {}), ...(transform ? transform(values) : values) };
      await send(url, payload, method);
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The action failed.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type !== 'checkbox' && (
            <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor={`${url}-${f.name}`}>
              {f.label}
            </label>
          )}
          {f.type === 'textarea' ? (
            <textarea id={`${url}-${f.name}`} rows={4} className="field" required={f.required}
                      placeholder={f.placeholder}
                      value={String(values[f.name] ?? '')}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          ) : f.type === 'select' ? (
            <select id={`${url}-${f.name}`} className="field" required={f.required}
                    value={String(values[f.name] ?? '')}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
              <option value="">Select…</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === 'checkbox' ? (
            <label className="flex items-center gap-2.5 text-[13.5px] text-slate">
              <input type="checkbox" className="h-4 w-4" checked={Boolean(values[f.name])}
                     onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))} />
              {f.label}
            </label>
          ) : (
            <input id={`${url}-${f.name}`} type={f.type} className="field" required={f.required}
                   placeholder={f.placeholder}
                   value={String(values[f.name] ?? '')}
                   onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          )}
        </div>
      ))}

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
      {done && <p className="text-[13px] font-medium text-signal">{successMessage}</p>}

      <Button type="submit" size="sm" disabled={busy}>{busy ? 'Working…' : submitLabel}</Button>
    </form>
  );
}
