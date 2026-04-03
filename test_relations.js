const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('web/.env.local', 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function test() {
  const queries = [
    '*, user_profiles(*)',
    '*, profiles(*)',
    '*, users(*)',
    '*, author(*)',
    '*, agent(*)'
  ];

  for (let q of queries) {
    const { data, error } = await supabase.from('properties').select(q).limit(1);
    if (error) {
      console.log(`Query ${q} failed: ${error.message}`);
    } else {
      console.log(`Query ${q} succeeded! Data keys:`, Object.keys(data[0] || {}));
    }
  }
}
test();
