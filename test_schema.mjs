import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getTables() {
  const { data, error } = await supabase.rpc('get_tables_rpc')
  console.log("RPC get_tables_rpc:", data, error)
}
getTables()
