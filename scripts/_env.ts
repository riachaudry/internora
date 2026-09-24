import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Minimal .env.local loader so the scripts run with plain `tsx`. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = (match[2] ?? '').trim();
      if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadEnv();

export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    console.error('Copy .env.example to .env.local and fill in your Supabase credentials first.\n');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const log = (...args: unknown[]) => console.log('·', ...args);
export const done = (...args: unknown[]) => console.log('✓', ...args);
