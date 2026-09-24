import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export type SessionProfile = {
  id: string; role: 'student' | 'admin'; full_name: string; email: string;
  student_id: string | null; username: string | null; avatar_url: string | null;
  public_profile: boolean;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, student_id, username, avatar_url, public_profile')
    .eq('id', user.id)
    .single();
  return (data as SessionProfile) ?? null;
}

/** Use at the top of every student page and student API route. */
export async function requireStudent() {
  const profile = await getSessionProfile();
  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin');
  return profile;
}

/** Use at the top of every admin page. Never trust a client-side role check. */
export async function requireAdmin() {
  const profile = await getSessionProfile();
  if (!profile) redirect('/login');
  if (profile.role !== 'admin') redirect('/dashboard');
  return profile;
}

/** API-route variants: throw instead of redirecting. */
export async function apiUser() {
  const profile = await getSessionProfile();
  if (!profile) throw new HttpError(401, 'Sign in to continue.');
  return profile;
}
export async function apiAdmin() {
  const profile = await apiUser();
  if (profile.role !== 'admin') throw new HttpError(403, 'Admin access only.');
  return profile;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
