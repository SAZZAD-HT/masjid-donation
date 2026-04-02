// lib/db.js
// Supabase client — replaces better-sqlite3
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

// Singleton: reuse across hot-reloads in dev
let supabase;
if (process.env.NODE_ENV === 'production') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  if (!globalThis.__supabase) {
    globalThis.__supabase = createClient(supabaseUrl, supabaseKey);
  }
  supabase = globalThis.__supabase;
}

export default supabase;
