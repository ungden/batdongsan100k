import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function check() {
  const tables = ['properties', 'listings', 'saved_listings', 'saved_properties', 'favorites', 'agents', 'user_profiles']
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`Table ${table} Error:`, error.message)
    } else {
      console.log(`Table ${table} Exists!`)
    }
  }
}

check()
