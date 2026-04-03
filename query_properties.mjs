import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grwuamsiofeubgefliea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyd3VhbXNpb2ZldWJnZWZsaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTcwNjUsImV4cCI6MjA5MDQ3MzA2NX0.wI1ctlVlmc-zi_ubzkNriK6py9YhX2X39qrLoNf4DcU'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const counts = {}
  let page = 0
  let hasMore = true
  while (hasMore) {
    const { data, error } = await supabase.from('properties').select('category, type, status').range(page * 1000, (page + 1) * 1000 - 1)
    if (error) {
      console.error(error)
      break
    }
    if (data.length === 0) {
      hasMore = false
    } else {
      data.forEach(l => {
        // "category" in properties is like transaction_type in listings? Let's see
        const key = `${l.category} | ${l.type} | ${l.status}`
        counts[key] = (counts[key] || 0) + 1
      })
      page++
    }
  }
  console.log('Counts:', counts)
  
  // also check what 1 row looks like
  const { data: row } = await supabase.from('properties').select('*').limit(1)
  console.log('Sample row:', row[0])
}
run()
