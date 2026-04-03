import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grwuamsiofeubgefliea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyd3VhbXNpb2ZldWJnZWZsaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTcwNjUsImV4cCI6MjA5MDQ3MzA2NX0.wI1ctlVlmc-zi_ubzkNriK6py9YhX2X39qrLoNf4DcU'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('--- 1. Checking projects table ---')
  const { data: projects, error: err1 } = await supabase.from('projects').select('*').limit(1)
  if (err1) console.error('Error fetching projects:', err1)
  else console.log('Projects:', projects)

  console.log('\n--- 2. Grouping listings by category and transaction_type ---')
  // We fetch all records with only the required columns
  let allListings = []
  let page = 0
  let hasMore = true
  while (hasMore) {
    const { data, error } = await supabase.from('listings').select('category, transaction_type').range(page * 1000, (page + 1) * 1000 - 1)
    if (error) {
      console.error('Error fetching listings:', error)
      break
    }
    if (data.length === 0) {
      hasMore = false
    } else {
      allListings = allListings.concat(data)
      page++
    }
  }

  const counts = {}
  allListings.forEach(l => {
    const key = `${l.category} | ${l.transaction_type}`
    counts[key] = (counts[key] || 0) + 1
  })
  console.log('Counts:', counts)
}

run()
