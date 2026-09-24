import 'server-only';
import { createAdminClient } from './supabase/admin';
import { hashIp } from './ids';

export async function audit(
  actorId: string | null, action: string, entity: string,
  entityId?: string, meta: Record<string, unknown> = {}, ip?: string | null,
) {
  const db = createAdminClient();
  await db.from('audit_logs').insert({
    actor_id: actorId, action, entity, entity_id: entityId ?? null,
    meta, ip_hash: ip ? hashIp(ip) : null,
  });
}
