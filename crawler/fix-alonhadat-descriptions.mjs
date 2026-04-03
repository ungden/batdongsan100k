import { createClient } from "@supabase/supabase-js";

// Exact regex from the crawler logic for Alonhadat
const ALONHADAT_REGEX = /\.{3,}\s*<<\s*Xem chi tiết\s*>>/gi;

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Searching for listings with Alonhadat signature in descriptions...");
  
  let offset = 0;
  const limit = 1000;
  let totalFixed = 0;

  while (true) {
    const { data: listings, error } = await supabase
      .from('properties')
      .select('id, description')
      .ilike('description', '%Xem chi tiết%')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error fetching listings at offset ${offset}:`, error);
      break;
    }

    if (!listings || listings.length === 0) {
      break;
    }

    let batchFixed = 0;
    
    for (const listing of listings) {
      if (!listing.description) continue;
      
      const newDescription = listing.description.replace(ALONHADAT_REGEX, "").trim();
      
      // If the description was modified
      if (newDescription !== listing.description) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ description: newDescription })
          .eq('id', listing.id);
          
        if (updateError) {
          console.error(`Failed to update listing ID ${listing.id}:`, updateError);
        } else {
          batchFixed++;
          totalFixed++;
        }
      }
    }

    console.log(`Processed batch ${offset} to ${offset + limit - 1}. Fixed: ${batchFixed}`);

    if (listings.length < limit) {
      break;
    }
    
    // Increment offset for the next page
    offset += limit;
  }

  console.log(`\nScript complete! Total descriptions fixed: ${totalFixed}`);
}

main().catch(console.error);
