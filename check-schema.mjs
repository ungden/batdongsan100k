const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
async function check() {
  const res = await fetch(`${url}/properties?limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }});
  const data = await res.json();
  console.log(Object.keys(data[0]));
}
check();
