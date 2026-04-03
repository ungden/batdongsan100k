const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('web/.env.local', 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('saved_listings').select('*').limit(1);
  console.log('Query saved_listings:', error?.message || 'Success', Object.keys(data?.[0] || {}));
}
test();
