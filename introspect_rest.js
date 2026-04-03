const fs = require('fs');

const envContent = fs.readFileSync('web/.env.local', 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

async function test() {
  const openapiRes = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const schema = await openapiRes.json();
  fs.writeFileSync('openapi.json', JSON.stringify(schema, null, 2));
}
test();
