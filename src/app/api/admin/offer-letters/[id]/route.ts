import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { issueOfferLetter } from '@/lib/services/internship';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  action: z.enum(['edit_dates', 'regenerate', 'revoke', 'reinstate']),
  issue_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const body = parsed.data;

    const db = createAdminClient();
    const { data: letter } = await db.from('offer_letters')
      .select('id, internship_id').eq('id', params.id).single();
    if (!letter) return fail(new Error('Offer letter not found.'));

    if (body.action === 'edit_dates') {
      if (body.issue_date) {
        await db.from('offer_letters').update({ issue_date: body.issue_date }).eq('id', letter.id);
      }
      if (body.start_date || body.end_date) {
        await db.from('internships').update({
          ...(body.start_date ? { start_date: body.start_date } : {}),
          ...(body.end_date ? { end_date: body.end_date } : {}),
        }).eq('id', letter.internship_id);
      }
    } else if (body.action === 'revoke') {
      await db.from('offer_letters')
        .update({ status: 'revoked', revoked_reason: body.reason ?? null }).eq('id', letter.id);
    } else if (body.action === 'reinstate') {
      await db.from('offer_letters').update({ status: 'issued', revoked_reason: null }).eq('id', letter.id);
    } else {
      await issueOfferLetter(letter.internship_id);
    }

    await audit(admin.id, `offer_letter.${body.action}`, 'offer_letter', letter.id, body);
    return ok();
  } catch (e) { return fail(e); }
}
