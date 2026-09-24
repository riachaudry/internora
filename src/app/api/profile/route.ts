import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ok, fail, zodFail } from '../_lib';

const patchSchema = z.object({
  full_name: z.string().min(3).max(80).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  city: z.string().max(60).optional(),
  country: z.string().max(60).optional(),
  education_level: z.string().max(60).optional(),
  university: z.string().max(120).optional(),
  field_of_study: z.string().max(120).optional(),
  bio: z.string().max(600).optional(),
  skills: z.array(z.string().max(40)).max(20).optional(),
  linkedin_url: z.string().url().or(z.literal('')).optional(),
  portfolio_url: z.string().url().or(z.literal('')).optional(),
  avatar_url: z.string().optional(),
  public_profile: z.boolean().optional(),
});

/** Role, student_id and username are deliberately not patchable here. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await apiUser();
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);

    const { error } = await createClient().from('profiles').update(parsed.data).eq('id', user.id);
    if (error) return fail(new Error(error.message));
    return ok();
  } catch (e) { return fail(e); }
}
