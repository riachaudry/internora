/**
 * Creates (or promotes) an administrator account.
 *
 *   npm run create:admin -- admin@example.com "Rahat Chaudhry" "StrongPass123"
 *
 * The password is only ever sent to Supabase Auth, which hashes it.
 */
import { adminDb, done } from './_env';

async function main() {
  const [email, fullName, password] = process.argv.slice(2);
  if (!email || !fullName || !password) {
    console.error('\nUsage: npm run create:admin -- <email> "<Full Name>" "<password>"\n');
    process.exit(1);
  }

  const db = adminDb();

  const { data: existing } = await db.from('profiles').select('id').eq('email', email).maybeSingle();

  if (existing) {
    const { error } = await db.from('profiles')
      .update({ role: 'admin', full_name: fullName }).eq('id', existing.id);
    if (error) throw new Error(error.message);
    done(`${email} promoted to admin.`);
    return;
  }

  const { data: created, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(error.message);

  // The handle_new_user trigger has already created the profile row.
  const { error: roleError } = await db.from('profiles')
    .update({ role: 'admin', full_name: fullName }).eq('id', created.user.id);
  if (roleError) throw new Error(roleError.message);

  done(`Admin account created for ${email}. Sign in at /login.`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
