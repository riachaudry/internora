import { NextResponse } from 'next/server';
import { HttpError } from '@/lib/auth';

export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);

export function fail(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
  const message = e instanceof Error ? e.message : 'Something went wrong. Try again.';
  console.error('[api]', e);
  return NextResponse.json({ error: message }, { status: 400 });
}

export function zodFail(issues: { message: string }[]) {
  return NextResponse.json({ error: issues[0]?.message ?? 'Check the form and try again.' }, { status: 422 });
}
