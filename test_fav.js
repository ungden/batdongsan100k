const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('web/.env.local', 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('saved_properties').select('listing_id, listings(*)').limit(1);
  console.log('Query with listings(*):', error?.message || 'Success');

  const { data: d2, error: e2 } = await supabase.from('saved_properties').select('property_id, properties(*)').limit(1);
  console.log('Query with properties(*):', e2?.message || 'Success');
  
  const { data: d3, error: e3 } = await supabase.from('saved_properties').select('*').limit(1);
  console.log('Columns:', Object.keys(d3?.[0] || {}));
}
test();
