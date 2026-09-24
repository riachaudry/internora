import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXT = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'zip', 'txt'];
export const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp'];

export function checkFile(name: string, size: number, allowed = ALLOWED_UPLOAD_EXT, maxBytes = MAX_UPLOAD_BYTES) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!allowed.includes(ext)) return { ok: false as const, error: `Only ${allowed.join(', ')} files are accepted.` };
  if (size > maxBytes) return { ok: false as const, error: `Files must be under ${Math.round(maxBytes / 1048576)} MB.` };
  return { ok: true as const, ext };
}

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Enter your full name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(7, 'Enter a valid phone number.').max(20),
  whatsapp: z.string().min(7, 'Enter a valid WhatsApp number.').max(20),
  password: z.string().min(8, 'Use at least 8 characters.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[0-9]/, 'Include a number.'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  city: z.string().min(2).max(60),
  country: z.string().min(2).max(60),
  education_level: z.string().min(2).max(60),
  university: z.string().min(2).max(120),
  field_of_study: z.string().min(2).max(120),
  bio: z.string().max(600).optional(),
  skills: z.array(z.string().max(40)).max(20).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  invite_token: z.string().optional(),
});

export const applicationSchema = z.object({
  field_slug: z.string().min(2),
  duration: z.union([z.literal(4), z.literal(6), z.literal(8)]),
});

export const paymentSchema = z.object({
  application_id: z.string().uuid(),
  method: z.enum(['jazzcash', 'easypaisa']),
  transaction_id: z.string().min(4, 'Enter the transaction ID from your receipt.').max(60),
  payment_date: z.string(),
  amount_pkr: z.number().int().positive(),
  screenshot_url: z.string().min(4, 'Upload your payment screenshot.'),
});

export const submissionSchema = z.object({
  task_id: z.string().uuid(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  url: z.string().url('Enter a valid link.').optional().or(z.literal('')),
  text_response: z.string().max(20000).optional(),
  comments: z.string().max(2000).optional(),
}).refine((v) => v.file_url || v.url || v.text_response, {
  message: 'Attach a file, paste a link, or write your response.',
});

export const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'revision_required']),
  score: z.number().int().min(0).max(100).optional(),
  feedback: z.string().max(4000).optional(),
});

export const ticketSchema = z.object({
  subject: z.string().min(4).max(120),
  message: z.string().min(10).max(4000),
  attachment_url: z.string().optional(),
});

export const inviteSchema = z.object({
  full_name: z.string().min(3).max(80),
  email: z.string().email(),
});
