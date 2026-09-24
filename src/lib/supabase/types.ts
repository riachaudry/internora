/**
 * Minimal hand-written typing. Regenerate the full version with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 */
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
export type Database = any;

export type Role = 'student' | 'admin';
export type TaskStatus =
  | 'locked' | 'available' | 'in_progress' | 'submitted'
  | 'under_review' | 'revision_required' | 'approved' | 'rejected' | 'overdue';
export type WeekStatus = 'locked' | 'active' | 'completed';
export type PaymentStatus =
  | 'submitted' | 'under_verification' | 'verified'
  | 'rejected' | 'correction_requested' | 'refunded';
export type ApplicationStatus =
  | 'draft' | 'submitted' | 'payment_submitted' | 'under_verification'
  | 'approved' | 'rejected' | 'cancelled';
