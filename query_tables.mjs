import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grwuamsiofeubgefliea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyd3VhbXNpb2ZldWJnZWZsaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTcwNjUsImV4cCI6MjA5MDQ3MzA2NX0.wI1ctlVlmc-zi_ubzkNriK6py9YhX2X39qrLoNf4DcU'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const tables = ['properties', 'projects', 'listings', 'districts']
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      console.log(`${t}: ERROR - ${error.message}`)
    } else {
      console.log(`${t}: EXISTS`)
    }
  }
}
run()
