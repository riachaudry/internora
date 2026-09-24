import { createHash, randomBytes } from 'crypto';

/** Human-readable public IDs. The UUID primary key stays internal. */
export const ID_PREFIX = {
  student: 'INT-STU',
  offerLetter: 'INT-OL',
  certificate: 'INT-CERT',
  lor: 'INT-LOR',
} as const;

export const taskCode = (week: number, task: number) =>
  `INT-TSK-W${week}-${String(task).padStart(2, '0')}`;

/** Invitation tokens: the raw token is emailed, only its hash is stored. */
export function createInviteToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}
export const hashToken = (token: string) =>
  createHash('sha256').update(`${token}${process.env.INVITE_TOKEN_SECRET ?? ''}`).digest('hex');

export const hashIp = (ip: string) => createHash('sha256').update(ip).digest('hex').slice(0, 32);

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
