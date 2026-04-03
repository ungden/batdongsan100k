import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('./web/.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

// We MUST create table via an RPC function or a known migration mechanism if REST schema creation isn't supported, 
// BUT you CANNOT execute raw SQL via standard @supabase/supabase-js.
// However, since we can't create tables via standard REST, I will use Postgres REST RPC if it exists, or just use the built-in postgres-fetch module.
// Wait, we can't create tables directly with REST API. We MUST use `postgres` or `pg` module to connect directly via a connection string.
