const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  const tables = ['properties', 'listings', 'saved_listings', 'saved_properties', 'favorites', 'agents', 'user_profiles'];
  for (const table of tables) {
    const res = await fetch(`${url}/${table}?limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`Table ${table} Exists!`);
    } else {
      console.log(`Table ${table} Error: ${data.message || res.status}`);
    }
  }
}
check();
